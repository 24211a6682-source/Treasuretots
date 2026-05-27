import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const products = [
  // Learning & Devotion
  {
    id: 1, name: "Hanuman Chalisa Book (English & Telugu)", slug: "hanuman-chalisa-book",
    category: "learning", price: "120.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/hanuman/hanuman1.jpg",
    images: ["/assets/images/hanuman/hanuman1.jpg","/assets/images/hanuman/hanuman2.jpg","/assets/images/hanuman/hanuman3.jpg","/assets/images/hanuman/hanuman4.jpg","/assets/images/hanuman/hanuman5.jpg","/assets/images/hanuman/hanuman6.jpg"],
    description: "A beautifully illustrated Hanuman Chalisa book in English & Telugu. Perfect for children to learn devotional shlokas with colorful, engaging artwork. Handcrafted with love by TreasureTots Creations.",
    subcategory: null,
  },
  {
    id: 2, name: "Coloring Book of Gods & Goddess", slug: "coloring-book-gods-goddess",
    category: "learning", price: "70.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/color book/godsandcolor1.jpg",
    images: ["/assets/images/color book/godsandcolor1.jpg","/assets/images/color book/godsandcolor2.jpg","/assets/images/color book/godsandcolor3.jpg","/assets/images/color book/godsandcolor4.jpg","/assets/images/color book/godsandcolor5.jpg","/assets/images/color book/godsandcolor6.jpg"],
    description: "A delightful coloring book featuring Gods & Goddesses from Hindu mythology. Encourages creativity while introducing children to devotional figures in a fun, interactive way.",
    subcategory: null,
  },
  {
    id: 3, name: "Bala Mantra Shloka Book", slug: "bala-mantra-shloka-book",
    category: "learning", price: "120.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/balamantra/balamantra1.jpg",
    images: ["/assets/images/balamantra/balamantra1.jpg","/assets/images/balamantra/balamantra2.jpg","/assets/images/balamantra/balamantra3.jpg","/assets/images/balamantra/balamantra4.jpg"],
    description: "A collection of essential shlokas and mantras for children, presented in simple, easy-to-learn format. Builds spiritual foundation from an early age with beautiful illustrations.",
    subcategory: null,
  },
  {
    id: 4, name: "Vemana Padyalu Book", slug: "vemana-padyalu-book",
    category: "learning", price: "100.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/vemana padhyalu/vemana1.jpg",
    images: ["/assets/images/vemana padhyalu/vemana1.jpg","/assets/images/vemana padhyalu/vemana2.jpg","/assets/images/vemana padhyalu/vemana3.jpg","/assets/images/vemana padhyalu/vemana4.jpg","/assets/images/vemana padhyalu/vemana5.jpg","/assets/images/vemana padhyalu/vemana6.jpg","/assets/images/vemana padhyalu/vemana7.jpg"],
    description: "Classic Vemana Padyalu — timeless Telugu poetry that imparts wisdom and moral values to children. Beautifully illustrated to engage young minds with our rich cultural heritage.",
    subcategory: null,
  },
  {
    id: 5, name: "Srinivasa Kalyanam", slug: "srinivasa-kalyanam",
    category: "learning", price: "200.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/kalyanam/kalyanam1.jpg",
    images: ["/assets/images/kalyanam/kalyanam1.jpg","/assets/images/kalyanam/kalyanam2.jpg","/assets/images/kalyanam/kalyanam3.jpg","/assets/images/kalyanam/kalyanam4.jpg"],
    description: "The divine wedding of Lord Srinivasa beautifully narrated for children. Rich with cultural traditions and vibrant illustrations.",
    subcategory: null,
  },
  {
    id: 6, name: "Sanatana Stories", slug: "sanatana-stories",
    category: "learning", price: "150.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/sanatana/sanatana1.jpg",
    images: ["/assets/images/sanatana/sanatana1.jpg","/assets/images/sanatana/sanatana2.jpg","/assets/images/sanatana/sanatana3.jpg"],
    description: "Enchanting stories from Sanatana Dharma that instill values of honesty, courage, and compassion in children.",
    subcategory: null,
  },
  // Flash Cards
  {
    id: 7, name: "A-Z Phonics Flash Cards", slug: "az-phonics-flash-cards",
    category: "flashcards", price: "250.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/flash cards/A-z phonics/abc1.jpg",
    images: ["/assets/images/flash cards/A-z phonics/abc1.jpg","/assets/images/flash cards/A-z phonics/abc2.jpg","/assets/images/flash cards/A-z phonics/abc3.jpg","/assets/images/flash cards/A-z phonics/abc4.jpg","/assets/images/flash cards/A-z phonics/abc5.jpg","/assets/images/flash cards/A-z phonics/abc6.jpg","/assets/images/flash cards/A-z phonics/abc7.jpg"],
    description: "Complete A-Z English Phonics Flash Cards set with vibrant illustrations. Designed to make early reading and phonics fun and effective for young learners.",
    subcategory: null,
  },
  {
    id: 8, name: "A-Z Gods & Goddess Flash Cards", slug: "az-gods-goddess-flash-cards",
    category: "flashcards", price: "250.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/flash cards/a-z god flash cards/englishgod1.jpg",
    images: ["/assets/images/flash cards/a-z god flash cards/englishgod1.jpg","/assets/images/flash cards/a-z god flash cards/englishgod2.jpg","/assets/images/flash cards/a-z god flash cards/englishgod3.jpg","/assets/images/flash cards/a-z god flash cards/englishgod4.jpg","/assets/images/flash cards/a-z god flash cards/englishgod5.jpg"],
    description: "A-Z Flash Cards featuring Hindu Gods & Goddesses — learn the alphabet while discovering divine figures from Indian mythology.",
    subcategory: null,
  },
  {
    id: 9, name: "Telugu Varnamala Achulu Flash Cards", slug: "telugu-varnamala-achulu-flash-cards",
    category: "flashcards", price: "200.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/flash cards/telugu varnamala achulu/telugufc1.jpg",
    images: ["/assets/images/flash cards/telugu varnamala achulu/telugufc1.jpg","/assets/images/flash cards/telugu varnamala achulu/telugufc2.jpg","/assets/images/flash cards/telugu varnamala achulu/telugufc3.jpg","/assets/images/flash cards/telugu varnamala achulu/telugufc4.jpeg","/assets/images/flash cards/telugu varnamala achulu/telugufc5.jpeg","/assets/images/flash cards/telugu varnamala achulu/telugufc6.jpeg","/assets/images/flash cards/telugu varnamala achulu/telugufc7.jpeg"],
    description: "Telugu Varnamala Achulu Flash Cards — learn Telugu vowels through fun, illustrated cards. Perfect for children learning Telugu as their mother tongue.",
    subcategory: null,
  },
  // Labels
  {
    id: 10, name: "Customised Name Tags", slug: "customised-name-tags",
    category: "labels", price: "150.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/customised tags/customised tags1.jpg",
    images: ["/assets/images/customised tags/customised tags1.jpg","/assets/images/customised tags/customised tags2.jpg","/assets/images/customised tags/customised tags3.jpg","/assets/images/customised tags/customised tags4.jpg","/assets/images/customised tags/customised tags5.jpg","/assets/images/customised tags/customised tags6.jpg","/assets/images/customised tags/customised tags7.jpg","/assets/images/customised tags/customised tags8.jpg"],
    description: "Adorable personalized name tags for your child's school bags, water bottles, tiffin boxes, and more! Waterproof, durable, and customized with your child's name.",
    subcategory: null,
  },
  {
    id: 11, name: "Labels & Stickers", slug: "labels-stickers",
    category: "labels", price: "150.00", stock: 999, isBuyable: true, isActive: true,
    coverImage: "/assets/images/labels and stickers/labels-stickers1.jpg",
    images: ["/assets/images/labels and stickers/labels-stickers1.jpg","/assets/images/labels and stickers/labels-stickers2.jpg","/assets/images/labels and stickers/labels-stickers3.jpg","/assets/images/labels and stickers/labels-stickers4.jpg","/assets/images/labels and stickers/labels-stickers5.jpg","/assets/images/labels and stickers/labels-stickers6.jpg"],
    description: "Fun and colorful labels & stickers for school supplies, notebooks, and more. Durable and vibrant — make your child's belongings uniquely theirs!",
    subcategory: null,
  },
];

async function seed() {
  console.log("Seeding products...");
  for (const product of products) {
    try {
      const existing = await db.select().from(productsTable).where(eq(productsTable.slug, product.slug)).limit(1);
      if (existing.length === 0) {
        await db.insert(productsTable).values({
          name: product.name,
          slug: product.slug,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          stock: product.stock,
          isBuyable: product.isBuyable,
          isActive: product.isActive,
          coverImage: product.coverImage,
          images: product.images,
          description: product.description,
        });
        console.log(`  ✓ Inserted: ${product.name}`);
      } else {
        await db.update(productsTable).set({
          name: product.name,
          price: product.price,
          coverImage: product.coverImage,
          images: product.images,
          description: product.description,
          stock: product.stock,
          isBuyable: product.isBuyable,
          isActive: product.isActive,
          category: product.category,
        }).where(eq(productsTable.slug, product.slug));
        console.log(`  ~ Updated: ${product.name}`);
      }
    } catch (err) {
      console.error(`  ✗ Failed: ${product.name}`, err);
    }
  }
  console.log("Done seeding.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
