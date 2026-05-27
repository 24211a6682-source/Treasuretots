import { Link } from "wouter";
import { learningProducts, flashcardProducts, storybookProducts, wallpaperProducts, labelProducts, reviews, getWhatsAppInterestUrl } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { StorybookCard } from "@/components/StorybookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle, Phone, Instagram, Mail } from "lucide-react";
import { PHONE, INSTAGRAM_URL, EMAIL, WHATSAPP_URL } from "@/lib/products";

// Simplified Home page due to component size limits, implementing the structure
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
             {/* This would be a carousel in full implementation */}
             <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-white">
               <AspectRatio ratio={4/3}>
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
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Learning & Devotion</h2>
            <p className="text-gray-600">Introduce beautiful Indian values early</p>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
            <Link href="/learning">View All →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {learningProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/learning">View All Learning Books →</Link>
          </Button>
        </div>
      </section>

      {/* Section 3: Customized Story Books */}
      <section className="py-16 md:py-24 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Customized Story Books</h2>
              <p className="text-gray-600">Your child becomes the hero — AI-illustrated, fully personalized</p>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">
              <Link href="/storybooks">View All Story Books →</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {storybookProducts.slice(0, 6).map(book => (
              <StorybookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 container mx-auto px-4 overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Parents Across India</h2>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-orange-500 text-orange-500" />)}
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
                      U
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
                Chat on WhatsApp
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
          </div>
          
          <p className="text-sm opacity-80">
            Or email us at: <a href={`mailto:${EMAIL}`} className="underline hover:opacity-100">{EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}