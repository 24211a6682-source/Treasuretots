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
  const relatedBooks = storybookProducts
    .filter(b => b.storyCategory === book.storyCategory && b.id !== book.id)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/storybooks" className="hover:text-primary">Story Books</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{book.storyCategory}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate">{book.name}</span>
      </div>

      <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: Images */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="relative overflow-hidden bg-muted/10 rounded-2xl border shadow-sm">
            <AspectRatio ratio={3 / 4}>
              <img
                src={images[activeImage]}
                alt={book.name}
                className="w-full h-full object-contain p-4 transition-all duration-300"
              />
            </AspectRatio>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { label: "Cover", img: book.coverImage },
              { label: "Inside Preview", img: book.previewImage },
            ].map(({ label, img }, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-24 h-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === i
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border/50 hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-medium">
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-6 flex flex-col">
          <Badge
            className={`uppercase text-[10px] tracking-wider font-bold mb-4 w-fit ${categoryColors[book.storyCategory]}`}
            variant="secondary"
          >
            {book.storyCategory}
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {book.name}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
              ))}
            </div>
            <span className="text-gray-700 font-medium ml-1">Loved by parents</span>
          </div>

          {/* Feature highlights */}
          <div className="bg-orange-50/80 rounded-2xl p-5 border border-orange-100 mb-6 space-y-3">
            <div className="flex items-start gap-3 text-gray-800">
              <Sparkles className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold">Your child becomes the hero:</strong> They are the main character of this epic tale!</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <Paintbrush className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold">AI-illustrated personalized art:</strong> Stunning visuals featuring your child's likeness.</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <FileText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold">Custom name & photo included:</strong> Beautifully woven into the storyline and cover.</p>
            </div>
            <div className="flex items-start gap-3 text-gray-800">
              <Truck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p><strong className="font-semibold">Delivered Pan-India:</strong> Premium printing shipped securely to your door.</p>
            </div>
          </div>

          {/* Contact */}
          <div className="border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50/50">
            <p className="font-semibold text-gray-800 mb-3 text-center">
              To order this book, please contact us:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-xl h-12">
                <a href={getWhatsAppEnquiryUrl(book.name)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 rounded-xl h-12">
                <a href={`mailto:${EMAIL}`}>
                  <Mail className="w-4 h-4" /> Email
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 rounded-xl h-12">
                <a href={`tel:${PHONE.replace(/\s+/g, "")}`}>
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 rounded-xl h-12">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-orange-50/70 p-8 md:p-10 rounded-3xl border border-orange-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { n: 1, title: "Contact us on WhatsApp or call", desc: "Reach out via WhatsApp or phone to express your interest." },
              { n: 2, title: "Share child's name, age & photo", desc: "Send a clear photo with name and age details." },
              { n: 3, title: "Choose pronouns (He / She / They)", desc: "Let us know which pronouns to use in the story." },
              { n: 4, title: "Add a dedication message (optional)", desc: "A personal note to print inside the book." },
              { n: 5, title: "We create your unique illustrated book", desc: "Our artists craft a one-of-a-kind personalized storybook." },
              { n: 6, title: "Delivered to your door across India", desc: "Securely packaged and shipped Pan-India with tracking." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {n}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="mt-14 mb-10">
          <h2 className="text-2xl font-bold mb-6">More from this theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map(b => (
              <StorybookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3 md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button
          asChild
          className="flex-1 h-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
        >
          <a href={getWhatsAppEnquiryUrl(book.name)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="h-12 px-4">
          <a href={`tel:${PHONE.replace(/\s+/g, "")}`}>
            <Phone className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
