import { useState } from "react";
import { Link } from "wouter";
import { storybookProducts, StoryCategory } from "@/lib/products";
import { StorybookCard } from "@/components/StorybookCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Storybooks() {
  const [filter, setFilter] = useState<StoryCategory | "all">("all");

  const filteredBooks = filter === "all" 
    ? storybookProducts 
    : storybookProducts.filter(b => b.storyCategory === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Customized Story Books</h1>
        <p className="text-gray-600 text-lg">Your child becomes the hero of their own personalized adventure.</p>
      </div>
      
      <div className="flex justify-center mb-10 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
          >
            All Themes
          </button>
          <button 
            onClick={() => setFilter("mythology")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "mythology" ? "bg-orange-100 text-orange-800 shadow-sm" : "text-gray-500 hover:text-orange-600"}`}
          >
            Mythology
          </button>
          <button 
            onClick={() => setFilter("adventure")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "adventure" ? "bg-blue-100 text-blue-800 shadow-sm" : "text-gray-500 hover:text-blue-600"}`}
          >
            Adventure
          </button>
          <button 
            onClick={() => setFilter("princess")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "princess" ? "bg-pink-100 text-pink-800 shadow-sm" : "text-gray-500 hover:text-pink-600"}`}
          >
            Princess & Fantasy
          </button>
          <button 
            onClick={() => setFilter("superhero")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "superhero" ? "bg-red-100 text-red-800 shadow-sm" : "text-gray-500 hover:text-red-600"}`}
          >
            Superhero
          </button>
          <button 
            onClick={() => setFilter("sports")} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "sports" ? "bg-green-100 text-green-800 shadow-sm" : "text-gray-500 hover:text-green-600"}`}
          >
            Sports & Careers
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <StorybookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}