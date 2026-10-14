"use client";

import { useCart } from "@/lib/cart/CartContext";
import { cn } from "@/lib/utils/cn";
import type { MenuItem } from "@/lib/types/database";
import { ItemImage } from "./ItemImage";

export function ItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <div
      className={cn(
        "flex gap-3 rounded-[var(--radius-card)] border border-sand-200 bg-white p-3 shadow-[var(--shadow-card)]",
        !item.is_available && "opacity-50",
      )}
    >
      <ItemImage src={item.image_url} alt={item.name} category={item.category} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-ink-900">{item.name}</h3>
          {!item.is_available && (
            <span className="shrink-0 rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-ink-500">
              Sold Out
            </span>
          )}
        </div>
        {item.description && <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display font-semibold text-ink-900">${item.price.toFixed(2)}</span>
          <button
            type="button"
            disabled={!item.is_available}
            onClick={() =>
              addItem({
                itemId: item.id,
                itemType: "menu",
                name: item.name,
                unitPrice: item.price,
                imageUrl: item.image_url,
              })
            }
            className="rounded-full bg-sunset-500 px-4 py-1.5 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:bg-sand-300 disabled:shadow-none"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
