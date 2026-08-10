export type OrderStatus = "pending" | "cooking" | "ready" | "completed";

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
};

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
