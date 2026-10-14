"use client";

import { useEffect, useMemo, useState } from "react";
import { getOwnerDayOrders, getOwnerKitchenRealtimeTopic } from "@/lib/actions/private-orders";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types/database";

export function AnalyticsCard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await getOwnerDayOrders();
        if (active) setOrders(next);
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

  const { revenueToday, completedToday, activeTickets, orderCount } = useMemo(() => {
    let revenue = 0;
    let completed = 0;
    let active = 0;
    for (const order of orders) {
      if (order.status === "completed") {
        revenue += Number(order.total);
        completed += 1;
      } else if (order.status === "pending" || order.status === "cooking" || order.status === "ready") {
        active += 1;
      }
    }
    return { revenueToday: revenue, completedToday: completed, activeTickets: active, orderCount: orders.length };
  }, [orders]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{orderCount}</p>
        <p className="text-xs text-neutral-500">Orders today</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">${revenueToday.toFixed(2)}</p>
        <p className="text-xs text-neutral-500">Revenue today</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{completedToday}</p>
        <p className="text-xs text-neutral-500">Orders completed</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-2xl font-bold">{activeTickets}</p>
        <p className="text-xs text-neutral-500">Active tickets</p>
      </div>
    </div>
  );
}
