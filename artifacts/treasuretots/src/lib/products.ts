export type ProductCategory = "learning" | "flashcards" | "storybooks" | "wallpapers" | "labels";
export type StoryCategory = "mythology" | "adventure" | "princess" | "superhero" | "anime" | "sports" | "career";

export interface ProductData {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  price?: number;
  isBuyable: boolean;
  coverImage: string;
  images: string[];
  description?: string;
  language?: string;
  ageGroup?: string;
  format?: string;
  requiresChildName?: boolean;
  enquiryNote?: string;
  storyCategory?: StoryCategory;
}

// Wallpapers & Frames (ENQUIRE ONLY — kept static)
export const wallpaperProducts: ProductData[] = [
  {
    id: 12,
    slug: "customized-wallpapers",
    name: "Customized Wallpapers",
    category: "wallpapers",
    isBuyable: false,
    coverImage: "/assets/images/wallpapers/wallpapers.jpg",
    images: [
      "/assets/images/wallpapers/wallpapers.jpg",
      "/assets/images/wallpapers/wallpaper2.jpeg",
      "/assets/images/wallpapers/wallpaper3.jpeg",
    ],
    description: "Personalized wall art for your child's room. Transform any wall into a magical space with custom designs that spark creativity and imagination.",
    enquiryNote: "Price on enquiry. Contact us on WhatsApp for customization details.",
  },
  {
    id: 13,
    slug: "customized-frames",
    name: "Customized Frames",
    category: "wallpapers",
    isBuyable: false,
    coverImage: "/assets/images/customized frame 1.jpeg",
    images: [
      "/assets/images/customized frame 1.jpeg",
    ],
    description: "Beautiful customized frames to preserve your child's precious memories. Personalized with your child's name and special messages.",
    enquiryNote: "Price on enquiry. Contact us on WhatsApp for customization details.",
  },
];

// Customized Story Books (ENQUIRE ONLY — kept static because StorybookData has different fields)
export interface StorybookData {
  id: number;
  slug: string;
  name: string;
  storyCategory: StoryCategory;
  coverImage: string;
  previewImage: string;
}

export const storybookProducts: StorybookData[] = [
  // MYTHOLOGY
  { id: 101, slug: "a-day-with-hanuman", name: "A Day with Hanuman", storyCategory: "mythology", coverImage: "/assets/images/customized story books/A dayt with Hanuman/A day with Hanuman1.jpg", previewImage: "/assets/images/customized story books/A dayt with Hanuman/A day with Hanuman2.jpg" },
  { id: 102, slug: "abhimanyu", name: "Abhimanyu", storyCategory: "mythology", coverImage: "/assets/images/customized story books/Abhimanyu/Abhimanyu1.jpg", previewImage: "/assets/images/customized story books/Abhimanyu/Abhimanyu2.jpg" },
  { id: 103, slug: "andal", name: "Andal", storyCategory: "mythology", coverImage: "/assets/images/customized story books/Andal/Andal1.jpg", previewImage: "/assets/images/customized story books/Andal/Andal2.jpg" },
  { id: 104, slug: "arjuna", name: "Arjuna", storyCategory: "mythology", coverImage: "/assets/images/customized story books/Arjuna/Arjuna1.jpg", previewImage: "/assets/images/customized story books/Arjuna/Arjuna2.jpg" },
  { id: 105, slug: "bala-tripura-sundari", name: "Bala Tripura Sundari", storyCategory: "mythology", coverImage: "/assets/images/customized story books/Bala Tripura sundari/Bala Tripura sundari1.jpg", previewImage: "/assets/images/customized story books/Bala Tripura sundari/Bala Tripura sundari2.jpg" },
  { id: 106, slug: "princess-jijabai", name: "Princess Jijabai", storyCategory: "mythology", coverImage: "/assets/images/customized story books/jijabhai/Princess Jijabai1.jpg", previewImage: "/assets/images/customized story books/jijabhai/Princess Jijabai2.jpg" },
  { id: 107, slug: "krishna", name: "Krishna", storyCategory: "mythology", coverImage: "/assets/images/customized story books/krishna/Krishna1.jpg", previewImage: "/assets/images/customized story books/krishna/Krishna2.jpg" },
  { id: 108, slug: "lord-rama", name: "Lord Rama", storyCategory: "mythology", coverImage: "/assets/images/customized story books/rama/Lord Rama1.jpg", previewImage: "/assets/images/customized story books/rama/Lord Rama2.jpg" },
  { id: 109, slug: "lord-shiva", name: "Lord Shiva", storyCategory: "mythology", coverImage: "/assets/images/customized story books/lord shiva/Lord Shiva1.jpg", previewImage: "/assets/images/customized story books/lord shiva/Lord Shiva2.jpg" },
  { id: 110, slug: "navadurga", name: "Navadurga", storyCategory: "mythology", coverImage: "/assets/images/customized story books/navadurga/Navadurga1.jpg", previewImage: "/assets/images/customized story books/navadurga/Navadurga2.jpg" },
  { id: 111, slug: "radha", name: "Radha", storyCategory: "mythology", coverImage: "/assets/images/customized story books/radha/Radha1.jpg", previewImage: "/assets/images/customized story books/radha/Radha2.jpg" },
  { id: 112, slug: "rani-rudramadevi", name: "Rani Rudramadevi", storyCategory: "mythology", coverImage: "/assets/images/customized story books/rani rudhramadevi/Rani  Rudramadevi1.jpg", previewImage: "/assets/images/customized story books/rani rudhramadevi/Rani  Rudramadevi2.jpg" },
  { id: 113, slug: "shivaji", name: "Chatrapati Shivaji Maharaj", storyCategory: "mythology", coverImage: "/assets/images/customized story books/shivaji/Chatrapati Shivaji Maharaj1.jpg", previewImage: "/assets/images/customized story books/shivaji/Chatrapati Shivaji Maharaj2.jpg" },
  // ADVENTURE
  { id: 201, slug: "astronaut-adventure", name: "Astronaut Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/Arstonaut/Astronaut Adventure1.jpg", previewImage: "/assets/images/customized story books/Arstonaut/Astronaut Adventure2.jpg" },
  { id: 202, slug: "cycle-adventure", name: "Cycle Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/Cycle adv/Cycle Adventure1.jpg", previewImage: "/assets/images/customized story books/Cycle adv/Cycle Adventure2.jpg" },
  { id: 203, slug: "dragon-adventure", name: "Dragon Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/Dragon Adv/Dragon Adventure1.jpg", previewImage: "/assets/images/customized story books/Dragon Adv/Dragon Adventure2.jpg" },
  { id: 204, slug: "ice-crystal-adventure", name: "Ice Crystal Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/ice crystal adfv/Ice crystal Adventure1.jpg", previewImage: "/assets/images/customized story books/ice crystal adfv/Ice crystal Adventure2.jpg" },
  { id: 205, slug: "journey-of-future-black-belt", name: "Journey of Future Black Belt", storyCategory: "adventure", coverImage: "/assets/images/customized story books/journey of future black belt/Journey Of Future Black Belt1.jpg", previewImage: "/assets/images/customized story books/journey of future black belt/Journey Of Future Black Belt2.jpg" },
  { id: 206, slug: "magic-lamp", name: "Magic Lamp", storyCategory: "adventure", coverImage: "/assets/images/customized story books/magic lamp/Magic lamp1.jpg", previewImage: "/assets/images/customized story books/magic lamp/Magic lamp2.jpg" },
  { id: 207, slug: "mowgli-the-jungle-roar", name: "Mowgli — The Jungle Roar", storyCategory: "adventure", coverImage: "/assets/images/customized story books/mowgli/Mowgli-The Jungle Roar1.jpg", previewImage: "/assets/images/customized story books/mowgli/Mowgli-The Jungle Roar2.jpg" },
  { id: 208, slug: "racer-adventure", name: "Racer Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/racer adventure/Racer Adventure1.jpg", previewImage: "/assets/images/customized story books/racer adventure/Racer Adventure2.jpg" },
  { id: 209, slug: "sea-surfer", name: "Sea Surfer Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/sea surfer/Sea surferer1.jpg", previewImage: "/assets/images/customized story books/sea surfer/Sea surferer2.jpg" },
  { id: 210, slug: "space-adventure", name: "Space Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/space adv/Space Adventure1.jpg", previewImage: "/assets/images/customized story books/space adv/Space Adventure2.jpg" },
  { id: 211, slug: "underwater-adventure", name: "Underwater Adventure", storyCategory: "adventure", coverImage: "/assets/images/customized story books/underwater adv/Underwater Adventure1.jpg", previewImage: "/assets/images/customized story books/underwater adv/Underwater Adventure2.jpg" },
  // PRINCESS / FANTASY
  { id: 301, slug: "cinderella", name: "Cinderella", storyCategory: "princess", coverImage: "/assets/images/customized story books/cindrella/Cindrella1.jpg", previewImage: "/assets/images/customized story books/cindrella/Cindrella2.jpg" },
  { id: 302, slug: "frozen-princess", name: "Frozen Princess", storyCategory: "princess", coverImage: "/assets/images/customized story books/frozen/Frozen Princess1.jpg", previewImage: "/assets/images/customized story books/frozen/Frozen Princess2.jpg" },
  { id: 303, slug: "mermaid", name: "Mermaid", storyCategory: "princess", coverImage: "/assets/images/customized story books/mermaid/Mermaid1.jpg", previewImage: "/assets/images/customized story books/mermaid/Mermaid2.jpg" },
  { id: 304, slug: "moana-adventure", name: "Moana's Adventure", storyCategory: "princess", coverImage: "/assets/images/customized story books/mona/Moana's Adventure1.jpg", previewImage: "/assets/images/customized story books/mona/Moana's Adventure2.jpg" },
  { id: 305, slug: "unicorn-princess", name: "Unicorn Princess", storyCategory: "princess", coverImage: "/assets/images/customized story books/unicorn princess/Unicorn Princess1.jpg", previewImage: "/assets/images/customized story books/unicorn princess/Unicorn Princess2.jpg" },
  // SUPERHERO
  { id: 401, slug: "avengers-adventure", name: "Avengers Adventure", storyCategory: "superhero", coverImage: "/assets/images/customized story books/Avengers/Avengers Advanture1.jpg", previewImage: "/assets/images/customized story books/Avengers/Avengers Advanture2.jpg" },
  { id: 406, slug: "spiderman", name: "Spiderman", storyCategory: "superhero", coverImage: "/assets/images/customized story books/spidey/Spiderman1.jpg", previewImage: "/assets/images/customized story books/spidey/Spiderman2.jpg" },
  // ANIME
  { id: 402, slug: "harry-potter", name: "Harry Potter", storyCategory: "anime", coverImage: "/assets/images/customized story books/harry potter/Harry Potter1.jpg", previewImage: "/assets/images/customized story books/harry potter/Harry Potter2.jpg" },
  { id: 403, slug: "hermione-granger", name: "Hermione Granger", storyCategory: "anime", coverImage: "/assets/images/customized story books/hermoine granger/Hermione Granger1.jpg", previewImage: "/assets/images/customized story books/hermoine granger/Hermione Granger2.jpg" },
  { id: 404, slug: "lightning-mcqueen", name: "Lightning McQueen", storyCategory: "anime", coverImage: "/assets/images/customized story books/lightning mcqueen/Lightning MC Queen1.jpg", previewImage: "/assets/images/customized story books/lightning mcqueen/Lightning MC Queen2.jpg" },
  { id: 405, slug: "naruto-adventure", name: "Naruto Adventure", storyCategory: "anime", coverImage: "/assets/images/customized story books/naruto adv/Naruto Adventure1.jpg", previewImage: "/assets/images/customized story books/naruto adv/Naruto Adventure2.jpg" },
  // SPORTS
  { id: 503, slug: "taekwondo-champion", name: "Taekwondo Champion", storyCategory: "sports", coverImage: "/assets/images/customized story books/taekwondo/Taekwondo Champion1.jpg", previewImage: "/assets/images/customized story books/taekwondo/Taekwondo Champion2.jpg" },
  // CAREER
  { id: 501, slug: "firefighter", name: "Firefighter", storyCategory: "career", coverImage: "/assets/images/customized story books/fire fighter/Firefighter1.jpg", previewImage: "/assets/images/customized story books/fire fighter/Firefighter2.jpg" },
  { id: 502, slug: "police-officer", name: "Police Officer", storyCategory: "career", coverImage: "/assets/images/customized story books/police officer/Police officer1.jpg", previewImage: "/assets/images/customized story books/police officer/Police officer2.jpg" },
];

export const reviews = [
  { id: 1, text: "Received the items... The quality is very nice. All items received in good condition with proper packing. Thanks dear.", stars: 5 },
  { id: 2, text: "Hi sir, received the book. It is too good. He liked it very much. Thank you so much ❤️", stars: 5 },
  { id: 3, text: "Received ma'am. Really beautiful. The photo feels real. It doesn't look like animated or AI.", stars: 5 },
  { id: 4, text: "Hi Akshatha, we received the book and we love it ❤️ Looking forward to more!!!", stars: 5 },
  { id: 5, text: "Wow amazing thank you so much 😊 The book is absolutely beautiful. Quality is great, personalization is perfect. My son loved it! Highly recommend!", stars: 5 },
  { id: 6, text: "Thank you for the wonderful book. It turned out really well and the quality is excellent. Looking forward to ordering again.", stars: 5 },
  { id: 7, text: "Thank you for delivering the book personally. Book quality is very good. I was searching for Hanuman Chalisa book from many days. This is so perfect and affordable too.", stars: 5 },
  { id: 8, text: "Thank you for the beautiful personalized Harry Potter book ma'am. We received it just in time. He's flying to USA tomorrow and he absolutely loved it. Incredible work.", stars: 5 },
  { id: 9, text: "Everyone in the house liked it a lot. Nice work friend, lots of love. Keep shining with unique projects like this.", stars: 5 },
  { id: 10, text: "This was a really good story book. My daughter liked it a lot and all her friends' parents liked it and took your contact number.", stars: 5 },
  { id: 11, text: "I gave my daughter 6 gifts on her 6th birthday. The most favourite was the rangoli book. She is learning through it. We are really happy.", stars: 5 },
  { id: 12, text: "I bought your flashcards from Vinay Varanasi's Sundara Hanuman event stall. They are really good.", stars: 5 },
  { id: 13, text: "My son loved the book. He was so happy.", stars: 5 },
];

export const WHATSAPP_NUMBER = "918050640552";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PHONE = "+91 805 064 0552";
export const INSTAGRAM_URL = "https://www.instagram.com/treasuretots2025";
export const EMAIL = "treasuretots2025@gmail.com";

export function getWhatsAppEnquiryUrl(bookName: string) {
  const message = encodeURIComponent(
    `Hi! I want to order a personalized ${bookName} storybook. Please share pricing and customization details.`
  );
  return `${WHATSAPP_URL}?text=${message}`;
}

export function getWhatsAppInterestUrl(bookName: string) {
  const message = encodeURIComponent(
    `Hi! I am interested in the ${bookName} personalized storybook. Can you please share pricing and customization details?`
  );
  return `${WHATSAPP_URL}?text=${message}`;
}
