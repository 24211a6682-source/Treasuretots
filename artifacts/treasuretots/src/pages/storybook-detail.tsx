import { useState } from "react";
import { useParams, Link } from "wouter";
import { storybookProducts, getWhatsAppEnquiryUrl, PHONE, INSTAGRAM_URL } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Phone, Instagram, Sparkles, Paintbrush, FileText, Truck } from "lucide-react";
import { StorybookCard } from "@/components/StorybookCard";

const categoryColors: Record<string, string> = {
  mythology: "bg-orange-100 text-orange-800",
  adventure: "bg-blue-100 text-blue-800",
  princess: "bg-pink-100 text-pink-800",
  superhero: "bg-red-100 text-red-800",
  sports: "bg-green-100 text-green-800",
};

export default function StorybookDetail() {
  const { slug } = useParams();
  const book = storybookProducts.find(b => b.slug === slug);
  const [activeImage, setActiveImage] = useState(0);

  if (!book) {
    return <div className="container mx-auto p-20 text-center text-xl">Storybook not found</div>;
  }

  const images = [book.coverImage, book.previewImage];
  const relatedBooks = storybookProducts.filter(b => b.storyCategory === book.storyCategory && b.id !== book.id).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/storybooks" className="hover:text-primary">Story Books</Link>
        <span className="mx-2">/</span>
        <span className="capitalize hover:text-primary cursor-pointer">{book.storyCategory}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate">{book.name}</span>
      </div>

      <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: Images */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="relative overflow-hidden bg-muted/10 rounded-2xl border shadow-sm">
            <AspectRatio ratio={3/4}>
              <img 
                src={images[activeImage]} 
                alt={book.name}
                className="w-full h-full object-contain p-4 transition-all duration-300"
              />
            </AspectRatio>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveImage(0)}
              className={`relative w-24 h-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === 0 ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/50 hover:border-muted-foreground/30 opacity-70 hover:opacity-100'}`}
            >
              <img src={book.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-medium">Cover</div>
            </button>
            <button 
              onClick={() => setActiveImage(1)}
              className={`relative w-24 h-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === 1 ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/50 hover:border-muted-foreground/30 opacity-70 hover:opacity-100'}`}
            >
              <img src={book.previewImage} alt="Inside Preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-medium">Inside</div>
            </button>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-6 flex flex-col">
          <Badge className={`uppercase text-[10px] tracking-wider font-bold mb-4 w-fit ${categoryColors[book.storyCategory]}`} variant="secondary">
            {book.storyCategory}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{book.name}</h1>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
            </div>
            <span className="text-gray-700 font-medium ml-2">Loved by parents</span>
          </div>

          <div className="bg-orange-50/80 rounded-2xl p-6 border border-orange-100 mb-8 space-y-4">
            <div className="flex items-start gap-3 text-gray-800">
              <Sparkles className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold text-gray-900">Your child becomes the hero:</strong> They are the main character of this epic tale!</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <Paintbrush className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold text-gray-900">AI-illustrated personalized art:</strong> Stunning visuals featuring your child's likeness.</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <FileText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold text-gray-900">Custom name & photo:</strong> Beautifully integrated into the storyline and cover.</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <Truck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold text-gray-900">Delivered Pan-India:</strong> Premium quality printing shipped securely to your door.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
            <p className="font-medium text-lg text-gray-700">Price on enquiry</p>
          </div>
          
          <Button asChild size="lg" className="w-full text-lg h-16 rounded-xl shadow-md bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 mb-4 transition-transform hover:-translate-y-1">
            <a href={getWhatsAppEnquiryUrl(book.name)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-6 h-6" />
              Enquire on WhatsApp
            </a>
          </Button>

          <div className="flex gap-4">
            <Button asChild variant="outline" className="flex-1 h-12 rounded-xl text-gray-700 gap-2 hover:bg-muted">
              <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
                <Phone className="w-4 h-4" /> Call Us
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12 rounded-xl text-gray-700 gap-2 hover:bg-muted">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="mt-20 max-w-4xl mx-auto">
        <div className="bg-cream p-8 md:p-12 rounded-3xl border shadow-sm text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">How Personalization Works</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">1</div>
              <h4 className="font-bold text-lg mb-2">Choose Book</h4>
              <p className="text-gray-600 text-sm">Select from our magical themes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">2</div>
              <h4 className="font-bold text-lg mb-2">WhatsApp Us</h4>
              <p className="text-gray-600 text-sm">Click enquire and chat with us.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">3</div>
              <h4 className="font-bold text-lg mb-2">Share Details</h4>
              <p className="text-gray-600 text-sm">Provide name and clear photos.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">4</div>
              <h4 className="font-bold text-lg mb-2">Digital Review</h4>
              <p className="text-gray-600 text-sm">We'll show you a digital preview.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">5</div>
              <h4 className="font-bold text-lg mb-2">Payment</h4>
              <p className="text-gray-600 text-sm">Confirm order via secure payment.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">6</div>
              <h4 className="font-bold text-lg mb-2">Delivery</h4>
              <p className="text-gray-600 text-sm">Shipped securely to your home!</p>
            </div>
          </div>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">More from this theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map(b => (
              <StorybookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-4 md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button asChild className="w-full text-base h-14 shadow-sm bg-[#25D366] hover:bg-[#128C7E] text-white">
          <a href={getWhatsAppEnquiryUrl(book.name)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Enquire on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}