// Choice OS preview data model. Everything here is demonstration data kept in
// the browser (see store.ts). Nothing is a confirmed Choice menu, price or policy.

export type MenuGroup = "todays" | "featured";
export type Tone = "ember" | "char" | "cream" | "leaf";

export type Dish = {
  id: string;
  name: string;
  description: string;
  /** USD, or null while Turay has not set a price. */
  price: number | null;
  available: boolean;
  group: MenuGroup;
  tone: Tone;
  /** Compressed data URL for a replacement photo; null shows the placeholder. */
  image: string | null;
  /** True for seeded sample dishes; false once Turay creates or rewrites one. */
  demo: boolean;
};

export const ORDER_STATUSES = ["new", "accepted", "preparing", "ready", "completed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLine = {
  itemId: string;
  name: string;
  quantity: number;
  /** Price snapshot when the order arrived; null when the dish had no price. */
  price: number | null;
};

export type PickupPreference = "dine-in" | "stop-by" | "undecided";

export type PreviewOrder = {
  id: string;
  /** Short reference shown to Turay, e.g. DEMO-AB12. */
  reference: string;
  source: "storefront" | "sample";
  customer: string;
  contact: string;
  preference: PickupPreference;
  note: string;
  lines: OrderLine[];
  status: OrderStatus;
  createdAt: string;
  /** When each status was reached; used for the timeline. */
  history: { status: OrderStatus; at: string }[];
};

export type PreviewState = {
  v: 1;
  dishes: Dish[];
  orders: PreviewOrder[];
  /** Storefront references already imported, so refreshes never duplicate. */
  seenRefs: string[];
  lastStorefrontSync: string | null;
};

/** Shape of records exposed by the storefront's lib/storefront/demo-orders.ts. */
export type StorefrontRecord = {
  reference: string;
  name: string;
  contact: string;
  location: PickupPreference;
  note: string;
  lines: { itemId: string; quantity: number }[];
  submittedAt: string;
};
