const BUY_NOW_INTENT_KEY = "tt_buy_now_intent";
const INTENT_TTL_MS = 30 * 60 * 1000;

export interface BuyNowIntent {
  productId: number;
  quantity: number;
  childName?: string;
  createdAt: number;
}

export function saveBuyNowIntent(input: Omit<BuyNowIntent, "createdAt">): void {
  const intent: BuyNowIntent = {
    productId: input.productId,
    quantity: input.quantity,
    childName: input.childName?.trim() || undefined,
    createdAt: Date.now(),
  };
  localStorage.setItem(BUY_NOW_INTENT_KEY, JSON.stringify(intent));
}

export function readBuyNowIntent(): BuyNowIntent | null {
  const raw = localStorage.getItem(BUY_NOW_INTENT_KEY);
  if (!raw) return null;

  try {
    const intent = JSON.parse(raw) as Partial<BuyNowIntent>;
    const isValid =
      Number.isInteger(intent.productId) &&
      Number(intent.productId) > 0 &&
      Number.isInteger(intent.quantity) &&
      Number(intent.quantity) > 0 &&
      typeof intent.createdAt === "number" &&
      Date.now() - intent.createdAt <= INTENT_TTL_MS &&
      (intent.childName === undefined || typeof intent.childName === "string");

    if (!isValid) {
      clearBuyNowIntent();
      return null;
    }

    return intent as BuyNowIntent;
  } catch {
    clearBuyNowIntent();
    return null;
  }
}

export function clearBuyNowIntent(): void {
  localStorage.removeItem(BUY_NOW_INTENT_KEY);
}