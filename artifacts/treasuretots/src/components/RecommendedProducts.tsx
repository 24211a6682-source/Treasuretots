import { useMemo } from "react";
import { Product, useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";

const MAX_RECOMMENDATIONS = 4;

function searchableTerms(product: Product): Set<string> {
  const source = [product.name, product.description ?? "", product.subcategory ?? ""]
    .join(" ")
    .toLocaleLowerCase();

  return new Set(source.match(/[a-z0-9]{3,}/g) ?? []);
}

function recommendationScore(current: Product, candidate: Product): number {
  let score = candidate.category === current.category ? 100 : 0;

  if (candidate.subcategory && candidate.subcategory === current.subcategory) {
    score += 30;
  }

  const currentTerms = searchableTerms(current);
  for (const term of searchableTerms(candidate)) {
    if (currentTerms.has(term)) score += 5;
  }

  return score;
}

export function RecommendedProducts({ product }: { product: Product }) {
  const { data, isLoading } = useListProducts(
    { per_page: 100 },
    { query: { queryKey: ["listProducts", "recommendations", product.id] } },
  );

  const recommendations = useMemo(() => {
    const seen = new Set<number>();

    return (data?.products ?? [])
      .filter((candidate) => {
        if (candidate.id === product.id || seen.has(candidate.id)) return false;
        seen.add(candidate.id);
        return true;
      })
      .map((candidate) => {
        return {
          product: candidate,
          score: recommendationScore(product, candidate),
        };
      })
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.product.name.localeCompare(right.product.name),
      )
      .slice(0, MAX_RECOMMENDATIONS)
      .map(({ product: candidate }) => candidate);
  }, [data?.products, product]);

  if (isLoading || recommendations.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-12" aria-labelledby="recommended-products-heading">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">More to discover</p>
        <h2 id="recommended-products-heading" className="mt-1 text-2xl font-bold text-foreground">
          You May Also Like
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((recommendedProduct) => (
          <ProductCard key={recommendedProduct.id} product={recommendedProduct} />
        ))}
      </div>
    </section>
  );
}