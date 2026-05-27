import { useState } from "react";
import { useParams, Link } from "wouter";
import { labelProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star, MessageCircle, Phone, Instagram, CheckCircle2, Truck, Gift } from "lucide-react";
import { WHATSAPP_URL, PHONE, INSTAGRAM_URL } from "@/lib/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LabelDetail() {
  const { slug } = useParams();
  const product = labelProducts.find(p => p.slug === slug);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [childName, setChildName] = useState("");

  if (!product) {
    return <div className="container mx-auto p-20 text-center text-xl">Product not found</div>;
  }

  const handleAddToCart = () => {
    if (product.requiresChildName && !childName.trim()) {
      alert("Please enter the child's name");
      return;
    }
    addItem(product.id, quantity, childName);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="relative overflow-hidden bg-muted/20 rounded-xl border">
            <AspectRatio ratio={1}>
              <img 
                src={product.images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300 hover:scale-110 origin-center"
              />
            </AspectRatio>
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium border shadow-sm">
              {activeImage + 1} / {product.images.length}
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col">
          <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
            {product.category}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          <div className="text-4xl font-extrabold text-primary mb-6">
            ₹{product.price}
          </div>
          
          <div className="flex flex-col gap-3 mb-8 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium">In Stock</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Pan-India Shipping</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>
          
          {product.requiresChildName && (
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
              >
                −
              </button>
              <div className="w-12 text-center font-medium">{quantity}</div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-600 hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mb-8">
            <Button size="lg" className="w-full text-lg h-14 rounded-xl shadow-sm" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="w-full text-lg h-14 rounded-xl border-2 border-primary text-primary hover:bg-primary/5">
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}