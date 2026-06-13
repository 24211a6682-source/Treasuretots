import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
      <Link href={`/${product.category}/${product.slug}`}>
        <div className="relative overflow-hidden bg-white">
          <AspectRatio ratio={3 / 4}>
            <img
              src={product.coverImage}
              alt={product.name}
              className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>
        </div>
      </Link>
      <CardContent className="p-4 flex flex-col gap-2">
        <Link href={`/${product.category}/${product.slug}`}>
          <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-lg text-primary">₹{product.price}</span>
          <Link href={`/${product.category}/${product.slug}`}>
            <Button size="sm" variant="outline" className="font-semibold">Buy Now</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
