import assert from "node:assert/strict";
import test from "node:test";
import {
  isOrderReceivable,
  isRazorpayOnlineOrder,
  ONLINE_PAYMENT_INITIAL_STATE,
  PAYMENT_PENDING_ORDER_STATUS,
  PAYMENT_SETTLEMENT_ELIGIBLE_STATUSES,
  paymentOutcomeUpdate,
} from "./order-status";

test("online payment orders begin pending and not received", () => {
  assert.deepEqual(ONLINE_PAYMENT_INITIAL_STATE, {
    paymentStatus: "pending",
    orderStatus: PAYMENT_PENDING_ORDER_STATUS,
  });
  assert.equal(isOrderReceivable("pending", null), false);
});

test("verified Razorpay settlement remains eligible after a failed attempt", () => {
  assert.deepEqual(PAYMENT_SETTLEMENT_ELIGIBLE_STATUSES, ["pending", "failed"]);
  assert.equal(isOrderReceivable("paid", null), true);
});

test("a failed Razorpay attempt remains a non-received order", () => {
  assert.deepEqual(paymentOutcomeUpdate("failed"), {
    paymentStatus: "failed",
    orderStatus: PAYMENT_PENDING_ORDER_STATUS,
  });
});

test("a dismissed Razorpay checkout cancels the order without claiming payment failed", () => {
  assert.deepEqual(paymentOutcomeUpdate("cancelled"), { orderStatus: "cancelled" });
  assert.equal(isOrderReceivable("pending", null), false);
});

test("Cash on Delivery remains a valid unpaid received order", () => {
  assert.equal(isOrderReceivable("pending", "cod"), true);
  assert.equal(isRazorpayOnlineOrder(null), false);
  assert.equal(isRazorpayOnlineOrder("order_razorpay"), true);
});