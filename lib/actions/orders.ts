"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { ALLOWED_TRANSITIONS } from "@/lib/orders/transitions";
import type { OrderStatus } from "@/lib/types/database";
import { fixtureAdvanceOrder, isChoiceFixtureMode } from "@/lib/dev/choice-fixtures";

export async function updateOrderStatus(
  orderId: string,
  expectedCurrentStatus: OrderStatus,
  nextStatus: OrderStatus,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireOwnerSession();
  if (ALLOWED_TRANSITIONS[expectedCurrentStatus] !== nextStatus) {
    return { success: false, error: `Illegal transition ${expectedCurrentStatus} -> ${nextStatus}` };
  }

  if (isChoiceFixtureMode()) {
    return fixtureAdvanceOrder(orderId, expectedCurrentStatus, nextStatus)
      ? { success: true }
      : { success: false, error: "Ticket already updated elsewhere" };
  }

  const { data, error } = await createAdminClient()
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("status", expectedCurrentStatus)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Ticket already updated elsewhere" };
  }
  return { success: true };
}
