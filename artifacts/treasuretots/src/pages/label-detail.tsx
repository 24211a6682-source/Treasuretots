import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star, MessageCircle, Phone, Instagram, CheckCircle2, Truck } from "lucide-react";
import { WHATSAPP_URL, PHONE, INSTAGRAM_URL } from "@/lib/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { saveBuyNowIntent } from "@/lib/buy-now";
import { RecommendedProducts } from "@/components/RecommendedProducts";

function Skeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <div className="aspect-square bg-gray-100 rounded-xl" />
        </div>
        <div className="md:col-span-5 space-y-4">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-10 bg-gray-100 rounded w-1/3" />
          <div className="h-24 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LabelDetail() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useGetProduct(slug ?? "");
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [childName, setChildName] = useState("");

  if (isLoading) return <Skeleton />;

  if (isError || !product) {
    return <div className="container mx-auto p-20 text-center text-xl">Product not found</div>;
  }

  const requiresChildName = product.slug === "customised-name-tags";

  const handleAddToCart = () => {
    if (requiresChildName && !childName.trim()) {
      alert("Please enter the child's name");
      return;
    }
    addItem(product.id, quantity, childName || undefined);
  };

  const handleBuyNow = () => {
    if (requiresChildName && !childName.trim()) {
      alert("Please enter the child's name");
      return;
    }
    saveBuyNowIntent({
      productId: product.id,
      quantity,
      childName: childName || undefined,
    });
    setLocation(isAuthenticated ? "/buy-now" : "/login?returnUrl=%2Fbuy-now");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/labels" className="hover:text-primary">Name Tags</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="relative overflow-hidden bg-gray-50 rounded-xl border">
            <AspectRatio ratio={1}>
              <img
                src={product.images[activeImage] ?? product.coverImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300 hover:scale-105 origin-center p-4"
              />
            </AspectRatio>
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium border shadow-sm">
              {activeImage + 1} / {product.images.length}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 bg-white transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col">
          <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
            Name Tags
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="text-4xl font-extrabold text-primary mb-6">
            ₹{product.price}
          </div>

          <div className="flex flex-col gap-3 mb-8 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium">{(product.stock ?? 0) > 0 ? "In Stock" : "Out of Stock"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Pan-India Shipping</span>
            </div>
          </div>

          {product.description && (
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          )}

          {requiresChildName && (
            <div className="mb-6 bg-muted/30 p-4 rounded-xl border">
              <Label htmlFor="childName" className="block text-sm font-bold text-gray-900 mb-2">
                Child's Name for Customization <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-3">Please verify spelling. Name will be printed exactly as entered.</p>
              <Input
                id="childName"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full bg-white border-primary/30 focus-visible:ring-primary"
                placeholder="E.g., Arjun, Diya"
              />
            </div>
          )}

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-muted transition-colors"
              >−</button>
              <div className="w-12 text-center font-medium">{quantity}</div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-600 hover:bg-muted transition-colors"
              >+</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Button size="lg" variant="outline" className="w-full text-lg h-14 rounded-xl shadow-sm" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button size="lg" className="w-full text-lg h-14 rounded-xl shadow-sm" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          <div className="flex gap-2 justify-center border-t pt-6">
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
              <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
                <Phone className="w-4 h-4" /> Call
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="details" className="text-base py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Details & Specs</TabsTrigger>
            <TabsTrigger value="reviews" className="text-base py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="bg-white rounded-2xl border p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">Product Specifications</h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between py-3 border-b border-dashed">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-right">Sticker / Label Set</span>
              </div>
              <div className="flex justify-between py-3 border-b border-dashed">
                <span className="text-muted-foreground">Publisher</span>
                <span className="font-medium text-right">Treasure Tots Creations</span>
              </div>
              <div className="flex justify-between py-3 border-b border-dashed">
                <span className="text-muted-foreground">Ships to</span>
                <span className="font-medium text-right">Pan-India</span>
              </div>
              <div className="flex justify-between py-3 border-b border-dashed">
                <span className="text-muted-foreground">Made in</span>
                <span className="font-medium text-right">India · Handmade</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="bg-white rounded-2xl border p-6 md:p-8">
            <div className="text-center py-10">
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-8 h-8 fill-orange-500 text-orange-500" />)}
              </div>
              <h3 className="text-2xl font-bold">4.9 out of 5 stars</h3>
              <p className="text-muted-foreground">Based on verified parent reviews</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RecommendedProducts product={product} />

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-4 md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full text-base h-12 shadow-sm" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button className="w-full text-base h-12 shadow-sm" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
