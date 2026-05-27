import { Link } from "wouter";
import { wallpaperProducts, WHATSAPP_URL, PHONE, INSTAGRAM_URL, EMAIL } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MessageCircle, Phone, Instagram, Mail } from "lucide-react";

export default function Wallpapers() {
  const images = wallpaperProducts.flatMap(p => p.images);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Customized Wallpapers & Frames</h1>
        <p className="text-gray-600 text-lg mb-8">Personalized wall art for your child's room. Transform any wall into a magical space.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-6">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" /> Enquire Now
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <a href={`tel:${PHONE.replace(/\s+/g, '')}`}>
              <Phone className="w-4 h-4 mr-2" /> Call Us
            </a>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {images.map((img, idx) => (
          <div key={idx} className="rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
            <AspectRatio ratio={4/3}>
              <img src={img} alt="Wallpaper Example" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
            </AspectRatio>
          </div>
        ))}
      </div>
      
      <div className="bg-orange-50 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">How to Order</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-3">1</div>
            <h4 className="font-semibold mb-1">Contact Us</h4>
            <p className="text-sm text-gray-600">Message on WhatsApp with your requirements.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-3">2</div>
            <h4 className="font-semibold mb-1">Design</h4>
            <p className="text-sm text-gray-600">We create custom designs for your approval.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-3">3</div>
            <h4 className="font-semibold mb-1">Print & Ship</h4>
            <p className="text-sm text-gray-600">Securely packed and shipped to your home.</p>
          </div>
        </div>
      </div>
    </div>
  );
}