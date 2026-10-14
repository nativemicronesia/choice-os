"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { nextStatus } from "@/lib/orders/transitions";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";

const ADVANCE_LABELS: Record<OrderStatus, string> = {
  pending: "Start Preparing",
  cooking: "Mark Ready for Pickup",
  ready: "Mark Picked Up",
  completed: "",
  cancelled: "",
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

const chuukClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "Pacific/Pohnpei",
  hour: "numeric",
  minute: "2-digit",
});

export function TicketCard({
  order,
  items,
  isUpdating,
  onAdvance,
  onCancel,
}: {
  order: Order;
  items: OrderItem[];
  isUpdating: boolean;
  onAdvance: (next: OrderStatus) => void;
  onCancel: () => void;
}) {
  const elapsed = useElapsedSeconds(order.created_at);
  const next = nextStatus(order.status);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-900">{order.customer_name}</h3>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Ticket {order.id.slice(0, 8).toUpperCase()}</p>
      <div className="mt-1 flex items-center justify-between gap-2 text-sm text-neutral-600">
        <p>{formatElapsed(elapsed)} elapsed</p>
        <time dateTime={order.created_at}>Received {chuukClock.format(new Date(order.created_at))}</time>
      </div>
      <p className="mt-1 text-sm font-semibold text-neutral-700">Cash pickup · ${order.total.toFixed(2)}</p>

      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg bg-sand-50 p-2 text-base">
            <span className="font-semibold text-ink-900">
              {item.quantity}× {item.item_name}
            </span>
            {item.special_instructions && (
              <span className="mt-1 block rounded-md border-l-4 border-sunset-500 bg-sunset-50 px-2 py-1 text-sm font-medium text-ink-800">
                Note: {item.special_instructions}
              </span>
            )}
          </li>
        ))}
      </ul>

      {next && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAdvance(next)}
            disabled={isUpdating}
            className="min-h-12 w-full rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {isUpdating ? "Updating…" : order.status === "ready" ? "Mark Picked Up · Cash Received" : ADVANCE_LABELS[order.status]}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Cancel ticket for ${order.customer_name}?`)) onCancel();
            }}
            disabled={isUpdating}
            className="min-h-11 w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}
