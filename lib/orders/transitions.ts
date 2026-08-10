import type { OrderStatus } from "@/lib/types/database";

// Shared between the server action (lib/actions/orders.ts) and client UI
// (KDS ticket cards) — kept out of lib/actions/orders.ts because a "use
// server" file may only export async functions.
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus | null> = {
  pending: "cooking",
  cooking: "ready",
  ready: "completed",
  completed: null,
};

export function nextStatus(current: OrderStatus): OrderStatus | null {
  return ALLOWED_TRANSITIONS[current];
}
