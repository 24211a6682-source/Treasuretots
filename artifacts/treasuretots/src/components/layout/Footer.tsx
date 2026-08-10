import { Link } from "wouter";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { PHONE, EMAIL, INSTAGRAM_URL } from "@/lib/products";

export function Footer() {
  return (
    <footer className="bg-primary/10 border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <img src="/assets/images/logo.png" alt="TreasureTots Logo" className="h-12 object-contain mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Creating magical personalized stories that nurture values and imagination. Handcrafted with love in India.
            </p>
            <div className="flex gap-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link href="/storybooks" className="hover:text-primary transition-colors">Story Books</Link></li>
              <li><Link href="/learning" className="hover:text-primary transition-colors">Learning & Devotion</Link></li>
              <li><Link href="/flashcards" className="hover:text-primary transition-colors">Flash Cards</Link></li>
              <li><Link href="/wallpapers" className="hover:text-primary transition-colors">Wallpapers</Link></li>
              <li><Link href="/labels" className="hover:text-primary transition-colors">Labels</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>South India<br />Made with love in India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>{PHONE}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>{EMAIL}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Treasure Tots Creations. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}