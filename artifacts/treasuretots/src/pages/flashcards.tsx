import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden shadow-md bg-white">
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Flashcards() {
  const { data, isLoading, isError } = useListProducts({ category: "flashcards", per_page: 20 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Flash Cards</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Flash Cards</h1>
        <p className="text-gray-600">Fun, colorful learning tools for early education.</p>
      </div>

      {isError && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Failed to load products. Please try again.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          : data?.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
        }
      </div>
    </div>
  );
}
