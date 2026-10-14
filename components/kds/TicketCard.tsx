"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { nextStatus } from "@/lib/orders/transitions";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";

const ADVANCE_LABELS: Record<OrderStatus, string> = {
  pending: "Start Cooking",
  cooking: "Mark Ready",
  ready: "Complete",
  completed: "",
};

function useElapsedSeconds(createdAt: string): number {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TicketCard({
  order,
  items,
  isUpdating,
  onAdvance,
}: {
  order: Order;
  items: OrderItem[];
  isUpdating: boolean;
  onAdvance: (next: OrderStatus) => void;
}) {
  const elapsed = useElapsedSeconds(order.created_at);
  const next = nextStatus(order.status);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{order.customer_name}</h3>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">{formatElapsed(elapsed)} elapsed</p>
      <p className="mt-1 text-xs font-medium text-neutral-500">Cash pickup · ${order.total.toFixed(2)}</p>

      <ul className="mt-3 flex flex-col gap-1">
        {items.map((item) => (
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

      {next && (
        <button
          type="button"
          onClick={() => onAdvance(next)}
          disabled={isUpdating}
          className="mt-4 min-h-12 w-full rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isUpdating ? "Updating…" : ADVANCE_LABELS[order.status]}
        </button>
      )}
    </div>
  );
}
