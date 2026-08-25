import { Link, useLocation } from "wouter";
import type { MouseEvent } from "react";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/hooks/use-auth";
import { saveBuyNowIntent } from "@/lib/buy-now";

export function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const detailHref = `/${product.category}/${product.slug}`;
  // Name-tag orders need a child's name captured on the detail page, so Buy Now
  // there routes to the detail view instead of straight to checkout.
  const needsCustomization = product.slug === "customised-name-tags";

  const handleBuyNow = (event: MouseEvent) => {
    // Buy Now sits above the card-wide overlay link (below); stop the event so
    // it never doubles as the "view details" card click.
    event.preventDefault();
    event.stopPropagation();

    if (needsCustomization) {
      setLocation(detailHref);
      return;
    }

    saveBuyNowIntent({ productId: product.id, quantity: 1 });
    setLocation(isAuthenticated ? "/buy-now" : "/login?returnUrl=%2Fbuy-now");
  };

  return (
    <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
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
      <CardContent className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <span className="font-bold text-lg text-primary">₹{product.price}</span>
          {/* Buy Now is the only in-card action and is raised above the overlay
              link (z-20 > z-10) so its own click handler runs, sending the
              customer straight to checkout rather than the detail page. */}
          <Button size="sm" className="relative z-20 font-semibold" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </CardContent>
      {/* Card-wide click target → product detail. Covers image, title and price
          (all below at z-auto) but sits under the Buy Now button, so the two
          click behaviours never collide. */}
      <Link href={detailHref} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
        <span className="sr-only">View {product.name}</span>
      </Link>
    </Card>
  );
}
