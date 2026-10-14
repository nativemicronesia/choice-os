"use client";

import { useEffect, useMemo, useState } from "react";
import { getOwnerDayOrders } from "@/lib/actions/private-orders";
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
    const interval = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const { revenueToday, completedToday, activeTickets } = useMemo(() => {
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
    return { revenueToday: revenue, completedToday: completed, activeTickets: active };
  }, [orders]);

  return (
    <div className="grid grid-cols-3 gap-3">
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
