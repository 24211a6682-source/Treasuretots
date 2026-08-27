import { FileText } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Using Treasure Tots</h2>
          <p className="leading-relaxed text-foreground">
            By using the Treasure Tots Creations website, you agree to these terms. Please use the
            website lawfully and provide accurate information when creating an account, placing an
            order, or requesting a personalised product.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Products and Personalisation</h2>
          <p className="leading-relaxed text-foreground">
            Our products are handcrafted and may have small variations. You are responsible for
            checking names, spellings, photos, and other personalisation details before submitting
            an order. We may contact you to clarify an order when the information provided is
            incomplete or unclear.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Orders and Payment</h2>
          <p className="leading-relaxed text-foreground">
            An order is accepted after the order details are submitted and the applicable payment
            is successfully completed or an available payment option is explicitly confirmed at
            checkout. Prices, shipping charges, product availability, and payment options are shown
            before you complete your purchase. We may cancel or correct an order affected by an
            obvious pricing, availability, or product-information error.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Shipping and Delivery</h2>
          <p className="leading-relaxed text-foreground">
            Shipping timelines vary by product because many items are prepared to order. Delivery
            details and applicable shipping charges are shown at checkout or communicated before
            an enquiry-based order is placed. Please review our{" "}
            <Link className="font-medium text-primary hover:underline" href="/shipping">
              Shipping Policy
            </Link>{" "}
            for more information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Intellectual Property</h2>
          <p className="leading-relaxed text-foreground">
            The Treasure Tots name, artwork, product content, and website materials belong to
            Treasure Tots Creations or their respective rights holders. They may not be copied,
            republished, or used commercially without permission.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Contact</h2>
          <p className="leading-relaxed text-foreground">
            If you have a question about these terms or an order, please contact us at{" "}
            <a className="font-medium text-primary hover:underline" href="mailto:treasuretots2025@gmail.com">
              treasuretots2025@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}