export const PAYMENT_PENDING_ORDER_STATUS = "payment_pending";
export const PAYMENT_SETTLEMENT_ELIGIBLE_STATUSES = ["pending", "failed"] as const;
export const ONLINE_PAYMENT_INITIAL_STATE = {
  paymentStatus: "pending",
  orderStatus: PAYMENT_PENDING_ORDER_STATUS,
} as const;

export type UnpaidPaymentOutcome = "failed" | "cancelled";

export function paymentOutcomeUpdate(outcome: UnpaidPaymentOutcome) {
  if (outcome === "failed") {
    return {
      paymentStatus: "failed",
      orderStatus: PAYMENT_PENDING_ORDER_STATUS,
    } as const;
  }

  // Dismissing the Razorpay modal is an order cancellation, not proof that
  // payment failed. A delayed, verified capture can still settle the order.
  return { orderStatus: "cancelled" } as const;
}

export function isOrderReceivable(
  paymentStatus: string,
  paymentMethod: string | null,
): boolean {
  return paymentStatus === "paid" || paymentMethod?.toLowerCase() === "cod";
}

export function isRazorpayOnlineOrder(razorpayOrderId: string | null): boolean {
  return Boolean(razorpayOrderId);
}