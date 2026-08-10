import { createClient } from "@/lib/supabase/client";
import { chuukTodayRangeUtc } from "@/lib/time/chuukToday";
import type { DailySpecial, MenuItem, Order, OrderItem, OrderWithItems } from "@/lib/types/database";

// PostgREST's JSON encoding for `numeric`/`decimal` columns isn't worth
// trusting blindly across client versions — coerce once here so every
// consumer can do plain arithmetic on price/total fields.
function toMenuItem(row: MenuItem): MenuItem {
  return { ...row, price: Number(row.price) };
}
function toDailySpecial(row: DailySpecial): DailySpecial {
  return { ...row, price: Number(row.price) };
}
function toOrder(row: Order): Order {
  return { ...row, total: Number(row.total) };
}
function toOrderItem(row: OrderItem): OrderItem {
  return { ...row, price_at_time: Number(row.price_at_time) };
}
function toOrderWithItems(row: OrderWithItems): OrderWithItems {
  return { ...toOrder(row), order_items: row.order_items.map(toOrderItem) };
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await createClient()
    .from("menu_items")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as MenuItem[]).map(toMenuItem);
}

/** Dishes Turay marked available for today's online board. */
export async function getTodaysMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await createClient()
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as MenuItem[]).map(toMenuItem);
}

export async function getActiveDailySpecials(): Promise<DailySpecial[]> {
  const { data, error } = await createClient()
    .from("daily_specials")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DailySpecial[]).map(toDailySpecial);
}

export async function getAllDailySpecials(): Promise<DailySpecial[]> {
  const { data, error } = await createClient()
    .from("daily_specials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DailySpecial[]).map(toDailySpecial);
}

export async function getOrderWithItems(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await createClient()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw error;
  }
  return toOrderWithItems(data as OrderWithItems);
}

export async function getActiveOrdersWithItems(): Promise<OrderWithItems[]> {
  const { data, error } = await createClient()
    .from("orders")
    .select("*, order_items(*)")
    .in("status", ["pending", "cooking", "ready"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as OrderWithItems[]).map(toOrderWithItems);
}

export async function getTodaysOrders(): Promise<Order[]> {
  const { startUtc, endUtc } = chuukTodayRangeUtc();
  const { data, error } = await createClient()
    .from("orders")
    .select("id,status,total,created_at,updated_at,customer_name")
    .gte("created_at", startUtc.toISOString())
    .lt("created_at", endUtc.toISOString());
  if (error) throw error;
  return ((data ?? []) as Order[]).map(toOrder);
}
