"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Plus, UtensilsCrossed } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ORDER_STATUSES } from "@/lib/preview-os/types";
import { actions, usePreviewState } from "@/lib/preview-os/store";
import { OrderCard } from "./OrderCard";
import { DemoTag, PageHeader, SectionTitle, Skeleton, btn, card } from "./ui";
import { useNow } from "./useNow";

export function HomeView() {
  const state = usePreviewState();
  const now = useNow();
  if (!state) return <Skeleton />;

  const rank = (s: string) => ORDER_STATUSES.indexOf(s as (typeof ORDER_STATUSES)[number]);
  const active = state.orders
    .filter((o) => o.status !== "completed")
    .sort((a, b) => (a.status === "new" ? 0 : 1) - (b.status === "new" ? 0 : 1) || rank(a.status) - rank(b.status) || a.createdAt.localeCompare(b.createdAt));
  const newCount = active.filter((o) => o.status === "new").length;
  const todays = state.dishes.filter((d) => d.group === "todays");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome, Turay"
        subtitle={
          newCount > 0
            ? `${newCount} new order ${newCount === 1 ? "request is" : "requests are"} waiting for you.`
            : active.length > 0
              ? "No new requests. Orders in progress are below."
              : "No orders right now."
        }
      />

      <section aria-labelledby="home-orders">
        <SectionTitle
          aside={
            <Link href="/os/orders" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-sunset-700 hover:underline">
              All orders <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <span id="home-orders">Orders to work on</span>
        </SectionTitle>
        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-10 text-center">
            <p className="font-bold text-ink-900">Nothing waiting</p>
            <p className="mt-1 text-sm text-ink-500">New requests from the storefront preview show up here.</p>
            <button type="button" className={`${btn.secondary} mt-4`} onClick={actions.addSampleOrder}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add a sample order
            </button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {active.slice(0, 4).map((o) => (
              <OrderCard key={o.id} order={o} now={now} compact />
            ))}
          </div>
        )}
        {active.length > 4 ? (
          <Link href="/os/orders" className={`${btn.secondary} mt-4 w-full`}>
            See {active.length - 4} more in Orders
          </Link>
        ) : null}
      </section>

      <section aria-labelledby="home-actions">
        <SectionTitle><span id="home-actions">Quick actions</span></SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/os/orders" className={`${card} flex min-h-16 items-center gap-3 p-4 transition hover:bg-sand-50`}>
            <ClipboardList className="h-6 w-6 text-sunset-600" aria-hidden="true" />
            <span className="font-bold text-ink-900">Review orders</span>
          </Link>
          <Link href="/os/menu" className={`${card} flex min-h-16 items-center gap-3 p-4 transition hover:bg-sand-50`}>
            <UtensilsCrossed className="h-6 w-6 text-sunset-600" aria-hidden="true" />
            <span className="font-bold text-ink-900">Edit menu</span>
          </Link>
          <button type="button" onClick={actions.addSampleOrder} className={`${card} flex min-h-16 items-center gap-3 p-4 text-left transition hover:bg-sand-50`}>
            <Plus className="h-6 w-6 text-sunset-600" aria-hidden="true" />
            <span className="font-bold text-ink-900">Add sample order</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="home-menu">
        <SectionTitle
          aside={
            <Link href="/os/menu" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-sunset-700 hover:underline">
              Manage menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <span id="home-menu">Today&rsquo;s Menu availability</span>
        </SectionTitle>
        <ul className={`${card} divide-y divide-sand-100`}>
          {todays.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-ink-500">No dishes in Today&rsquo;s Menu yet.</li>
          ) : (
            todays.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-1.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`truncate font-semibold ${d.available ? "text-ink-900" : "text-ink-300 line-through"}`}>{d.name}</span>
                  {d.demo ? <DemoTag /> : null}
                </span>
                <span className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                  {d.available ? "Available" : "Sold out"}
                  <ToggleSwitch checked={d.available} onChange={() => actions.toggleDish(d.id)} label={`${d.name} available`} />
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
