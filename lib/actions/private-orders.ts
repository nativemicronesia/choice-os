"use server";

import { requireOwnerSession } from "@/lib/auth/require";
import {
  getOwnerActiveOrders,
  getOwnerDailySpecials,
  getOwnerKitchenTopic,
  getOwnerMenuItems,
  getOwnerOrderWithItems,
  getOwnerTodaysOrders,
  getTrackedOrderStatus,
} from "@/lib/supabase/private-orders";
import { chuukTodayRangeUtc } from "@/lib/time/chuukToday";

export async function refreshTrackedOrder(id: string) {
  return getTrackedOrderStatus(id);
}

export async function getOwnerMenu() {
  await requireOwnerSession();
  return getOwnerMenuItems();
}

export async function getOwnerSpecials() {
  await requireOwnerSession();
  return getOwnerDailySpecials();
}

export async function getOwnerDayOrders() {
  await requireOwnerSession();
  const { startUtc, endUtc } = chuukTodayRangeUtc();
  return getOwnerTodaysOrders(startUtc.toISOString(), endUtc.toISOString());
}

export async function getOwnerActiveTickets() {
  await requireOwnerSession();
  return getOwnerActiveOrders();
}

export async function getOwnerKitchenRealtimeTopic() {
  await requireOwnerSession();
  return getOwnerKitchenTopic();
}

export async function getOwnerTicket(id: string) {
  await requireOwnerSession();
  return getOwnerOrderWithItems(id);
}
