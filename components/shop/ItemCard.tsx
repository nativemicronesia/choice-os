"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import type { MenuItem } from "@/lib/types/database";
import { ItemImage } from "./ItemImage";

export function ItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <article className="flex min-h-40 gap-4 rounded-2xl border border-sand-200 bg-white p-4 transition-colors hover:border-sand-300 sm:p-5">
      <ItemImage src={item.image_url} alt={item.name} category={item.category} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 font-semibold leading-5 text-ink-900 sm:text-lg">{item.name}</h3>
          {!item.is_available && (
            <span className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ink-500">Sold out</span>
          )}
        </div>
        {item.description && <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-ink-500">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-xl font-semibold tabular-nums text-ink-900">${item.price.toFixed(2)}</span>
          <button
            type="button"
            disabled={!item.is_available}
            aria-label={item.is_available ? `Add ${item.name} to order` : `${item.name} is sold out`}
            onClick={() => addItem({
              itemId: item.id,
              itemType: "menu",
              name: item.name,
              unitPrice: item.price,
              imageUrl: item.image_url,
            })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ocean-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-ocean-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-700 disabled:cursor-not-allowed disabled:bg-sand-300 disabled:text-ink-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
