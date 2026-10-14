"use client";

import { Plus, Sparkles, Utensils } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import type { DailySpecial } from "@/lib/types/database";
import { formatSpecialSchedule } from "@/lib/specials/schedule";

export function SpecialsBanner({ specials }: { specials: DailySpecial[] }) {
  const { addItem } = useCart();
  if (specials.length === 0) return null;

  return (
    <section className="border-y border-sand-200 bg-sand-100/80 py-9 sm:py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sunset-700">A little extra today</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">Daily &amp; weekly specials</h2>
          </div>
          <Sparkles className="mb-1 hidden h-6 w-6 text-sunset-600 sm:block" aria-hidden="true" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {specials.map((special) => (
            <article key={special.id} className="group flex min-h-48 flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:p-6">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sunset-100 text-sunset-700">
                  <Utensils className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-semibold text-ocean-800">
                    {formatSpecialSchedule(special)}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-ink-900">{special.title}</h3>
                  {special.description && <p className="mt-1 max-w-md text-sm leading-6 text-ink-500">{special.description}</p>}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-4 border-t border-sand-200 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <span className="font-display text-2xl font-semibold tabular-nums text-ink-900">${special.price.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => addItem({
                    itemId: special.id,
                    itemType: "special",
                    name: special.title,
                    unitPrice: special.price,
                    imageUrl: special.image_url,
                  })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sunset-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sunset-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-900"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add to order
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
