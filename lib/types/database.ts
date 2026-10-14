export type OrderStatus = "pending" | "cooking" | "ready" | "completed" | "cancelled";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
};

export type DailySpecial = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  active: boolean;
  frequency: "daily" | "weekly";
  weekdays: number[];
  image_url: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  cash_collected_at: string | null;
};

export type CashCollection = Pick<Order, "id" | "total" | "cash_collected_at">;

export type OrderItem = {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  price_at_time: number;
  special_instructions: string | null;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export const CATEGORIES = [
  "Local Specials",
  "Burgers & Sandwiches",
  "Sides",
  "Cold Drinks",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const WEEKDAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;
