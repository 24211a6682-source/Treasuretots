import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/products";

export default function OrderSuccess() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <CheckCircle className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        🎉 Order Confirmed!
      </h1>
      <p className="text-lg text-gray-600 mb-2">
        Thank you for choosing TreasureTots Creations.
      </p>
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        We've received your order and are getting it ready. Handcrafting magic takes a little time!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
        <Button asChild size="lg" className="flex-1 rounded-xl">
          <Link href="/dashboard">View My Orders</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl gap-2 text-green-700 border-green-200 hover:bg-green-50">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Track on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}