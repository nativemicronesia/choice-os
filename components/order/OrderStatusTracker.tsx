"use client";

import { useEffect, useState } from "react";
import { refreshTrackedOrder } from "@/lib/actions/private-orders";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus, OrderWithItems } from "@/lib/types/database";

const STEPS: OrderStatus[] = ["pending", "cooking", "ready", "completed"];
const VALID_STATUSES: OrderStatus[] = [...STEPS, "cancelled"];
const STEP_LABELS: Record<OrderStatus, string> = {
  pending: "Received",
  cooking: "Cooking",
  ready: "Ready for pickup",
  completed: "Picked up",
  cancelled: "Cancelled",
};

export function OrderStatusTracker({
  initialOrder,
  realtimeTopic,
}: {
  initialOrder: OrderWithItems;
  realtimeTopic: string;
}) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await refreshTrackedOrder(initialOrder.id);
        if (active && next) {
          setOrder((prev) => ({ ...prev, status: next.status, updated_at: next.updated_at }));
        }
      } catch {
        // Keep the last known status while the customer is offline.
      }
    };
    const supabase = process.env.NEXT_PUBLIC_CHOICE_DATA_MODE === "fixtures" ? null : createClient();
    const channel = supabase
      ?.channel(realtimeTopic, { config: { private: true } })
      .on("broadcast", { event: "choice_order_status" }, ({ payload }) => {
        const next = payload as { status?: OrderStatus; updated_at?: string };
        if (!next.status || !VALID_STATUSES.includes(next.status) || !next.updated_at) return;
        setOrder((prev) => ({ ...prev, status: next.status!, updated_at: next.updated_at! }));
      })
      .subscribe();
    // Keep tracking resilient if a mobile connection drops its WebSocket.
    const interval = window.setInterval(
      refresh,
      process.env.NEXT_PUBLIC_CHOICE_DATA_MODE === "fixtures" ? 2_000 : 30_000,
    );
    return () => {
      active = false;
      window.clearInterval(interval);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [initialOrder.id, realtimeTopic]);

  const isCancelled = order.status === "cancelled";
  const currentIndex = isCancelled ? -1 : STEPS.indexOf(order.status);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Order for</p>
          <p className="text-xl font-semibold">{order.customer_name}</p>
        </div>
        <span aria-live="polite" aria-atomic="true"><StatusBadge status={order.status} /></span>
      </div>

      {isCancelled ? (
        <p role="status" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          This pickup order was cancelled. Contact Choice if you have questions.
        </p>
      ) : null}
      <ol className="mt-6 flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                index <= currentIndex ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500",
              )}
            >
              {index + 1}
            </span>
            <span className={cn("text-sm", index <= currentIndex ? "text-neutral-900" : "text-neutral-400")}>
              {STEP_LABELS[step]}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-neutral-200 pt-4">
        <h2 className="text-sm font-medium text-neutral-500">Items</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {order.order_items.map((item) => (
            <li key={item.id} className="text-sm">
              <span className="font-medium">
                {item.quantity}× {item.item_name}
              </span>
              {item.special_instructions && (
                <span className="block text-neutral-500">{item.special_instructions}</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
