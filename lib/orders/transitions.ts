import type { OrderStatus } from "@/lib/types/database";

// Shared between the server action (lib/actions/orders.ts) and client UI
// (KDS ticket cards) — kept out of lib/actions/orders.ts because a "use
// server" file may only export async functions.
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus | null> = {
  pending: "cooking",
  cooking: "ready",
  ready: "completed",
  completed: null,
  cancelled: null,
};

export const CANCELLABLE_STATUSES: readonly OrderStatus[] = ["pending", "cooking", "ready"];

export function isAllowedOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[current] === next || (next === "cancelled" && CANCELLABLE_STATUSES.includes(current));
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
  return ALLOWED_TRANSITIONS[current];
}
