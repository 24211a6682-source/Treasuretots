import { Link } from "wouter";
import { Truck, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { PHONE, EMAIL, WHATSAPP_URL } from "@/lib/products";

export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Shipping Policy</h1>
        </div>
        <p className="text-muted-foreground text-sm">Last updated: August 2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold mb-3">Where We Ship</h2>
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-foreground leading-relaxed">
              We ship <strong>across India</strong> — every state and union territory. At this time we do not ship internationally.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Shipping Fee</h2>
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground leading-relaxed">
                A flat shipping fee of <strong>₹70</strong> applies to every order, regardless of order value, number of items, or delivery location within India.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                There are no hidden charges. The ₹70 shipping fee is shown clearly at checkout before you pay.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Order Processing</h2>
          <p className="text-foreground leading-relaxed">
            Our products are handcrafted and personalised to order. Processing times vary by product type. Please check the product page or reach out to us on WhatsApp for an estimate before placing your order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" /> Contact Us
          </h2>
          <p className="text-foreground leading-relaxed mb-4">
            Have a question about your order or delivery? We're happy to help.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="text-sm font-medium">{PHONE}</p>
              </div>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{EMAIL}</p>
              </div>
            </a>
            <Link
              href="/"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Back to</p>
                <p className="text-sm font-medium">Shop</p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
