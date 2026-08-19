import {
  cartItemsTable,
  db,
  orderItemsTable,
  ordersTable,
  productsTable,
} from "@workspace/db";
import { and, eq, gt, gte, inArray, lte, sql } from "drizzle-orm";

const CART_LOCK_NAMESPACE = 62144;

export interface PaymentSettlementInput {
  orderId: number;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  paymentMethod?: string | null;
}

export interface PaymentSettlementResult {
  order: typeof ordersTable.$inferSelect | null;
  newlyPaid: boolean;
}

/**
 * Commits a paid order and its downstream state as one transaction. The cart
 * lock serializes this against cart edits so a completed payment can only
 * remove the quantities that were actually included in the order.
 */
export async function settlePaidOrder(
  input: PaymentSettlementInput,
): Promise<PaymentSettlementResult> {
  return db.transaction(async (tx) => {
    const [initialOrder] = await tx
      .select({ id: ordersTable.id, userId: ordersTable.userId })
      .from(ordersTable)
      .where(eq(ordersTable.id, input.orderId))
      .limit(1);

    if (!initialOrder) {
      return { order: null, newlyPaid: false };
    }

    // Cart mutations use this same lock. The order ID is a safe fallback for
    // legacy guest orders that do not have an owning user.
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${initialOrder.userId ?? -initialOrder.id})`,
    );

    // Re-read after acquiring the lock so retries and webhooks see the newest
    // committed order state.
    const [currentOrder] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, input.orderId))
      .limit(1);

    if (!currentOrder) {
      return { order: null, newlyPaid: false };
    }

    if (currentOrder.paymentStatus === "paid") {
      // Webhooks often arrive after browser verification. Preserve the paid
      // state while filling in the method if the webhook has richer metadata.
      if (input.paymentMethod && !currentOrder.paymentMethod) {
        const [enrichedOrder] = await tx
          .update(ordersTable)
          .set({ paymentMethod: input.paymentMethod })
          .where(eq(ordersTable.id, currentOrder.id))
          .returning();
        return { order: enrichedOrder, newlyPaid: false };
      }
      return { order: currentOrder, newlyPaid: false };
    }

    const [paidOrder] = await tx
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
        orderStatus: "order_received",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature ?? null,
        paymentMethod: input.paymentMethod ?? null,
        paidAt: new Date(),
      })
      .where(
        and(
          eq(ordersTable.id, currentOrder.id),
          inArray(ordersTable.paymentStatus, ["pending", "failed"]),
        ),
      )
      .returning();

    if (!paidOrder) {
      return { order: currentOrder, newlyPaid: false };
    }

    const orderItems = await tx
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, paidOrder.id));

    for (const item of orderItems) {
      if (!item.productId) continue;

      const decremented = await tx
        .update(productsTable)
        .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
        .where(
          and(
            eq(productsTable.id, item.productId),
            gte(productsTable.stock, item.quantity),
          ),
        )
        .returning();

      if (decremented.length === 0) {
        // A captured payment is authoritative. Keep settlement atomic even
        // when stock has drifted; fulfillment can reconcile the stock issue
        // without leaving a paid customer with a pending order or stale cart.
        continue;
      }
    }

    // Direct Buy Now orders never claim items from the customer's normal cart.
    // Regular cart orders subtract only the quantities captured in this order,
    // preserving later additions or unrelated products.
    if (paidOrder.userId && paidOrder.purchaseMode !== "buy_now") {
      for (const item of orderItems) {
        if (!item.productId) continue;

        const cartItemCondition = and(
          eq(cartItemsTable.userId, paidOrder.userId),
          eq(cartItemsTable.productId, item.productId),
        );

        await tx
          .update(cartItemsTable)
          .set({ quantity: sql`${cartItemsTable.quantity} - ${item.quantity}` })
          .where(and(cartItemCondition, gt(cartItemsTable.quantity, item.quantity)));

        await tx
          .delete(cartItemsTable)
          .where(and(cartItemCondition, lte(cartItemsTable.quantity, item.quantity)));
      }
    }

    return { order: paidOrder, newlyPaid: true };
  });
}