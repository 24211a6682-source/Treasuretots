import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useInitializeOrder, useVerifyPayment, useCreateAddress, useListAddresses, AddressInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const { cart, clearLocalCart, refetch } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<AddressInput>({
    fullName: user?.name || "",
    phone: user?.phone || "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoNote, setGeoNote] = useState<string | null>(null);

  const initOrder = useInitializeOrder();
  const verifyPayment = useVerifyPayment();
  const createAddress = useCreateAddress();
  const { data: addressesData } = useListAddresses({ query: { queryKey: ["listAddresses"], enabled: !!user } });

  if (!isAuthenticated && typeof window !== "undefined") {
    setLocation("/login?returnUrl=/checkout");
    return null;
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoNote("Geolocation is not supported by your browser. Please fill in your address manually.");
      return;
    }
    setIsGeoLoading(true);
    setGeoNote(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();
          const addr = data.address || {};

          setAddress(prev => ({
            ...prev,
            houseNo: addr.house_number || prev.houseNo,
            street: addr.road || addr.neighbourhood || addr.suburb || prev.street,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            pincode: addr.postcode || prev.pincode,
          }));
          setGeoNote("We've filled in your address. Please review and correct if needed.");
        } catch {
          setGeoNote("Couldn't fetch your address details. Please fill in manually.");
        } finally {
          setIsGeoLoading(false);
        }
      },
      (error) => {
        setIsGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoNote("Location access was denied. Please fill in your address manually.");
        } else {
          setGeoNote("Could not get your location. Please fill in your address manually.");
        }
      },
      { timeout: 10000 }
    );
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveAddress) {
      try {
        await createAddress.mutateAsync({ data: { ...address, isDefault: !addressesData?.length } });
      } catch {
        // non-blocking — continue to payment even if save fails
      }
    }
    setStep(2);
  };

  const handlePayment = async () => {
    try {
      const items = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
      const hasCustomName = cart.items.find(i => i.childName);

      const orderData = await initOrder.mutateAsync({
        data: {
          items,
          childName: hasCustomName?.childName || null,
          address
        }
      });

      if (!orderData.key) {
        toast({ title: "Payment gateway not configured", description: "Order simulated success for testing", variant: "default" });
        clearLocalCart();
        refetch();
        setLocation("/order-success");
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Treasure Tots Creations",
        description: "Personalized Products Order",
        image: "/assets/images/logo.png",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await verifyPayment.mutateAsync({
              data: {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderData.orderId
              }
            });
            clearLocalCart();
            refetch();
            setLocation("/order-success");
          } catch {
            toast({ title: "Payment verification failed", variant: "destructive" });
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#FF7A00"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({ title: "Payment failed", description: response.error.description, variant: "destructive" });
      });
      rzp.open();

    } catch {
      toast({ title: "Failed to initialize order", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex gap-4 mb-8">
        <div className={`flex-1 pb-4 border-b-2 ${step === 1 ? 'border-primary text-primary font-bold' : 'border-muted text-muted-foreground'}`}>
          1. Delivery Address
        </div>
        <div className={`flex-1 pb-4 border-b-2 ${step === 2 ? 'border-primary text-primary font-bold' : 'border-muted text-muted-foreground'}`}>
          2. Payment
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Use My Location button */}
                <div className="mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    onClick={handleUseLocation}
                    disabled={isGeoLoading}
                  >
                    {isGeoLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Detecting location...</>
                    ) : (
                      <><MapPin className="w-4 h-4" /> Use My Location</>
                    )}
                  </Button>
                  {geoNote && (
                    <p className={`text-xs mt-2 px-1 ${geoNote.includes("denied") || geoNote.includes("Couldn't") || geoNote.includes("Could not") ? "text-destructive" : "text-green-600"}`}>
                      {geoNote}
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseNo">House No. / Flat / Building</Label>
                    <Input id="houseNo" required value={address.houseNo} onChange={e => setAddress({...address, houseNo: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street / Area / Locality</Label>
                    <Input id="street" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" required value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="saveAddress"
                      checked={saveAddress}
                      onCheckedChange={(checked) => setSaveAddress(!!checked)}
                    />
                    <label htmlFor="saveAddress" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Save this address for future orders
                    </label>
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={createAddress.isPending}>
                    {createAddress.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving address...</> : "Continue to Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Payment</span>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Edit Address</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Delivering to {address.fullName}</p>
                  <p className="text-muted-foreground">{address.houseNo}, {address.street}</p>
                  <p className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                  <p className="text-muted-foreground">Phone: {address.phone}</p>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 text-lg"
                  onClick={handlePayment}
                  disabled={initOrder.isPending || verifyPayment.isPending}
                >
                  {initOrder.isPending ? "Initializing..." : verifyPayment.isPending ? "Verifying..." : "Proceed to Pay securely"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {cart.items.map(item => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex gap-3 text-sm">
                      <img src={product.coverImage} className="w-12 h-12 object-contain bg-white rounded border" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold">₹{(product.price ?? 0) * item.quantity}</div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm border-t pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Total</span>
                  <span>₹{cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t pt-4">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-primary">₹{cart.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
