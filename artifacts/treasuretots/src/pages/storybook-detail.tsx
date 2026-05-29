import { useState } from "react";
import { useParams, Link } from "wouter";
import { storybookProducts, getWhatsAppEnquiryUrl, PHONE, INSTAGRAM_URL, WHATSAPP_URL, EMAIL } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Phone, Instagram, Sparkles, Paintbrush, FileText, Truck, Mail } from "lucide-react";
import { StorybookCard } from "@/components/StorybookCard";

const categoryColors: Record<string, string> = {
  mythology: "bg-orange-100 text-orange-800",
  adventure: "bg-blue-100 text-blue-800",
  princess: "bg-pink-100 text-pink-800",
  superhero: "bg-red-100 text-red-800",
  anime: "bg-purple-100 text-purple-800",
  sports: "bg-green-100 text-green-800",
  career: "bg-yellow-100 text-yellow-800",
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
        <div className="bg-orange-50/60 p-8 md:p-12 rounded-3xl border border-orange-100 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { n: 1, title: "Contact us on WhatsApp or call", desc: "Reach out to us via WhatsApp or phone to express your interest." },
              { n: 2, title: "Share child's name, age & photo", desc: "Send a clear photo of your child along with their name and age." },
              { n: 3, title: "Choose pronouns", desc: "Let us know whether to use He / She / They in the story." },
              { n: 4, title: "Add dedication message (optional)", desc: "A personal note to be printed in the book — optional but special." },
              { n: 5, title: "We create your unique illustrated book", desc: "Our artists craft a one-of-a-kind personalized storybook for your child." },
              { n: 6, title: "Delivered to your door across India", desc: "Securely packaged and shipped Pan-India with tracking." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shrink-0 mt-0.5">{n}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="mt-16 mb-24">
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
    </div>
  );
}