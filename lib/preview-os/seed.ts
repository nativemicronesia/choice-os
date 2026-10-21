import type { Dish, PreviewOrder, PreviewState } from "./types";

// Sample dishes mirror the storefront's demo catalog ids (lib/storefront/catalog.ts)
// so demo orders from the public preview line up. All placeholder content.
const dish = (
  id: string,
  name: string,
  description: string,
  group: Dish["group"],
  tone: Dish["tone"],
): Dish => ({ id, name, description, price: null, available: true, group, tone, image: null, demo: true });

export const SEED_DISHES: Dish[] = [
  dish("burger", "Burger", "A stacked, toasted-bun favorite built for the first bite.", "todays", "ember"),
  dish("burrito", "Burrito", "Hand-held and packed, wrapped up to go or to stay.", "todays", "cream"),
  dish("tacos", "Tacos", "Warm shells, bold fillings, best eaten right away.", "todays", "leaf"),
  dish("ramen", "Ramen", "A steaming bowl for the days that call for comfort.", "todays", "char"),
  dish("loaded-fries", "Loaded Fries", "Crisp fries piled high and meant for sharing.", "featured", "ember"),
  dish("wrap", "Wrap", "Fresh, folded and easy to take with you.", "featured", "leaf"),
  dish("matcha-latte", "Matcha Latte", "Smooth, green and cold, a drink worth lingering over.", "featured", "cream"),
  dish("thai-tea", "Thai Tea", "Sweet, creamy and unmistakably orange.", "featured", "char"),
];

const minutesAgo = (now: number, m: number) => new Date(now - m * 60_000).toISOString();

export function seedOrders(now: number): PreviewOrder[] {
  const line = (itemId: string, quantity: number) => ({
    itemId,
    name: SEED_DISHES.find((d) => d.id === itemId)?.name ?? itemId,
    quantity,
    price: null,
  });
  const make = (
    n: number,
    customer: string,
    preference: PreviewOrder["preference"],
    note: string,
    lines: PreviewOrder["lines"],
    status: PreviewOrder["status"],
    age: number,
  ): PreviewOrder => {
    const createdAt = minutesAgo(now, age);
    const steps = ["new", "accepted", "preparing", "ready", "completed"] as const;
    const reached = steps.slice(0, steps.indexOf(status) + 1);
    return {
      id: `sample-${n}`,
      reference: `SAMPLE-${n}`,
      source: "sample",
      customer,
      contact: "Sample contact",
      preference,
      note,
      lines,
      status,
      createdAt,
      history: reached.map((s, i) => ({ status: s, at: minutesAgo(now, Math.max(age - i * 4, 0)) })),
    };
  };
  return [
    make(1, "Sample Customer A", "stop-by", "Sample note: please keep it simple.", [line("burger", 2), line("loaded-fries", 1)], "new", 3),
    make(2, "Sample Customer B", "dine-in", "", [line("ramen", 1), line("thai-tea", 1)], "new", 9),
    make(3, "Sample Customer C", "undecided", "", [line("tacos", 3)], "preparing", 22),
  ];
}

export function seedState(now = Date.now()): PreviewState {
  return {
    v: 1,
    dishes: SEED_DISHES.map((d) => ({ ...d })),
    orders: seedOrders(now),
    seenRefs: [],
    lastStorefrontSync: null,
  };
}
