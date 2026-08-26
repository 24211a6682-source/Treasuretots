import { Instagram, Mail, MessageCircle } from "lucide-react";
import { EMAIL, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/products";

export default function Contact() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          We’re here to help
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Have a question about your order or delivery? We&apos;re happy to help.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50/50 p-5 text-center transition-colors hover:border-green-400"
        >
          <MessageCircle className="mb-3 h-6 w-6 text-green-600" aria-hidden="true" />
          <span className="font-semibold text-gray-900">WhatsApp</span>
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white p-5 text-center transition-colors hover:border-primary"
        >
          <Mail className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="mt-1 break-all text-sm font-semibold text-gray-900">{EMAIL}</span>
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/40 p-5 text-center transition-colors hover:border-pink-300"
        >
          <Instagram className="mb-3 h-6 w-6 text-pink-600" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Instagram</span>
          <span className="mt-1 text-sm font-semibold text-gray-900">@treasuretots2025</span>
        </a>
      </div>
    </div>
  );
}