import { createHash, randomUUID } from "node:crypto";
import { ALLOWED_TRANSITIONS } from "@/lib/orders/transitions";
import type {
  DailySpecial,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderWithItems,
} from "@/lib/types/database";

if (typeof window !== "undefined") {
  throw new Error("Choice fixture store must stay on the server");
}

type FixtureOrder = OrderWithItems & { trackingTokenHash: string | null };
type FixtureState = {
  menu: MenuItem[];
  specials: DailySpecial[];
  orders: FixtureOrder[];
};

const FIXED_CREATED_AT = "2026-10-15T08:00:00.000Z";
const item = (id: string, name: string, category: string, description: string, price: number): MenuItem => ({
  id,
  name,
  category,
  description,
  price,
  is_available: true,
  image_url: null,
  created_at: FIXED_CREATED_AT,
});

const initialState = (): FixtureState => ({
  menu: [
    item("10000000-0000-4000-8000-000000000001", "Reef Fish & Rice", "Local Specials", "Grilled reef fish, steamed rice, cabbage slaw", 7.5),
    item("10000000-0000-4000-8000-000000000002", "Chuukese BBQ Chicken", "Local Specials", "Soy-lime marinated chicken thigh, grilled", 6.5),
    item("10000000-0000-4000-8000-000000000003", "Spam Musubi Plate", "Local Specials", "Grilled Spam over rice, nori wrap, 2 pieces", 4),
    item("10000000-0000-4000-8000-000000000004", "Breadfruit & Corned Beef", "Local Specials", "Fried breadfruit slices with corned beef gravy", 5.5),
    item("20000000-0000-4000-8000-000000000001", "Choice Classic Burger", "Burgers & Sandwiches", "Beef patty, lettuce, tomato, house sauce", 4.5),
    item("20000000-0000-4000-8000-000000000002", "Double Cheeseburger", "Burgers & Sandwiches", "Two patties, American cheese, pickles", 6),
    item("20000000-0000-4000-8000-000000000003", "Crispy Chicken Sandwich", "Burgers & Sandwiches", "Fried chicken breast, mayo, shredded cabbage", 5),
    item("20000000-0000-4000-8000-000000000004", "Spam & Egg Sandwich", "Burgers & Sandwiches", "Grilled Spam, fried egg, toasted bun", 3.5),
    item("30000000-0000-4000-8000-000000000001", "French Fries", "Sides", "Crispy-cut, salted", 2),
    item("30000000-0000-4000-8000-000000000002", "Fried Rice", "Sides", "Egg fried rice, scallion", 2.5),
    item("30000000-0000-4000-8000-000000000003", "Coleslaw", "Sides", "House slaw, creamy dressing", 1.5),
    item("30000000-0000-4000-8000-000000000004", "Onion Rings", "Sides", "Beer-battered, 6 pieces", 2.5),
    item("40000000-0000-4000-8000-000000000001", "Coca-Cola (Can)", "Cold Drinks", "12 oz", 1.5),
    item("40000000-0000-4000-8000-000000000002", "Bottled Water", "Cold Drinks", "16.9 oz", 1),
    item("40000000-0000-4000-8000-000000000003", "Iced Tea", "Cold Drinks", "Unsweetened or sweet", 1.5),
    item("40000000-0000-4000-8000-000000000004", "Tropical Punch", "Cold Drinks", "House-made, 16 oz", 1.75),
  ],
  specials: [
    { id: "50000000-0000-4000-8000-000000000001", title: "Daily BBQ Lunch Plate", description: "BBQ chicken, rice, and slaw", price: 6.5, active: true, frequency: "daily", weekdays: [], image_url: null, created_at: FIXED_CREATED_AT },
    { id: "50000000-0000-4000-8000-000000000002", title: "Friday Fish Fry", description: "Whole fried reef fish, rice, and slaw — Fridays only", price: 8, active: true, frequency: "weekly", weekdays: [5], image_url: null, created_at: FIXED_CREATED_AT },
    { id: "50000000-0000-4000-8000-000000000003", title: "Sunday Chicken Special", description: "Half BBQ chicken with two sides", price: 7, active: false, frequency: "weekly", weekdays: [0], image_url: null, created_at: FIXED_CREATED_AT },
  ],
  orders: [],
});

declare global {
  var __choiceFixtureState: FixtureState | undefined;
}

/** Fixture data is intentionally process-local and only available in Next development mode. */
export function isChoiceFixtureMode(): boolean {
  const enabled = process.env.CHOICE_DATA_MODE === "fixtures";
  if (enabled && process.env.NODE_ENV === "production") {
    throw new Error("Choice fixture mode is disabled in production");
  }
  return enabled;
}

function state(): FixtureState {
  if (!isChoiceFixtureMode()) throw new Error("Choice fixture mode is not enabled");
  globalThis.__choiceFixtureState ??= initialState();
  return globalThis.__choiceFixtureState;
}

export function fixtureMenu(availableOnly = false): MenuItem[] {
  return state().menu
    .filter((row) => !availableOnly || row.is_available)
    .map((row) => ({ ...row }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export function fixtureSpecials(activeOnly = false): DailySpecial[] {
  return state().specials
    .filter((row) => !activeOnly || row.active)
    .map((row) => ({ ...row }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function fixtureUpsertMenu(input: Omit<MenuItem, "created_at">): MenuItem {
  const store = state();
  const existing = store.menu.find((row) => row.id === input.id);
  const saved = { ...input, created_at: existing?.created_at ?? new Date().toISOString() };
  store.menu = existing
    ? store.menu.map((row) => row.id === input.id ? saved : row)
    : [...store.menu, saved];
  return { ...saved };
}

export function fixtureSetMenuAvailability(id: string, available: boolean): boolean {
  const target = state().menu.find((row) => row.id === id);
  if (!target) return false;
  target.is_available = available;
  return true;
}

export function fixtureDeleteMenu(id: string): boolean {
  const store = state();
  const next = store.menu.filter((row) => row.id !== id);
  if (next.length === store.menu.length) return false;
  store.menu = next;
  return true;
}

export function fixtureUpsertSpecial(input: Omit<DailySpecial, "created_at">): DailySpecial {
  const store = state();
  const existing = store.specials.find((row) => row.id === input.id);
  const saved = { ...input, created_at: existing?.created_at ?? new Date().toISOString() };
  store.specials = existing
    ? store.specials.map((row) => row.id === input.id ? saved : row)
    : [saved, ...store.specials];
  return { ...saved };
}

export function fixturePlaceOrder(input: {
  name: string;
  items: { item_id: string; quantity: number; special_instructions: string | null }[];
  trackingTokenHash: string;
}): string {
  const store = state();
  if (!input.name.trim() || input.name.trim().length > 80) throw new Error("Invalid customer name");
  if (input.items.length < 1 || input.items.length > 30) throw new Error("Invalid order lines");
  if (!/^[a-f0-9]{64}$/i.test(input.trackingTokenHash)) throw new Error("Invalid tracking capability");
  if (new Set(input.items.map((line) => line.item_id)).size !== input.items.length) {
    throw new Error("Duplicate menu lines are not allowed");
  }

  // Resolve and snapshot every line before mutating state, matching the SQL RPC's
  // all-or-nothing behavior and never trusting a client-supplied price or total.
  const lines = input.items.map((line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
      throw new Error("Invalid quantity");
    }
    if (line.special_instructions && line.special_instructions.length > 250) {
      throw new Error("Invalid instructions");
    }
    const menuItem = store.menu.find((row) => row.id === line.item_id && row.is_available);
    if (!menuItem) throw new Error("One or more menu items are unavailable");
    return {
      id: randomUUID(),
      order_id: "",
      item_name: menuItem.name,
      quantity: line.quantity,
      price_at_time: menuItem.price,
      special_instructions: line.special_instructions?.trim() || null,
    } satisfies OrderItem;
  });
  const id = randomUUID();
  const now = new Date().toISOString();
  const order: FixtureOrder = {
    id,
    customer_name: input.name.trim(),
    status: "pending",
    total: Number(lines.reduce((sum, line) => sum + line.price_at_time * line.quantity, 0).toFixed(2)),
    created_at: now,
    updated_at: now,
    trackingTokenHash: input.trackingTokenHash,
    order_items: lines.map((line) => ({ ...line, order_id: id })),
  };
  store.orders = [...store.orders, order];
  return id;
}

export function fixtureTrackedOrder(id: string, token: string): OrderWithItems | null {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const order = state().orders.find((row) => row.id === id && row.trackingTokenHash === tokenHash);
  if (!order) return null;
  const { trackingTokenHash: _privateHash, ...publicOrder } = order;
  return structuredClone(publicOrder);
}

export function fixtureTrackedOrderStatus(id: string, token: string): Pick<Order, "status" | "updated_at"> | null {
  const order = fixtureTrackedOrder(id, token);
  return order ? { status: order.status, updated_at: order.updated_at } : null;
}

export function fixtureOwnerOrders(start?: string, end?: string): Order[] {
  return state().orders
    .filter((row) => (!start || row.created_at >= start) && (!end || row.created_at < end))
    .map(({ order_items: _items, trackingTokenHash: _token, ...order }) => ({ ...order }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function fixtureOwnerActiveOrders(): OrderWithItems[] {
  return state().orders
    .filter((row) => row.status !== "completed")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(({ trackingTokenHash: _token, ...row }) => structuredClone(row));
}

export function fixtureOwnerOrder(id: string): OrderWithItems | null {
  const row = state().orders.find((order) => order.id === id);
  if (!row) return null;
  const { trackingTokenHash: _token, ...order } = row;
  return structuredClone(order);
}

export function fixtureAdvanceOrder(id: string, expected: OrderStatus, next: OrderStatus): boolean {
  if (ALLOWED_TRANSITIONS[expected] !== next) return false;
  const order = state().orders.find((row) => row.id === id && row.status === expected);
  if (!order) return false;
  order.status = next;
  order.updated_at = new Date().toISOString();
  return true;
}
