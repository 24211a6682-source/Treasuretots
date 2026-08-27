import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Our Commitment</h2>
          <p className="leading-relaxed text-foreground">
            Treasure Tots Creations respects your privacy. This policy explains what information
            we collect when you use our website, place an order, or contact us, and how we use it
            to provide and improve our services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Information We Collect</h2>
          <p className="leading-relaxed text-foreground">
            When you create an account or place an order, we may collect your name, email address,
            phone number, delivery address, order details, and information you provide for
            personalised products. We also receive basic technical information needed to keep the
            website secure and working correctly.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">How We Use Information</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-foreground">
            <li>To process orders, payments, delivery, and personalised product requests.</li>
            <li>To provide account access, order history, support, and password recovery.</li>
            <li>To send essential order and service updates.</li>
            <li>To protect our website, customers, and services from misuse or fraud.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Payments and Sharing</h2>
          <p className="leading-relaxed text-foreground">
            Online payments are processed through Razorpay. We do not store your complete card,
            UPI, or banking credentials on our servers. We share only the information needed with
            payment, delivery, and service providers to complete your order. We do not sell your
            personal information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Data Choices and Security</h2>
          <p className="leading-relaxed text-foreground">
            We use reasonable safeguards to protect the information we hold and retain it only as
            long as needed for the purposes described here, legal requirements, and resolving
            disputes. You may contact us to ask about or update the personal information associated
            with your account.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Contact</h2>
          <p className="leading-relaxed text-foreground">
            For privacy questions or requests, please contact us at{" "}
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