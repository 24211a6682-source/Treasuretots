import type { Dispatch, SetStateAction } from "react";
import { Check, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductPurchaseControlsProps {
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  showAdded: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onBuyNow: () => void;
}

export function ProductPurchaseControls({
  quantity,
  setQuantity,
  showAdded,
  isAdding,
  isRemoving,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
}: ProductPurchaseControlsProps) {
  return (
    <>
      <div className="mb-5 sm:mb-8">
        <div
          className="inline-flex h-11 w-full items-center justify-between overflow-hidden rounded-lg border bg-white sm:w-auto"
          aria-label="Quantity"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            className="flex h-full w-12 items-center justify-center text-lg text-gray-600 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span
            className="min-w-14 px-2 text-center font-semibold text-gray-900"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((current) => current + 1)}
            className="flex h-full w-12 items-center justify-center text-lg text-gray-600 transition-colors hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>

      <div className="hidden grid-cols-1 gap-3 mb-8 sm:grid sm:grid-cols-2">
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "w-full text-lg h-14 rounded-xl shadow-sm gap-2",
            showAdded && "border-green-600 text-green-700 hover:text-green-700",
          )}
          onClick={onAddToCart}
          disabled={isAdding || isRemoving || showAdded}
        >
          {showAdded ? (
            <>
              <Check className="h-5 w-5" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </>
          )}
        </Button>
        {showAdded && (
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg h-14 rounded-xl shadow-sm gap-2 text-destructive hover:text-destructive"
            onClick={onRemoveFromCart}
            disabled={isRemoving}
          >
            <Trash2 className="h-5 w-5" /> Remove from Cart
          </Button>
        )}
        <Button
          size="lg"
          className="w-full text-lg h-14 rounded-xl shadow-sm"
          onClick={onBuyNow}
        >
          Buy Now
        </Button>
      </div>

      <div className="flex flex-col gap-2 mb-6 sm:hidden">
        <Button
          className="h-11 w-full rounded-xl text-base shadow-sm"
          onClick={onBuyNow}
        >
          Buy {quantity} now
        </Button>
        {showAdded ? (
          <div className="flex min-h-9 items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50/60 px-3 py-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" /> Added to Cart
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:text-destructive"
              onClick={onRemoveFromCart}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full rounded-lg gap-2"
            onClick={onAddToCart}
            disabled={isAdding || isRemoving}
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
        )}
      </div>
    </>
  );
}