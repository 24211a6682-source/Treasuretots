import { Link } from "wouter";
import { BookOpen, Image, Tags } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FAQItem = { question: string; answer: React.ReactNode };

const storybookFAQs: FAQItem[] = [
  { question: "What is so unique about a Treasure Tots customised story book?", answer: <>Every book is created especially for your child. Your child becomes the hero of their own magical adventure! We personalise the story, characters, theme and illustrations to create a one-of-a-kind storybook that your child can cherish forever.</> },
  { question: "Can I give my own story?", answer: <>Yes! ❤️ You can share your own story, concept, family memory or special idea with us. We can transform your idea into a beautifully illustrated personalised storybook, depending on the scope of customisation.</> },
  { question: "How can I provide images of my child?", answer: <>After placing your order, you can share your child's photographs with us through the WhatsApp/contact method provided by Treasure Tots.<br /><br />For the best results, please provide clear, well-lit photographs where your child's face is clearly visible.</> },
  { question: "Will I get a sample before the book is created?", answer: <>Yes! We first create and share an initial cover-page sample featuring your personalised character.<br /><br />This allows you to check whether the facial features and overall character appearance match before we proceed with creating the complete book.</> },
  { question: "What happens after I approve the cover-page sample?", answer: <>Once you approve the cover-page sample, we proceed with creating the complete personalised storybook, including the story and illustrations.<br /><br />A PDF of the completed book will then be shared with you for review.</> },
  { question: "Can I make changes after the PDF is shared?", answer: <>Yes. Two revisions are included with your customised storybook.<br /><br />After receiving the PDF, you can review the complete book and share your changes. We will make the included revisions and share the updated version for your approval.<br /><br />Additional revisions, if required, may be chargeable.</> },
  { question: "When does the book go for printing?", answer: <>The book is sent for printing only after you approve the final PDF.<br /><br />This gives you the opportunity to review the complete personalised book before it goes into print.</> },
  { question: "Can I cancel my order or request a refund?", answer: <>Cancellation/refund is possible before the initial cover-page sample is shared.<br /><br />Once the initial cover-page sample has been shared, the order becomes non-refundable, as personalised work has commenced specifically for your order.</> },
  { question: "How many days does the entire delivery process take?", answer: <>The complete process, including personalisation, cover-page creation, story creation, illustrations, revisions, final approval, printing and delivery, generally takes around 10–15 days.</> },
  { question: "Can I order a single story book for both my kids?", answer: <>Yes! You can create one personalised storybook featuring both your children together in the same story. Both children can become characters/heroes in their shared adventure.<br /><br />If you prefer separate personalised books for each child, you can also place individual orders.<br /><br />For current pricing and sibling options, please contact us.</> },
  { question: "Can I choose the theme and characters for my child's story?", answer: <>Yes! You can tell us about your child's favourite themes, characters, interests or story ideas. We will work with you to create a magical story that suits your preferences, subject to availability and copyright restrictions.</> },
  { question: "Can the story book be customised for adults?", answer: <>Yes! ❤️ Our customised storybooks are not just for children. We can create personalised stories for adults too—whether it's a romantic story, family memory, friendship journey, special milestone or a unique gift.<br /><br />Tell us your idea, and we'll turn it into a story made especially for you.</> },
  { question: "How much does a customised story book cost?", answer: <>Pricing depends on the type and level of customisation required.<br /><br />Please contact Treasure Tots for current pricing and available options.</> },
  { question: "Can I order a customised story book as a gift?", answer: <>Absolutely! 🎁 A personalised storybook makes a beautiful and memorable gift for birthdays, Raksha Bandhan, special occasions and celebrations.<br /><br />A story made just for you. A treasure to cherish forever. ❤️</> },
];

const wallpaperFAQs: FAQItem[] = [
  { question: "How do I provide my wallpaper requirements and measurements?", answer: <>Please share your wall dimensions/measurements, along with details such as the wall you want to customise, preferred theme/design, and any other requirements. You can also share photos or videos of the wall to help us understand the space better.<br /><br />If you are unsure how to measure the wall, don’t worry! Contact us and we’ll guide you through the process.</> },
  { question: "What will be the cost of the customised wallpaper?", answer: <>The cost depends on the size of the wall, measurements and the material selected.<br /><br />Please share your wall measurements and requirements with us, and we will provide you with a quotation based on the size and material used.</> },
  { question: "Is wallpaper installation available?", answer: <>Yes! Installation is available in major cities across India.<br /><br />We have partnered with Design Walls for professional wallpaper installation. Once your order is confirmed, we can help coordinate the installation based on your location and availability.</> },
];

const nameTagFAQs: FAQItem[] = [
  { question: "What are Treasure Tots customised name tags?", answer: <>They are high-quality PVC cards that are durable and perfect for everyday use. The design is completely customisable, so you can create a tag that is unique to you.</> },
  { question: "Can I customise both sides of the tag?", answer: <>Yes! We offer printing on both sides, allowing you to personalise the front and back with names, contact details, designs or other information.</> },
  { question: "Where can I use the customised name tags?", answer: <>They are ideal for school bags, luggage bags, lunch bags and travel bags, making it easy to identify your belongings while adding a personalised touch.</> },
];

function FAQSection({ id, title, icon: Icon, items }: { id: string; title: string; icon: typeof BookOpen; items: FAQItem[] }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
        <h2 className="text-xl font-bold leading-tight sm:text-2xl">{title}</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`${id}-${index}`}>
            <AccordionTrigger className="gap-4 text-left text-sm leading-relaxed sm:text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default function FAQ() {
  return (
    <div className="bg-orange-50/30">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Helpful answers</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Treasure Tots FAQs</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Everything you need to know about our personalised storybooks, customised wallpapers and name tags.</p>
          <nav className="mt-6 flex flex-wrap justify-center gap-2 text-sm" aria-label="FAQ sections">
            <a href="#storybooks" className="rounded-full border bg-white px-4 py-2 font-medium hover:border-primary hover:text-primary">Story Books</a>
            <a href="#wallpapers" className="rounded-full border bg-white px-4 py-2 font-medium hover:border-primary hover:text-primary">Wallpapers</a>
            <a href="#name-tags" className="rounded-full border bg-white px-4 py-2 font-medium hover:border-primary hover:text-primary">Name Tags</a>
          </nav>
        </div>
        <div className="space-y-6">
          <FAQSection id="storybooks" title="Treasure Tots – Customised Story Book FAQs" icon={BookOpen} items={storybookFAQs} />
          <FAQSection id="wallpapers" title="Treasure Tots – Customised Wallpapers FAQs" icon={Image} items={wallpaperFAQs} />
          <FAQSection id="name-tags" title="Treasure Tots – Customised Name Tags FAQs" icon={Tags} items={nameTagFAQs} />
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Still have a question? <Link href="/shipping" className="font-semibold text-primary hover:underline">See our shipping policy</Link> or contact us through the options on each product page.</p>
      </div>
    </div>
  );
}