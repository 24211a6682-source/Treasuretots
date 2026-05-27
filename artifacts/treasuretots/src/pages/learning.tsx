import { Link } from "wouter";
import { learningProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export default function Learning() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Learning & Devotion</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Learning & Devotion</h1>
        <p className="text-gray-600">Introduce beautiful Indian values and culture to your children early on.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {learningProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}