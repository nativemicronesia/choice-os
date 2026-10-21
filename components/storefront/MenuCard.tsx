"use client";

import { FoodImage } from "./FoodImage";
import { usePreviewCart } from "./PreviewCart";
import type { MenuEntry } from "@/lib/storefront/catalog";

export function MenuCard({ item, src, variant }: { item: MenuEntry; src: string | null; variant: "row" | "feature" }) {
  const { quantities, add, setQty } = usePreviewCart();
  const qty = quantities[item.id] ?? 0;
  const feature = variant === "feature";

  const control = qty === 0 ? (
    <button
      type="button"
      onClick={() => add(item.id)}
      aria-label={`Add ${item.name} to order`}
      className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-600 ${feature ? "bg-sunset-500 text-ink-900 hover:bg-sunset-400" : "bg-ink-900 text-sand-50 hover:bg-sunset-700"}`}
    >
      Add to order
    </button>
  ) : (
    <div role="group" aria-label={`${item.name} quantity`} className="inline-flex items-center rounded-full bg-sunset-500 text-ink-900">
      <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQty(item.id, qty - 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900">−</button>
      <span aria-live="polite" className="min-w-8 text-center font-extrabold tabular-nums">{qty}</span>
      <button type="button" aria-label={`Add one more ${item.name}`} onClick={() => add(item.id)} className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900">+</button>
    </div>
  );

  const price = <span className="text-sm font-semibold text-ink-500">{item.price === null ? "Price to be confirmed" : `$${item.price.toFixed(2)}`}</span>;

  return (
    <article className={`group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink-900/15 ${feature ? "bg-ink-900 text-sand-50" : "bg-white shadow-card sm:flex"}`}>
      <div className={`relative overflow-hidden ${feature ? "aspect-square" : "aspect-[4/3] sm:aspect-auto sm:w-2/5 sm:min-h-52 sm:shrink-0"}`}>
        <FoodImage src={src} alt={item.name} label={`${item.name} · ${feature ? "1200×1200" : "1000×800"}`} tone={item.tone} sizes={feature ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 20vw, 100vw"} />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-900">Demo</span>
      </div>
      <div className={`flex flex-col gap-3 p-5 ${feature ? "" : "sm:flex-1 sm:p-6"}`}>
        <div>
          <h3 className="sf-display text-2xl font-bold leading-tight">{item.name}</h3>
          <p className={`mt-1 ${feature ? "text-sand-300" : "text-ink-700"}`}>{item.blurb}</p>
        </div>
        {item.availability && <p className={`text-xs font-bold uppercase tracking-wider ${feature ? "text-sunset-400" : "text-palm-600"}`}>{item.availability}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className={feature ? "[&>span]:text-sand-300" : ""}>{price}</span>
          {control}
        </div>
      </div>
    </article>
  );
}
