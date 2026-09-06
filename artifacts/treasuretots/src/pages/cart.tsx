import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Cart() {
  const { cart, isLoading, updateQuantity, removeItem, hasUnavailableItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const availableItems = cart.items.filter((item) => item.product);
  const unavailableItemCount = cart.items
    .filter((item) => !item.product)
    .reduce((sum, item) => sum + item.quantity, 0);
  const shipping = availableItems.length > 0 ? 70 : 0;

  const handleCheckout = () => {
    if (isAuthenticated) {
      setLocation("/checkout");
    } else {
      setLocation("/login?returnUrl=/checkout");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="w-full rounded-full">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {hasUnavailableItems && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some saved items are no longer available</AlertTitle>
          <AlertDescription>
            Remove the unavailable item{unavailableItemCount === 1 ? "" : "s"} below to continue to checkout. Unavailable items are not included in your subtotal.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) {
              return (
                <Card key={`${item.productId}-${item.childName}`} className="overflow-hidden border-destructive/40" data-testid="unavailable-cart-item">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="w-24 h-24 shrink-0 rounded-md border border-dashed border-destructive/40 bg-destructive/5 flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-destructive/70" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Item no longer available</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        We couldn’t load this saved product. Remove it before checking out.
                      </p>
                      {item.childName && (
                        <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium mt-3">
                          Name: {item.childName}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">Quantity: {item.quantity}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove item
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            const productHref = `/${product.category}/${product.slug}`;
            return (
              <Card key={`${item.productId}-${item.childName}`} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href={productHref}
                    aria-label={`View ${product.name}`}
                    className="w-24 h-24 shrink-0 bg-white rounded-md border flex items-center justify-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img src={product.coverImage} alt={product.name} className="w-20 h-20 object-contain" />
                  </Link>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      <Link href={productHref} className="hover:text-primary hover:underline underline-offset-4">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mb-2">{product.category}</p>

                    {item.childName && (
                      <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium mb-2">
                        Name: {item.childName}
                      </div>
                    )}

                    <div className="text-primary font-bold text-lg">
                      ₹{product.price}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center border rounded-md h-10">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-3 hover:bg-muted h-full transition-colors"
                      >
                        −
                      </button>
                      <div className="w-10 text-center font-medium">{item.quantity}</div>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 hover:bg-muted h-full transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 px-3 ml-auto sm:ml-0"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-4">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-6">Order Summary</h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium">₹{cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">₹{shipping}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{cart.total + shipping}</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">Inclusive of all taxes</p>
              </div>

              <Button size="lg" className="w-full rounded-xl h-14 text-base shadow-md" onClick={handleCheckout} disabled={hasUnavailableItems}>
                {hasUnavailableItems
                  ? "Remove unavailable items to checkout"
                  : isAuthenticated
                    ? "Proceed to Checkout"
                    : "Login to Checkout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
