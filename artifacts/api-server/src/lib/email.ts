import { Resend } from "resend";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
// The "from" address must be a verified domain in your Resend account.
// Falls back to Resend's shared testing domain when not configured.
const FROM_EMAIL = process.env.FROM_EMAIL ?? "TreasureTots <onboarding@resend.dev>";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

type EmailLogger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendPasswordResetEmail(
  input: { email: string; name: string; resetUrl: string },
  logger?: EmailLogger,
): Promise<boolean> {
  const client = getResend();
  if (!client) {
    logger?.warn("RESEND_API_KEY not set — skipping password reset email");
    return false;
  }

  const safeName = escapeHtml(input.name);
  const safeResetUrl = escapeHtml(input.resetUrl);

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: "Reset your TreasureTots password",
      text: `Hi ${input.name},\n\nUse this link to reset your TreasureTots password:\n${input.resetUrl}\n\nThis link expires in one hour and can only be used once. If you did not request this, you can ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Reset your password</title></head>
          <body style="margin:0;padding:0;background:#fff8f0;font-family:Arial,sans-serif;color:#3b2a14;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;">
              <tr><td align="center" style="padding:32px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
                  <tr><td style="background:#e8623a;padding:24px 32px;text-align:center;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;">TreasureTots Creations</h1>
                  </td></tr>
                  <tr><td style="padding:32px;">
                    <h2 style="margin:0 0 12px;color:#e8623a;">Reset your password</h2>
                    <p style="line-height:1.6;">Hi ${safeName}, we received a request to reset your password.</p>
                    <p style="margin:28px 0;text-align:center;">
                      <a href="${safeResetUrl}" style="display:inline-block;background:#e8623a;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:8px;">Choose a new password</a>
                    </p>
                    <p style="font-size:13px;line-height:1.6;color:#666;">This link expires in one hour and can only be used once. If you did not request this, you can safely ignore this email.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });

    if ("error" in result && result.error) {
      logger?.error({ error: result.error }, "Resend password reset email error");
      return false;
    }

    logger?.info("Password reset email sent");
    return true;
  } catch (err) {
    logger?.error({ err }, "Failed to send password reset email");
    return false;
  }
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string | null;
  childName: string | null;
  shippingAddress: unknown;
  totalAmount: string;
  paidAt: Date | null;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

/**
 * Fetch all data needed to build the confirmation email for a given order.
 * Returns null if the order or user cannot be found.
 */
export async function buildOrderEmailData(orderId: number): Promise<OrderEmailData | null> {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) return null;

  const [user] = order.userId
    ? await db.select().from(usersTable).where(eq(usersTable.id, order.userId)).limit(1)
    : [null];

  const items = await db
    .select({
      name: productsTable.name,
      quantity: orderItemsTable.quantity,
      price: orderItemsTable.price,
    })
    .from(orderItemsTable)
    .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    orderId,
    customerName: user?.name ?? "Customer",
    customerEmail: user?.email ?? null,
    childName: order.childName ?? null,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    paidAt: order.paidAt,
    items: items.map((i) => ({
      name: i.name ?? "Product",
      quantity: i.quantity,
      price: i.price,
    })),
  };
}

function formatAddress(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "—";
  const addr = raw as ShippingAddress;
  return [addr.name, addr.line1, addr.line2, addr.city, addr.state, addr.pincode, addr.phone]
    .filter(Boolean)
    .join(", ");
}

function buildCustomerHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;border-bottom:1px solid #f0e6d3;">${item.name}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0e6d3;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0e6d3;text-align:right;">₹${Number(item.price).toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#fff8f0;font-family:Georgia,serif;color:#3b2a14;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#e8623a;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">🎁 TreasureTots Creations</h1>
          <p style="margin:8px 0 0;color:#ffe0d6;font-size:14px;">Handcrafted gifts for little ones</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#e8623a;">Order Confirmed! 🎉</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
            Hi ${data.customerName}, thank you for your order! We've received your payment and will start preparing your gift right away.
          </p>

          <!-- Order summary box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
            <tr>
              <td style="font-size:13px;color:#888;padding-bottom:4px;">Order ID</td>
              <td style="font-size:13px;color:#888;padding-bottom:4px;text-align:right;">Date</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:bold;color:#3b2a14;">#${data.orderId}</td>
              <td style="font-size:14px;color:#3b2a14;text-align:right;">${data.paidAt ? new Date(data.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}</td>
            </tr>
            ${data.childName ? `<tr><td colspan="2" style="padding-top:12px;font-size:14px;color:#3b2a14;">🧒 Gift for: <strong>${data.childName}</strong></td></tr>` : ""}
          </table>

          <!-- Items -->
          <h3 style="margin:0 0 12px;font-size:15px;color:#3b2a14;border-bottom:2px solid #f0e6d3;padding-bottom:8px;">Items Ordered</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">
              <td style="padding-bottom:6px;">Product</td>
              <td style="padding-bottom:6px;text-align:center;">Qty</td>
              <td style="padding-bottom:6px;text-align:right;">Price</td>
            </tr>
            ${itemRows}
            <tr>
              <td colspan="2" style="padding-top:12px;font-size:15px;font-weight:bold;color:#3b2a14;">Total Paid</td>
              <td style="padding-top:12px;font-size:16px;font-weight:bold;color:#e8623a;text-align:right;">₹${Number(data.totalAmount).toFixed(2)}</td>
            </tr>
          </table>

          <!-- Shipping -->
          <h3 style="margin:0 0 8px;font-size:15px;color:#3b2a14;border-bottom:2px solid #f0e6d3;padding-bottom:8px;">Shipping Address</h3>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">${formatAddress(data.shippingAddress)}</p>

          <!-- Delivery estimate -->
          <table width="100%" cellpadding="16" cellspacing="0" style="background:#fff3ee;border-radius:8px;border-left:4px solid #e8623a;margin-bottom:24px;">
            <tr><td>
              <strong style="font-size:14px;color:#e8623a;">🚚 Estimated Delivery</strong><br>
              <span style="font-size:13px;color:#555;line-height:1.6;">Your handcrafted gift will typically be delivered within <strong>5–7 business days</strong>. You'll receive a shipping update once it's dispatched.</span>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
            Questions? Reply to this email or reach us at <a href="mailto:${ADMIN_EMAIL || "support@treasuretots.in"}" style="color:#e8623a;">${ADMIN_EMAIL || "support@treasuretots.in"}</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f0e6d3;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} TreasureTots Creations · Handmade with ❤️</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminHtml(data: OrderEmailData): string {
  const itemList = data.items
    .map((i) => `<li>${i.name} × ${i.quantity} — ₹${Number(i.price).toFixed(2)}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order Notification</title></head>
<body style="font-family:Arial,sans-serif;color:#333;padding:20px;">
  <h2>🛒 New Order #${data.orderId}</h2>
  <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail ?? "no email"})</p>
  <p><strong>Child's name:</strong> ${data.childName ?? "—"}</p>
  <p><strong>Shipping address:</strong> ${formatAddress(data.shippingAddress)}</p>
  <p><strong>Items:</strong></p>
  <ul>${itemList}</ul>
  <p><strong>Total paid:</strong> ₹${Number(data.totalAmount).toFixed(2)}</p>
  <p><strong>Paid at:</strong> ${data.paidAt ? new Date(data.paidAt).toISOString() : "—"}</p>
</body>
</html>`;
}

/**
 * Send order confirmation email to the customer (and optionally the admin).
 * Safe to call multiple times — silently no-ops when email is unconfigured or
 * when the customer has no email address on file.
 */
export async function sendOrderConfirmation(
  orderId: number,
  logger?: EmailLogger,
): Promise<void> {
  const client = getResend();
  if (!client) {
    logger?.warn({ orderId }, "RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  let data: OrderEmailData | null;
  try {
    data = await buildOrderEmailData(orderId);
  } catch (err) {
    logger?.error({ err, orderId }, "Failed to build order email data");
    return;
  }

  if (!data) {
    logger?.warn({ orderId }, "Order not found when building confirmation email");
    return;
  }

  const emailPromises: Promise<unknown>[] = [];

  // Customer confirmation
  if (data.customerEmail) {
    emailPromises.push(
      client.emails.send({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: `Your TreasureTots order #${orderId} is confirmed! 🎁`,
        html: buildCustomerHtml(data),
      }).then((result) => {
        if ("error" in result && result.error) {
          logger?.error({ orderId, error: result.error }, "Resend customer email error");
        } else {
          logger?.info({ orderId, email: data!.customerEmail }, "Order confirmation email sent to customer");
        }
      }).catch((err) => {
        logger?.error({ err, orderId }, "Failed to send customer confirmation email");
      }),
    );
  } else {
    logger?.info({ orderId }, "Customer has no email address — skipping customer confirmation");
  }

  // Admin notification
  if (ADMIN_EMAIL) {
    emailPromises.push(
      client.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New order #${orderId} — ₹${Number(data.totalAmount).toFixed(2)} from ${data.customerName}`,
        html: buildAdminHtml(data),
      }).then((result) => {
        if ("error" in result && result.error) {
          logger?.error({ orderId, error: result.error }, "Resend admin email error");
        } else {
          logger?.info({ orderId, adminEmail: ADMIN_EMAIL }, "Order notification email sent to admin");
        }
      }).catch((err) => {
        logger?.error({ err, orderId }, "Failed to send admin notification email");
      }),
    );
  }

  await Promise.all(emailPromises);
}
