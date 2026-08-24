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
            {/* object-contain (not cover): product images are mixed-ratio —
                portrait book covers (~0.66), square covers (1.0) and landscape
                flashcards / name-tags (~1.41). In a 3:4 box, cover would crop a
                landscape image by ~47% of its width, hiding the very product the
                customer is choosing. Contain keeps the whole product visible; the
                bg-white box reads as clean padding and the grid stays uniform. */}
            <img
              src={product.coverImage}
              alt={product.name}
              className="object-contain w-full h-full"
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
            <Button size="sm" variant="outline" className="font-semibold">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
