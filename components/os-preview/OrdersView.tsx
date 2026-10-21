"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { STATUS_LABEL } from "@/lib/preview-os/logic";
import { actions, usePreviewState } from "@/lib/preview-os/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/preview-os/types";
import { OrderCard } from "./OrderCard";
import { PageHeader, Skeleton, btn } from "./ui";
import { useNow } from "./useNow";

type Filter = "active" | OrderStatus | "all";

export function OrdersView() {
  const state = usePreviewState();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("active");
  if (!state) return <Skeleton />;

  const count = (s: OrderStatus) => state.orders.filter((o) => o.status === s).length;
  const active = state.orders.filter((o) => o.status !== "completed").length;
  const tabs: { id: Filter; label: string; n: number }[] = [
    { id: "active", label: "Active", n: active },
    ...ORDER_STATUSES.map((s) => ({ id: s, label: STATUS_LABEL[s], n: count(s) })),
    { id: "all", label: "All", n: state.orders.length },
  ];
  const shown = state.orders
    .filter((o) => (filter === "all" ? true : filter === "active" ? o.status !== "completed" : o.status === filter))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Order requests from the storefront preview. Statuses are provisional until you confirm them."
        action={
          <button type="button" className={btn.secondary} onClick={actions.addSampleOrder}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add sample order
          </button>
        }
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Filter orders">
        <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                filter === t.id ? "border-ink-900 bg-ink-900 text-white" : "border-sand-300 bg-white text-ink-700 hover:bg-sand-100",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", filter === t.id ? "bg-white/20" : "bg-sand-100 text-ink-500")}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-12 text-center">
          <p className="font-bold text-ink-900">No orders here</p>
          <p className="mt-1 text-sm text-ink-500">Requests from the storefront preview appear here on their own. You can also add a sample order to try the flow.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} now={now} />
          ))}
        </div>
      )}
    </>
  );
}
