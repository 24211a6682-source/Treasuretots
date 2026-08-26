import { Truck, MapPin } from "lucide-react";

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
              We ship <strong>across India</strong>. International orders are available through a pre-order enquiry, with applicable shipping charges confirmed for the destination before an order is placed.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Shipping Fee</h2>
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground leading-relaxed">
                 Domestic orders within India have a flat shipping fee of <strong>₹70</strong>.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                  The ₹70 domestic shipping fee is shown clearly at checkout before you pay. For an international order, please contact us on WhatsApp, Email or Instagram before checkout so we can confirm the destination-based applicable charge.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Order Processing</h2>
          <p className="text-foreground leading-relaxed">
             Our products are handcrafted and personalised to order from Hyderabad, India. Processing times vary by product type. Please check the product page or reach out to us on WhatsApp, Email or Instagram for an estimate before placing your order.
          </p>
        </section>

      </div>
    </div>
  );
}
