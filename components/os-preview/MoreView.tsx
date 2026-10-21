"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw } from "lucide-react";
import { actions, storageIsPersistent, useBridgeStatus, usePreviewState } from "@/lib/preview-os/store";
import { PageHeader, SectionTitle, Skeleton, btn, card } from "./ui";

const PENDING = [
  "Real menu items, plate combinations and prices",
  "Opening hours and when ordering is available",
  "Order policies: dine-in, stop-by, payment and timing",
  "How and where new orders reach Turay",
];

export function MoreView() {
  const state = usePreviewState();
  const bridge = useBridgeStatus();
  const [confirming, setConfirming] = useState(false);
  if (!state) return <Skeleton />;

  const storefrontOrders = state.orders.filter((o) => o.source === "storefront").length;
  const rows: [string, string][] = [
    ["Mode", "Preview, demonstration data only"],
    ["Sign-in", "Not required in preview"],
    ["Data", storageIsPersistent() ? "Saved on this device" : "This browser is blocking saving; changes last until you close the page"],
    ["Storefront orders", bridge.storefront === "connected" ? `Connected, ${storefrontOrders} received` : bridge.storefront === "unavailable" ? "Not reachable right now" : "Checking…"],
    ["Menu feed", bridge.menuPublishedAt ? "Shared with the storefront preview" : "Not shared yet"],
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="More" subtitle="Preview information and settings." />

      <section aria-labelledby="more-status">
        <SectionTitle><span id="more-status">Preview status</span></SectionTitle>
        <dl className={`${card} divide-y divide-sand-100`}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-sm text-ink-500">{k}</dt>
              <dd className="text-sm font-semibold text-ink-900 sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/" target="_blank" className={`${btn.secondary} mt-3`}>
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open the public storefront
        </Link>
      </section>

      <section aria-labelledby="more-pending">
        <SectionTitle><span id="more-pending">Waiting on Turay&rsquo;s confirmation</span></SectionTitle>
        <ul className={`${card} space-y-2 p-4 text-sm text-ink-700`}>
          {PENDING.map((p) => (
            <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset-500" aria-hidden="true" />{p}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-500">Nothing in this preview is a confirmed menu, price or policy. Live orders, online payment and notifications are not connected.</p>
      </section>

      <section aria-labelledby="more-reset">
        <SectionTitle><span id="more-reset">Demonstration data</span></SectionTitle>
        <div className={`${card} p-4`}>
          <p className="text-sm text-ink-700">Start over with the original sample dishes and orders. Your edits and order progress on this device will be cleared.</p>
          {confirming ? (
            <div className="mt-3 flex gap-2">
              <button type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sunset-700 px-4 text-sm font-bold text-white" onClick={() => { actions.reset(); setConfirming(false); }}>
                Yes, reset the preview
              </button>
              <button type="button" className={btn.secondary} onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className={`${btn.secondary} mt-3`} onClick={() => setConfirming(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset demonstration data
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
