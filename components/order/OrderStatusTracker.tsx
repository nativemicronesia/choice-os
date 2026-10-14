"use client";

import { useEffect, useState } from "react";
import { Check, Circle, Clock3 } from "lucide-react";
import { refreshTrackedOrder } from "@/lib/actions/private-orders";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus, OrderWithItems } from "@/lib/types/database";

const STEPS: OrderStatus[] = ["pending", "cooking", "ready", "completed"];
const VALID_STATUSES: OrderStatus[] = [...STEPS, "cancelled"];
const STEP_LABELS: Record<OrderStatus, string> = {
  pending: "Received",
  cooking: "Preparing",
  ready: "Ready for pickup",
  completed: "Picked up",
  cancelled: "Cancelled",
};

function formatPickupTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Pacific/Chuuk",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

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
  const placedAt = formatPickupTime(order.created_at);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <section aria-labelledby="order-progress-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">Pickup for</p>
            <p className="mt-0.5 text-xl font-semibold text-ink-900">{order.customer_name}</p>
            <p className="mt-2 text-sm text-ink-500">Order #{order.id.slice(0, 8).toUpperCase()} <span className="px-1.5 text-sand-300">·</span> {placedAt}</p>
          </div>
          <span aria-live="polite" aria-atomic="true"><StatusBadge status={order.status} /></span>
        </div>

        <h2 id="order-progress-title" tabIndex={-1} className="mt-8 font-display text-xl font-semibold text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ocean-700">Kitchen progress</h2>
        {isCancelled ? (
          <p role="status" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            This pickup order was cancelled and will not be prepared. Return to the menu to start a new order.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-1">
            {STEPS.map((step, index) => {
              const complete = index < currentIndex;
              const current = index === currentIndex;
              return (
                <li
                  key={step}
                  aria-current={current ? "step" : undefined}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 ${current ? "border-ocean-800 bg-ocean-50" : complete ? "border-palm-100 bg-palm-50" : "border-sand-200 bg-sand-50"}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${current ? "bg-ocean-900 text-white" : complete ? "bg-palm-600 text-white" : "bg-sand-200 text-ink-500"}`}>
                    {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : current ? <Clock3 className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                  </span>
                  <span className={`text-sm ${current ? "font-semibold text-ocean-900" : complete ? "font-medium text-palm-700" : "text-ink-500"}`}>{STEP_LABELS[step]}</span>
                  {current && <span className="ml-auto text-xs font-semibold text-ocean-700">Current</span>}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="order-items-title" className="border-t border-sand-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h2 id="order-items-title" className="font-display text-xl font-semibold text-ink-900">In this order</h2>
        <ul className="mt-4 divide-y divide-sand-200">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{item.quantity}<span className="px-1 text-ink-300">×</span>{item.item_name}</p>
                {item.special_instructions && <p className="mt-1 break-words text-ink-500">Note: {item.special_instructions}</p>}
              </div>
              <span className="shrink-0 font-medium tabular-nums text-ink-700">${(item.price_at_time * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-sand-200 pt-4 font-semibold text-ink-900">
          <span>Total</span>
          <span className="tabular-nums">${order.total.toFixed(2)}</span>
        </div>
        <p className="mt-4 rounded-xl bg-sand-100 px-4 py-3 text-sm leading-6 text-ink-700">Please show your order number when you collect and pay at the counter.</p>
      </section>
    </div>
  );
}
