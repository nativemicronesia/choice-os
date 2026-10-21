"use client";

import { Check, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NEXT_ACTION, PREFERENCE_LABEL, STATUS_LABEL, formatPrice, itemCount, nextStatus, orderTotal, prevStatus } from "@/lib/preview-os/logic";
import { actions } from "@/lib/preview-os/store";
import { ORDER_STATUSES, type PreviewOrder } from "@/lib/preview-os/types";
import { DemoTag, StatusPill, btn, card } from "./ui";

export function timeAgo(iso: string, now: number): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs} hr ago` : `${Math.floor(hrs / 24)} d ago`;
}

function Stepper({ status }: { status: PreviewOrder["status"] }) {
  const at = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="flex gap-1" aria-label={`Progress: ${STATUS_LABEL[status]}`}>
      {ORDER_STATUSES.map((s, i) => (
        <li key={s} className="min-w-0 flex-1" aria-current={i === at ? "step" : undefined}>
          <div className={cn("h-1.5 rounded-full", i <= at ? (status === "completed" ? "bg-palm-500" : "bg-sunset-500") : "bg-sand-200")} />
          <span className={cn("mt-1 block truncate text-[10px] font-semibold", i === at ? "text-ink-900" : "text-ink-300")}>{STATUS_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderCard({ order, now, compact = false }: { order: PreviewOrder; now: number; compact?: boolean }) {
  const next = nextStatus(order.status);
  const prev = prevStatus(order.status);
  const total = orderTotal(order);

  return (
    <article className={cn(card, "flex flex-col gap-3 p-4", order.status === "new" && "border-sunset-300 ring-1 ring-sunset-300/60")} aria-label={`Order ${order.reference} from ${order.customer}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink-900">{order.customer}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            <span className="font-semibold">{order.reference}</span>
            <span aria-hidden="true">·</span>
            <span>{timeAgo(order.createdAt, now)}</span>
            <DemoTag>{order.source === "storefront" ? "Demo · from storefront" : "Demo · sample"}</DemoTag>
          </p>
        </div>
        <StatusPill status={order.status} />
      </header>

      <ul className="divide-y divide-sand-100 rounded-xl bg-sand-50 px-3">
        {order.lines.map((l) => (
          <li key={l.itemId} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0 truncate text-ink-900">{l.name}</span>
            <span className="shrink-0 font-bold tabular-nums text-ink-900">× {l.quantity}</span>
          </li>
        ))}
      </ul>

      {!compact ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-ink-500">Contact</dt>
          <dd className="min-w-0 break-words text-ink-900">{order.contact || "Not given"}</dd>
          <dt className="text-ink-500">Preference</dt>
          <dd className="text-ink-900">{PREFERENCE_LABEL[order.preference]} <span className="text-ink-500">(customer&rsquo;s wish, not confirmed)</span></dd>
          {order.note ? (
            <>
              <dt className="text-ink-500">Note</dt>
              <dd className="min-w-0 break-words text-ink-900">{order.note}</dd>
            </>
          ) : null}
          <dt className="text-ink-500">Items</dt>
          <dd className="text-ink-900">
            {itemCount(order)} · {total == null ? <span className="text-ink-500">Total to be confirmed</span> : formatPrice(total)}
          </dd>
        </dl>
      ) : null}

      <Stepper status={order.status} />

      <div className="flex items-center gap-2">
        {next ? (
          <button type="button" className={cn(btn.primary, "flex-1")} onClick={() => actions.setStatus(order.id, next)}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {NEXT_ACTION[order.status]}
          </button>
        ) : (
          <p className="flex-1 text-sm font-semibold text-palm-700">Completed (demo)</p>
        )}
        {prev ? (
          <button type="button" className={btn.ghost} onClick={() => actions.setStatus(order.id, prev)} aria-label={`Move back to ${STATUS_LABEL[prev]}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </button>
        ) : null}
      </div>
      {order.status === "new" ? (
        <p className="-mt-1 text-xs text-ink-500">A request from a customer. It isn&rsquo;t confirmed until you accept it.</p>
      ) : null}
    </article>
  );
}
