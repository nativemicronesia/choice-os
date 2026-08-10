"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { chuukTodayRangeUtc } from "@/lib/time/chuukToday";
import type { Order } from "@/lib/types/database";

export function AnalyticsCard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const { startUtc, endUtc } = chuukTodayRangeUtc();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-analytics-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const created = payload.new as Order;
          const createdAt = new Date(created.created_at);
          if (createdAt >= startUtc && createdAt < endUtc) {
            setOrders((prev) => [...prev, { ...created, total: Number(created.total) }]);
          }
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((order) =>
              order.id === updated.id ? { ...order, status: updated.status, total: Number(updated.total) } : order,
            ),
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
