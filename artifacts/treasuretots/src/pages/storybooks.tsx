import { useState } from "react";
import { storybookProducts, StoryCategory, WHATSAPP_URL, PHONE, INSTAGRAM_URL, EMAIL } from "@/lib/products";
import { BookCarousel3D } from "@/components/BookCarousel3D";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Instagram, Mail } from "lucide-react";

type FilterType = StoryCategory | "all";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "mythology", label: "Mythology" },
  { value: "adventure", label: "Adventure" },
  { value: "princess",  label: "Princess"  },
  { value: "superhero", label: "Superhero" },
  { value: "anime",     label: "Anime"     },
  { value: "sports",    label: "Sports"    },
  { value: "career",    label: "Career"    },
];

export default function Storybooks() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredBooks = filter === "all"
    ? storybookProducts
    : storybookProducts.filter(b => b.storyCategory === filter);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-10 pb-6 text-center max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Customized Story Books
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-4 leading-relaxed">
          These storybooks are customized for every child.<br />
          To order, contact us via WhatsApp, Email, Phone or Instagram.
        </p>

        {/* Contact pills — the ONLY place contact buttons appear on this page */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
          <a
            href={`tel:${PHONE.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition"
          >
            <Instagram className="w-3.5 h-3.5" /> Instagram
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-1 border-b border-gray-200 w-max mx-auto">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  filter === f.value
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="container mx-auto px-8 pb-16">
        {filteredBooks.length > 0 ? (
          <BookCarousel3D books={filteredBooks} />
        ) : (
          <p className="text-center text-gray-500 py-20">No books in this category yet.</p>
        )}
      </div>
    </div>
  );
}
