"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { isAllowedOrderTransition } from "@/lib/orders/transitions";
import type { OrderStatus } from "@/lib/types/database";
import { fixtureAdvanceOrder, isChoiceFixtureMode } from "@/lib/dev/choice-fixtures";

export async function updateOrderStatus(
  orderId: string,
  expectedCurrentStatus: OrderStatus,
  nextStatus: OrderStatus,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireOwnerSession();
  if (!isAllowedOrderTransition(expectedCurrentStatus, nextStatus)) {
    return { success: false, error: `Illegal transition ${expectedCurrentStatus} -> ${nextStatus}` };
  }

  if (isChoiceFixtureMode()) {
    return fixtureAdvanceOrder(orderId, expectedCurrentStatus, nextStatus)
      ? { success: true }
      : { success: false, error: "Ticket already updated elsewhere" };
  }

  const update = nextStatus === "completed"
    ? { status: nextStatus, cash_collected_at: new Date().toISOString() }
    : { status: nextStatus };
  let query = createAdminClient()
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .eq("status", expectedCurrentStatus);
  if (nextStatus === "completed") query = query.is("cash_collected_at", null);
  const { data, error } = await query.select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Ticket already changed, picked up, or cash was already recorded" };
  }
  return { success: true };
}
