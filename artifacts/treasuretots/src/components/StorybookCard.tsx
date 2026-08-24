import { Link } from "wouter";
import { StorybookData, getWhatsAppInterestUrl } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MessageCircle } from "lucide-react";

const categoryColors: Record<string, string> = {
  mythology: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  adventure: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  princess: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  superhero: "bg-red-100 text-red-800 hover:bg-red-200",
  sports: "bg-green-100 text-green-800 hover:bg-green-200",
};

export function StorybookCard({ book }: { book: StorybookData }) {
  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
      <Link href={`/storybooks/${book.slug}`}>
        <div className="relative overflow-hidden bg-muted/20">
          <AspectRatio ratio={3/4}>
            {/* object-contain (not cover): storybook covers are square (1:1), so a
                3:4 box under cover would slice ~25% off the sides — cutting cover
                art and titles. Contain shows the full cover; bg-muted/20 frames it. */}
            <img
              src={book.coverImage}
              alt={book.name}
              className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>
        </div>
      </Link>
      <CardContent className="p-5 flex flex-col gap-3 items-center text-center">
        <Badge className={`uppercase text-[10px] tracking-wider font-bold ${categoryColors[book.storyCategory] || ""}`} variant="secondary">
          {book.storyCategory}
        </Badge>
        <Link href={`/storybooks/${book.slug}`}>
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {book.name}
          </h3>
        </Link>
        <Button asChild className="w-full mt-2 bg-[#25D366] hover:bg-[#128C7E] text-white" variant="default">
          <a href={getWhatsAppInterestUrl(book.name)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Enquire on WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}