import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fixtureMenu,
  fixtureOwnerActiveOrders,
  fixtureOwnerCashCollected,
  fixtureOwnerOrder,
  fixtureOwnerOrders,
  fixtureSpecials,
  fixtureTrackedOrder,
  fixtureTrackedOrderStatus,
  isChoiceFixtureMode,
} from "@/lib/dev/choice-fixtures";
import type { CashCollection, Order, OrderItem, OrderWithItems } from "@/lib/types/database";

const TRACKING_COOKIE = "choice_order_access";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type TrackedOrder = { order: OrderWithItems; realtimeTopic: string };

function orderFromRow(row: OrderWithItems): OrderWithItems {
  return {
    ...row,
    total: Number(row.total),
    order_items: row.order_items.map((item) => ({
      ...item,
      price_at_time: Number(item.price_at_time),
    })),
  };
}

export async function getTrackedOrder(id: string): Promise<TrackedOrder | null> {
  if (!UUID.test(id)) return null;
  const token = (await cookies()).get(TRACKING_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;

  if (isChoiceFixtureMode()) {
    const order = fixtureTrackedOrder(id, token);
    return order ? { order, realtimeTopic: "" } : null;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("tracking_token_hash", tokenHash)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const { tracking_token_hash: trackingTokenHash, ...row } = data as OrderWithItems & {
    tracking_token_hash: string;
  };
  return {
    order: orderFromRow(row),
    realtimeTopic: `choice-order:${trackingTokenHash}`,
  };
}

export async function getTrackedOrderStatus(id: string): Promise<Pick<Order, "status" | "updated_at"> | null> {
  if (!UUID.test(id)) return null;
  const token = (await cookies()).get(TRACKING_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  if (isChoiceFixtureMode()) return fixtureTrackedOrderStatus(id, token);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("status,updated_at")
    .eq("id", id)
    .eq("tracking_token_hash", tokenHash)
    .maybeSingle();
  if (error) throw error;
  return data as Pick<Order, "status" | "updated_at"> | null;
}

export async function getOwnerOrderWithItems(id: string): Promise<OrderWithItems | null> {
  if (!UUID.test(id)) return null;
  if (isChoiceFixtureMode()) return fixtureOwnerOrder(id);
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? orderFromRow(data as OrderWithItems) : null;
}

export async function getOwnerActiveOrders(): Promise<OrderWithItems[]> {
  if (isChoiceFixtureMode()) return fixtureOwnerActiveOrders();
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*, order_items(*)")
    .in("status", ["pending", "cooking", "ready"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as OrderWithItems[]).map(orderFromRow);
}

export async function getOwnerTodaysOrders(start: string, end: string): Promise<OrderWithItems[]> {
  if (isChoiceFixtureMode()) return fixtureOwnerOrders(start, end);
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*, order_items(*)")
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as OrderWithItems[]).map(orderFromRow);
}

export async function getOwnerCashCollected(start: string, end: string): Promise<CashCollection[]> {
  if (isChoiceFixtureMode()) return fixtureOwnerCashCollected(start, end);
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("id,total,cash_collected_at")
    .eq("status", "completed")
    .gte("cash_collected_at", start)
    .lt("cash_collected_at", end)
    .order("cash_collected_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CashCollection[]).map((row) => ({ ...row, total: Number(row.total) }));
}

export async function getOwnerMenuItems() {
  if (isChoiceFixtureMode()) return fixtureMenu(false);
  const { data, error } = await createAdminClient()
    .from("menu_items")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as import("@/lib/types/database").MenuItem[]).map((row) => ({
    ...row,
    price: Number(row.price),
  }));
}

export async function getOwnerDailySpecials() {
  if (isChoiceFixtureMode()) return fixtureSpecials(false);
  const { data, error } = await createAdminClient()
    .from("daily_specials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as import("@/lib/types/database").DailySpecial[]).map((row) => ({
    ...row,
    price: Number(row.price),
  }));
}

export async function getOwnerKitchenTopic(): Promise<string> {
  if (isChoiceFixtureMode()) return "";
  const { data, error } = await createAdminClient()
    .from("order_realtime_settings")
    .select("topic_token")
    .eq("name", "kds")
    .single();
  if (error) throw error;
  return `choice-kds:${data.topic_token}`;
}

export type OwnerOrderSnapshot = { orders: Order[]; active: OrderWithItems[] };
export type OrderItemSnapshot = OrderItem;
