import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MessageCircle, Instagram, Mail, CheckCircle2, Truck, Gift, ArrowLeft } from "lucide-react";
import { WHATSAPP_URL, INSTAGRAM_URL, EMAIL } from "@/lib/products";
import { useAuth } from "@/hooks/use-auth";
import { saveBuyNowIntent } from "@/lib/buy-now";
import { RecommendedProducts } from "@/components/RecommendedProducts";
import { ProductPurchaseControls } from "@/components/ProductPurchaseControls";

function Skeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <div className="aspect-square bg-gray-100 rounded-xl" />
          <div className="flex gap-3 mt-4">
            {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg" />)}
          </div>
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

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useGetProduct(slug ?? "");
  const { addItem, updateQuantity, removeItem, cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeImage, setActiveImage] = useState(0);
  const [childName, setChildName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Reset per-product UI when navigating product → recommended product without a
  // full remount, so the new product never inherits the previous one's state.
  useEffect(() => {
    setActiveImage(0);
    setChildName("");
  }, [slug]);

  if (isLoading) return <Skeleton />;

  if (isError || !product || product.category !== "learning") {
    return <div className="container mx-auto p-20 text-center text-xl">Product not found</div>;
  }

  const requiresChildName = product.slug === "customised-name-tags";
  // The displayed quantity comes from the existing cart state, including after
  // reloads. Buy Now uses one when the product has not been added yet.
  const cartItem = cart.items.find((item) => item.productId === product.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity ?? 1;

  const handleAddToCart = async () => {
    if (requiresChildName && !childName.trim()) {
      alert("Please enter the child's name");
      return;
    }
    // Prevent duplicate adds: ignore repeat clicks while the request is in flight
    // and once the item is already in the cart.
    if (isAdding || isInCart) return;
    setIsAdding(true);
    try {
      await addItem(product.id, 1, childName || undefined, product);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = async (nextQuantity: number) => {
    if (
      !cartItem ||
      isUpdatingQuantity ||
      nextQuantity < 1 ||
      nextQuantity === cartItem.quantity
    ) {
      return;
    }
    setIsUpdatingQuantity(true);
    try {
      await updateQuantity(product.id, nextQuantity);
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (isRemoving || !isInCart) return;
    setIsRemoving(true);
    try {
      await removeItem(product.id);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBuyNow = () => {
    if (requiresChildName && !childName.trim()) {
      alert("Please enter the child's name");
      return;
    }
    saveBuyNowIntent({
      productId: product.id,
      quantity: cartQuantity,
      childName: childName || undefined,
    });
    setLocation(isAuthenticated ? "/buy-now" : "/login?returnUrl=%2Fbuy-now");
  };

  const categoryLabel = "Learning & Devotion";

  return (
    <div className="container mx-auto px-4 pt-8 pb-24 md:pb-8">
      {/* Mobile: concise back to the originating category listing (Learning /
          Flash Cards / Name Tags), replacing the long breadcrumb that wraps on
          phones. Desktop keeps the full breadcrumb. */}
      <button
        type="button"
        onClick={() => setLocation(`/${product.category}`)}
        className="md:hidden inline-flex items-center gap-1 -ml-1 mb-4 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="hidden md:flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.category}`} className="hover:text-primary">{categoryLabel}</Link>
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
            {categoryLabel}
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
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Gift className="w-4 h-4 text-purple-600" />
              <span>Handmade with Love</span>
            </div>
          </div>

          {product.description && (
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          )}

          {requiresChildName && (
            <div className="mb-6">
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name for Customization <span className="text-red-500">*</span>
              </label>
              <input
                id="childName"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter exact name to be printed"
              />
            </div>
          )}

          <ProductPurchaseControls
            quantity={cartQuantity}
            isInCart={isInCart}
            isAdding={isAdding}
            isUpdating={isUpdatingQuantity}
            isRemoving={isRemoving}
            onAddToCart={handleAddToCart}
            onIncreaseQuantity={() => void handleQuantityChange(cartQuantity + 1)}
            onDecreaseQuantity={() => void handleQuantityChange(cartQuantity - 1)}
            onRemoveFromCart={handleRemoveFromCart}
            onBuyNow={handleBuyNow}
          />

          <div className="flex gap-2 justify-center border-t pt-6">
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
              <a href={`mailto:${EMAIL}`}>
                <Mail className="w-4 h-4" /> Email
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
          <div className="bg-white rounded-2xl border p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">Product Specifications</h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between py-3 border-b border-dashed">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-right capitalize">{product.category}</span>
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
          </div>
      </div>

      <RecommendedProducts product={product} />

    </div>
  );
}
