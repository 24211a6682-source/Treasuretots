import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  learningProducts, flashcardProducts, storybookProducts,
  wallpaperProducts, labelProducts, reviews,
  PHONE, INSTAGRAM_URL, EMAIL, WHATSAPP_URL
} from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { StorybookCard } from "@/components/StorybookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle, Phone, Instagram, Mail, ChevronLeft, ChevronRight } from "lucide-react";

// One featured book per category for the storybooks showcase
const FEATURED_BOOKS = [
  storybookProducts.find(b => b.slug === "lord-rama")!,
  storybookProducts.find(b => b.slug === "dragon-adventure")!,
  storybookProducts.find(b => b.slug === "frozen-princess")!,
  storybookProducts.find(b => b.slug === "spiderman")!,
  storybookProducts.find(b => b.slug === "naruto-adventure")!,
  storybookProducts.find(b => b.slug === "taekwondo-champion")!,
].filter(Boolean);

// All wallpaper + frame images
const WALLPAPER_IMAGES = [
  ...wallpaperProducts.flatMap(p => p.images),
];

function AutoCarousel({ children, interval = 4000, className = "" }: {
  children: React.ReactNode[];
  interval?: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const count = children.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count]);

  useEffect(() => {
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {children.map((child, i) => (
          <div key={i} className="min-w-full">{child}</div>
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition z-10"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition z-10"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-primary w-4" : "bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Banner */}
      <section className="relative w-full bg-orange-50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm font-medium w-fit text-orange-600 shadow-sm border border-orange-100">
              <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
              4.9 Rating | 100% Handmade | Pan-India Shipping
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Stories Where Your <span className="text-primary">Child is the Hero</span>
            </h1>
            <p className="text-lg text-gray-700 md:text-xl max-w-lg">
              Personalized books, flashcards, and learning materials handcrafted with love in South India.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Button asChild size="lg" className="rounded-full font-semibold px-8 text-base">
                <Link href="/storybooks">Explore Story Books</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-8 text-base bg-white">
                <Link href="/learning">Shop Learning Books</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-white">
              <AspectRatio ratio={4 / 3}>
                <img src="/assets/images/customized story books/cover photo.jpg" alt="Featured Storybook" className="object-cover w-full h-full" />
              </AspectRatio>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-xl overflow-hidden shadow-xl -rotate-6 border-4 border-white hidden md:block">
              <img src="/assets/images/customized story books/rama/Lord Rama1.jpg" alt="Lord Rama Book" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Learning & Devotion */}
      <section className="py-16 md:py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Learning & Devotion</h2>
            <p className="text-gray-600">Introduce beautiful Indian values and culture to your children early on.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
            <Link href="/learning">View All →</Link>
          </Button>
        </div>
        <div className="relative">
          <AutoCarousel interval={4000} className="rounded-2xl">
            {[0, 1].map(page => (
              <div key={page} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 px-1">
                {learningProducts.slice(page * 3, page * 3 + 3).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ))}
          </AutoCarousel>
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/learning">View All Learning Books →</Link>
          </Button>
        </div>
      </section>

      {/* Section 2: Flash Cards */}
      <section className="py-16 md:py-20 bg-blue-50/40">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Flash Cards</h2>
              <p className="text-gray-600">Fun, colorful learning tools for early education.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
              <Link href="/flashcards">View All →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashcardProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/flashcards">View All Flash Cards →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: Customized Story Books */}
      <section className="py-16 md:py-20 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Customized Story Books</h2>
              <p className="text-gray-600">Your child becomes the hero — AI-illustrated, fully personalized.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
              <Link href="/storybooks">View All Story Books →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-6">
            {FEATURED_BOOKS.map(book => (
              <StorybookCard key={book.id} book={book} />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 italic mb-4">
            These are made to order — contact us to personalize
          </p>
          <div className="text-center md:hidden mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/storybooks">View All Story Books →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Wallpapers & Frames */}
      <section className="py-16 md:py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Wallpapers & Frames</h2>
            <p className="text-gray-600">Transform your child's room with personalized wall art.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
            <Link href="/wallpapers">View All →</Link>
          </Button>
        </div>

        <AutoCarousel interval={5000} className="rounded-2xl overflow-hidden max-w-3xl mx-auto">
          {WALLPAPER_IMAGES.map((img, i) => (
            <div key={i} className="relative">
              <AspectRatio ratio={16 / 9}>
                <img src={img} alt={`Wallpaper ${i + 1}`} className="w-full h-full object-cover" />
              </AspectRatio>
            </div>
          ))}
        </AutoCarousel>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full gap-2">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full gap-2">
            <a href={`mailto:${EMAIL}`}>
              <Mail className="w-4 h-4" /> Email
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full gap-2">
            <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
              <Phone className="w-4 h-4" /> {PHONE}
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full gap-2">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Instagram className="w-4 h-4 text-pink-600" /> Instagram
            </a>
          </Button>
        </div>
      </section>

      {/* Section 5: Labels & Stickers */}
      <section className="py-16 md:py-20 bg-amber-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Labels & Stickers</h2>
              <p className="text-gray-600">Personalized name tags and stickers — ₹150 per set.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
              <Link href="/labels">View All →</Link>
            </Button>
          </div>

          <AutoCarousel interval={4500} className="rounded-2xl max-w-xl mx-auto">
            {labelProducts.flatMap(p => p.images).map((img, i) => (
              <div key={i}>
                <AspectRatio ratio={4 / 3}>
                  <img src={img} alt={`Label ${i + 1}`} className="w-full h-full object-cover rounded-2xl" />
                </AspectRatio>
              </div>
            ))}
          </AutoCarousel>

          <div className="mt-8 flex justify-center gap-4">
            {labelProducts.map(p => (
              <Button key={p.id} asChild size="lg" className="rounded-full font-semibold">
                <Link href={`/labels/${p.slug}`}>Buy Now — ₹{p.price}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-20 container mx-auto px-4 overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Parents Across India ⭐⭐⭐⭐⭐
          </h2>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-orange-500 text-orange-500" />)}
          </div>
        </div>

        <div className="flex overflow-x-auto pb-8 gap-6 snap-x -mx-4 px-4 hide-scrollbar">
          {reviews.map(review => (
            <Card key={review.id} className="min-w-[300px] max-w-[350px] snap-center shrink-0 border-orange-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                      {String.fromCharCode(64 + review.id)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Happy Parent</p>
                    <p className="text-xs text-gray-500">Verified Buyer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Create Magic?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10">
            Have questions about personalization or need help choosing the perfect gift? We'd love to chat.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button asChild size="lg" variant="secondary" className="font-bold rounded-full gap-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 text-green-600" />
                WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold rounded-full gap-2 bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
              <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
                <Phone className="w-5 h-5" />
                {PHONE}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold rounded-full gap-2 bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
                @treasuretots2025
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold rounded-full gap-2 bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
              <a href={`mailto:${EMAIL}`}>
                <Mail className="w-5 h-5" />
                Email
              </a>
            </Button>
          </div>

          <p className="text-sm opacity-80">
            Or email us at: <a href={`mailto:${EMAIL}`} className="underline hover:opacity-100">{EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
