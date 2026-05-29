import { useState } from "react";
import { Link } from "wouter";
import { storybookProducts, StoryCategory, WHATSAPP_URL, PHONE, INSTAGRAM_URL, EMAIL } from "@/lib/products";
import { StorybookCard } from "@/components/StorybookCard";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Instagram, Mail } from "lucide-react";

type FilterType = StoryCategory | "all";

const FILTERS: { value: FilterType; label: string; active: string; hover: string }[] = [
  { value: "all",       label: "All",        active: "bg-white shadow-sm text-gray-900",          hover: "hover:text-gray-900" },
  { value: "mythology", label: "Mythology",  active: "bg-orange-100 text-orange-800 shadow-sm",   hover: "hover:text-orange-600" },
  { value: "adventure", label: "Adventure",  active: "bg-blue-100 text-blue-800 shadow-sm",       hover: "hover:text-blue-600" },
  { value: "princess",  label: "Princess",   active: "bg-pink-100 text-pink-800 shadow-sm",       hover: "hover:text-pink-600" },
  { value: "superhero", label: "Superhero",  active: "bg-red-100 text-red-800 shadow-sm",         hover: "hover:text-red-600" },
  { value: "anime",     label: "Anime",      active: "bg-purple-100 text-purple-800 shadow-sm",   hover: "hover:text-purple-600" },
  { value: "sports",    label: "Sports",     active: "bg-green-100 text-green-800 shadow-sm",     hover: "hover:text-green-600" },
  { value: "career",    label: "Career",     active: "bg-yellow-100 text-yellow-800 shadow-sm",   hover: "hover:text-yellow-600" },
];

export default function Storybooks() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredBooks = filter === "all"
    ? storybookProducts
    : storybookProducts.filter(b => b.storyCategory === filter);

  return (
    <div className="w-full">
      {/* Sticky Enquiry Banner */}
      <div className="sticky top-16 z-30 bg-orange-50 border-b border-orange-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                These storybooks are customized for every child — displayed here for showcase only.
              </p>
              <p className="text-xs md:text-sm text-gray-600">To place an order, please enquire via:</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full gap-1.5 text-xs">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
                <a href={`mailto:${EMAIL}`}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
                <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
                  <Phone className="w-3.5 h-3.5" /> Call Us
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Customized Story Books</h1>
          <p className="text-gray-600 text-lg">Your child becomes the hero of their own personalized adventure.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.value ? f.active : `text-gray-500 ${f.hover}`
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <StorybookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
