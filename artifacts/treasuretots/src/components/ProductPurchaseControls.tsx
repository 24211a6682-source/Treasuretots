import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPurchaseControlsProps {
  quantity: number;
  isInCart: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onAddToCart: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onRemoveFromCart: () => void;
  onBuyNow: () => void;
}

export function ProductPurchaseControls({
  quantity,
  isInCart,
  isAdding,
  isUpdating,
  isRemoving,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
  onBuyNow,
}: ProductPurchaseControlsProps) {
  const isCartBusy = isAdding || isUpdating || isRemoving;

  return (
    <div className="mb-6 sm:mb-8">
      {isInCart ? (
        <div
          className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border bg-white shadow-sm sm:max-w-sm"
          role="group"
          aria-label="Cart quantity"
        >
          <button
            type="button"
            aria-label={quantity > 1 ? "Decrease quantity" : "Remove from cart"}
            onClick={quantity > 1 ? onDecreaseQuantity : onRemoveFromCart}
            disabled={isCartBusy}
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 border-r px-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            {quantity > 1 ? (
              <span className="text-lg leading-none" aria-hidden="true">−</span>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Remove</span>
              </>
            )}
          </button>
          <span
            className="flex w-16 shrink-0 items-center justify-center px-2 font-semibold text-gray-900"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={onIncreaseQuantity}
            disabled={isCartBusy}
            className="flex min-w-0 flex-1 items-center justify-center border-l px-2 text-lg font-semibold text-gray-700 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            +
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-xl text-base shadow-sm sm:max-w-sm"
          onClick={onAddToCart}
          disabled={isCartBusy}
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </Button>
      )}
      <Button
        type="button"
        size="lg"
        className="mt-3 h-12 w-full rounded-xl text-base shadow-sm sm:max-w-sm"
        onClick={onBuyNow}
        disabled={isCartBusy}
      >
        Buy {quantity} Now
      </Button>
    </div>
  );
}