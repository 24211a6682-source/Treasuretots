import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearBuyNowIntent, readBuyNowIntent } from "@/lib/buy-now";

export default function BuyNow() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation("/login?returnUrl=%2Fbuy-now");
      return;
    }

    const intent = readBuyNowIntent();
    if (!intent) {
      setError("Your Buy Now selection has expired. Please choose the product again.");
      return;
    }

    setError(null);
    setLocation("/checkout");
  }, [attempt, isAuthenticated, isLoading]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-orange-50/30">
      <Card className="w-full max-w-md border-orange-100 shadow-xl rounded-3xl">
        <CardHeader className="text-center">
          <CardTitle>{error ? "Buy Now needs attention" : "Preparing your checkout"}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-5">
          {error ? (
            <>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex flex-col gap-3">
                {readBuyNowIntent() && (
                  <Button onClick={() => setAttempt((value) => value + 1)}>
                    Try Again
                  </Button>
                )}
                <Button variant="outline" onClick={() => setLocation("/")}>
                  Continue Shopping
                </Button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                We’re adding only your selected item and opening checkout.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}