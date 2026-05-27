import { Link } from "wouter";
import { ProductData } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductCard({ product }: { product: ProductData }) {
  const { addItem } = useCart();

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
      <Link href={`/${product.category}/${product.slug}`}>
        <div className="relative overflow-hidden bg-muted/20">
          <AspectRatio ratio={1}>
            <img 
              src={product.coverImage} 
              alt={product.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>
        </div>
      </Link>
      <CardContent className="p-5 flex flex-col gap-3">
        <Link href={`/${product.category}/${product.slug}`}>
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-lg text-primary">₹{product.price}</span>
          <div className="flex gap-2">
            <Link href={`/${product.category}/${product.slug}`}>
              <Button size="sm" variant="outline" className="font-semibold">Buy Now</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}