import { ORDER_STATUSES, type Dish, type OrderStatus, type PreviewOrder, type PreviewState, type StorefrontRecord } from "./types";
import { SEED_DISHES } from "./seed";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

/** Button wording for moving an order from this status to the next. */
export const NEXT_ACTION: Record<OrderStatus, string | null> = {
  new: "Accept order",
  accepted: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark completed",
  completed: null,
};

export const nextStatus = (s: OrderStatus): OrderStatus | null => ORDER_STATUSES[ORDER_STATUSES.indexOf(s) + 1] ?? null;
export const prevStatus = (s: OrderStatus): OrderStatus | null => ORDER_STATUSES[ORDER_STATUSES.indexOf(s) - 1] ?? null;

export function setOrderStatus(state: PreviewState, id: string, to: OrderStatus, at = new Date().toISOString()): PreviewState {
  return {
    ...state,
    orders: state.orders.map((o) => {
      if (o.id !== id || o.status === to) return o;
      // History keeps the stages reached so far; stepping back trims later ones.
      const keep = o.history.filter((h) => ORDER_STATUSES.indexOf(h.status) < ORDER_STATUSES.indexOf(to));
      return { ...o, status: to, history: [...keep, { status: to, at }] };
    }),
  };
}

export function orderTotal(order: PreviewOrder): number | null {
  let total = 0;
  for (const l of order.lines) {
    if (l.price == null) return null;
    total += l.price * l.quantity;
  }
  return total;
}

export const itemCount = (order: PreviewOrder) => order.lines.reduce((n, l) => n + l.quantity, 0);

export const formatPrice = (p: number | null) => (p == null ? "Price not set" : `$${p.toFixed(2)}`);

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function upsertDish(state: PreviewState, dish: Dish): PreviewState {
  const exists = state.dishes.some((d) => d.id === dish.id);
  return { ...state, dishes: exists ? state.dishes.map((d) => (d.id === dish.id ? dish : d)) : [...state.dishes, dish] };
}

export const blankDish = (group: Dish["group"]): Dish => ({
  id: newId("dish"),
  name: "",
  description: "",
  price: null,
  available: true,
  group,
  tone: group === "todays" ? "ember" : "leaf",
  image: null,
  demo: false,
});

export const removeDish = (state: PreviewState, id: string): PreviewState => ({
  ...state,
  dishes: state.dishes.filter((d) => d.id !== id),
});

export const toggleDish = (state: PreviewState, id: string): PreviewState => ({
  ...state,
  dishes: state.dishes.map((d) => (d.id === id ? { ...d, available: !d.available } : d)),
});

/** Import storefront demo orders once each (by reference). Returns the same state if nothing is new. */
export function ingestStorefront(state: PreviewState, records: StorefrontRecord[], now = new Date().toISOString()): PreviewState {
  const seen = new Set(state.seenRefs);
  const fresh = records.filter((r) => r && typeof r.reference === "string" && !seen.has(r.reference));
  if (fresh.length === 0) return state;
  const dishFor = (id: string) => state.dishes.find((d) => d.id === id);
  const sampleName = (id: string) => SEED_DISHES.find((d) => d.id === id)?.name;
  const orders = fresh.map<PreviewOrder>((r) => {
    const createdAt = r.submittedAt || now;
    return {
      id: `sf-${r.reference}`,
      reference: r.reference,
      source: "storefront",
      customer: r.name,
      contact: r.contact,
      preference: r.location,
      note: r.note,
      lines: r.lines.map((l) => {
        const d = dishFor(l.itemId);
        return { itemId: l.itemId, name: d?.name ?? sampleName(l.itemId) ?? "Item no longer on the menu", quantity: l.quantity, price: d?.price ?? null };
      }),
      status: "new",
      createdAt,
      history: [{ status: "new", at: createdAt }],
    };
  });
  return {
    ...state,
    orders: [...orders, ...state.orders],
    seenRefs: [...state.seenRefs, ...fresh.map((r) => r.reference)].slice(-300),
    lastStorefrontSync: now,
  };
}

/** Build a sample order from dishes currently available, so Turay can rehearse the flow. */
export function addSampleOrder(state: PreviewState, rand = Math.random, now = new Date().toISOString()): PreviewState {
  const pool = state.dishes.filter((d) => d.available);
  if (pool.length === 0) return state;
  const picks = [...pool].sort(() => rand() - 0.5).slice(0, 1 + Math.floor(rand() * Math.min(3, pool.length)));
  const n = state.orders.filter((o) => o.source === "sample").length + 1;
  const order: PreviewOrder = {
    id: newId("sample"),
    reference: `SAMPLE-${n}${Math.floor(rand() * 90 + 10)}`,
    source: "sample",
    customer: `Sample Customer ${String.fromCharCode(65 + (n % 26))}`,
    contact: "Sample contact",
    preference: (["dine-in", "stop-by", "undecided"] as const)[Math.floor(rand() * 3)],
    note: "",
    lines: picks.map((d) => ({ itemId: d.id, name: d.name, quantity: 1 + Math.floor(rand() * 3), price: d.price })),
    status: "new",
    createdAt: now,
    history: [{ status: "new", at: now }],
  };
  return { ...state, orders: [order, ...state.orders] };
}

/** What the public Menu may read: no images (kept in the browser), no internal flags. */
export function menuFeed(state: PreviewState) {
  return state.dishes.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    price: d.price,
    available: d.available,
    group: d.group,
  }));
}

export const PREFERENCE_LABEL = { "dine-in": "Dine in", "stop-by": "Stop by", undecided: "Not decided" } as const;
