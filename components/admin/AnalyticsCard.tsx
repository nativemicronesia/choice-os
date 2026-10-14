"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOwnerActiveTickets,
  getOwnerCashCollectedToday,
  getOwnerDayOrders,
  getOwnerKitchenRealtimeTopic,
} from "@/lib/actions/private-orders";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CashCollection, OrderWithItems } from "@/lib/types/database";

const chuukTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "Pacific/Pohnpei",
  dateStyle: "medium",
  timeStyle: "short",
});

export function AnalyticsCard({ initialOrders, initialCashCollections, initialActiveOrders }: {
  initialOrders: OrderWithItems[];
  initialCashCollections: CashCollection[];
  initialActiveOrders: OrderWithItems[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [cashCollections, setCashCollections] = useState(initialCashCollections);
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [nextOrders, nextCashCollections, nextActiveOrders] = await Promise.all([
          getOwnerDayOrders(),
          getOwnerCashCollectedToday(),
          getOwnerActiveTickets(),
        ]);
        if (active) {
          setOrders(nextOrders);
          setCashCollections(nextCashCollections);
          setActiveOrders(nextActiveOrders);
        }
      } catch {
        // Keep the last known totals when temporarily offline.
      }
    };
    const supabase = process.env.NEXT_PUBLIC_CHOICE_DATA_MODE === "fixtures" ? null : createClient();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    if (supabase) {
      void getOwnerKitchenRealtimeTopic().then((topic) => {
        if (!active) return;
        channel = supabase
          .channel(topic, { config: { private: true } })
          .on("broadcast", { event: "choice_order_changed" }, () => void refresh())
          .subscribe((status) => {
            if (status === "SUBSCRIBED") void refresh();
          });
      }).catch(() => {
        // Keep the periodic owner-checked refresh as a fallback.
      });
    }
    const interval = window.setInterval(
      refresh,
      process.env.NEXT_PUBLIC_CHOICE_DATA_MODE === "fixtures" ? 2_000 : 30_000,
    );
    return () => {
      active = false;
      window.clearInterval(interval);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  const { cashCollected, completedToday, cancelledToday, orderCount } = useMemo(() => {
    let cancelled = 0;
    for (const order of orders) {
      if (order.status === "cancelled") {
        cancelled += 1;
      }
    }
    return {
      cashCollected: cashCollections.reduce((sum, collection) => sum + Number(collection.total), 0),
      completedToday: cashCollections.length,
      cancelledToday: cancelled,
      orderCount: orders.length,
    };
  }, [orders, cashCollections]);
  const activeTickets = activeOrders.length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{orderCount}</p>
        <p className="text-xs text-neutral-500">Orders today</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">${cashCollected.toFixed(2)}</p>
        <p className="text-xs text-neutral-500">Cash collected</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{completedToday}</p>
        <p className="text-xs text-neutral-500">Pickups completed</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{activeTickets}</p>
        <p className="text-xs text-neutral-500">Active tickets</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{cancelledToday}</p>
        <p className="text-xs text-neutral-500">Canceled orders</p>
      </div>
      <p className="col-span-2 -mt-1 text-center text-xs text-neutral-500 md:col-span-3 lg:col-span-5">
        Cash collected includes completed pickups with a recorded collection time.
      </p>
      <section aria-labelledby="today-orders-title" className="col-span-2 mt-2 md:col-span-3 lg:col-span-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="today-orders-title" className="text-lg font-semibold text-ink-900">Today&apos;s orders</h2>
          <span className="text-sm text-ink-500">{orders.length}</span>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sand-300 p-5 text-center text-sm text-ink-500">
            No pickup orders yet today.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <details className="rounded-xl border border-sand-200 bg-white shadow-sm">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink-900">{order.customer_name}</span>
                      <span className="block text-xs text-ink-500">
                        <time dateTime={order.created_at}>{chuukTime.format(new Date(order.created_at))}</time>
                        {" · "}Ticket {order.id.slice(0, 8).toUpperCase()}
                        {" · "}{order.order_items.length} line{order.order_items.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-ink-900">${Number(order.total).toFixed(2)}</span>
                      <StatusBadge status={order.status} />
                    </span>
                  </summary>
                  <div className="border-t border-sand-100 px-4 py-3">
                    <ul className="flex flex-col gap-2">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-sm text-ink-800">
                          <span className="font-medium">{item.quantity}× {item.item_name}</span>
                          <span className="ml-2 text-ink-500">${(Number(item.price_at_time) * item.quantity).toFixed(2)}</span>
                          {item.special_instructions ? (
                            <span className="mt-1 block rounded-md bg-sand-100 px-2 py-1 text-ink-700">
                              Note: {item.special_instructions}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 border-t border-sand-100 pt-2 text-right text-sm font-semibold text-ink-900">
                      Order total · ${Number(order.total).toFixed(2)}
                    </p>
                    {order.cash_collected_at ? (
                      <p className="mt-1 text-right text-xs font-medium text-green-800">
                        Cash collected {chuukTime.format(new Date(order.cash_collected_at))}
                      </p>
                    ) : null}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
