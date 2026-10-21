// DEMO CATALOG — every dish, description and availability note here is
// placeholder content for the NWA sales preview. Nothing is a confirmed Choice
// menu. Prices are null until Turay verifies them; the UI shows "price to be
// confirmed" and never computes a total from unverified numbers.

export type MenuGroup = "todays" | "featured";
export type Tone = "ember" | "char" | "cream" | "leaf";

export type MenuEntry = {
  id: string;
  name: string;
  blurb: string;
  group: MenuGroup;
  /** Image slot: drop public/choice/<slot>.jpg|webp|png to replace the placeholder. */
  slot: string;
  tone: Tone;
  /** Verified price in USD, or null while unconfirmed. */
  price: number | null;
  /** Availability note, shown only where it applies. */
  availability: string | null;
};

export const MENU: MenuEntry[] = [
  { id: "burger", name: "Burger", blurb: "A stacked, toasted-bun favorite built for the first bite.", group: "todays", slot: "item-burger", tone: "ember", price: null, availability: "Daily offering (demo)" },
  { id: "burrito", name: "Burrito", blurb: "Hand-held and packed, wrapped up to go or to stay.", group: "todays", slot: "item-burrito", tone: "cream", price: null, availability: "Daily offering (demo)" },
  { id: "tacos", name: "Tacos", blurb: "Warm shells, bold fillings, best eaten right away.", group: "todays", slot: "item-tacos", tone: "leaf", price: null, availability: "Daily offering (demo)" },
  { id: "ramen", name: "Ramen", blurb: "A steaming bowl for the days that call for comfort.", group: "todays", slot: "item-ramen", tone: "char", price: null, availability: "Daily offering (demo)" },
  { id: "loaded-fries", name: "Loaded Fries", blurb: "Crisp fries piled high and meant for sharing.", group: "featured", slot: "item-loaded-fries", tone: "ember", price: null, availability: null },
  { id: "wrap", name: "Wrap", blurb: "Fresh, folded and easy to take with you.", group: "featured", slot: "item-wrap", tone: "leaf", price: null, availability: null },
  { id: "matcha-latte", name: "Matcha Latte", blurb: "Smooth, green and cold, a drink worth lingering over.", group: "featured", slot: "item-matcha-latte", tone: "cream", price: null, availability: null },
  { id: "thai-tea", name: "Thai Tea", blurb: "Sweet, creamy and unmistakably orange.", group: "featured", slot: "item-thai-tea", tone: "char", price: null, availability: null },
];

export const MENU_BY_ID = new Map(MENU.map((entry) => [entry.id, entry]));

export const MAX_QTY = 20;
