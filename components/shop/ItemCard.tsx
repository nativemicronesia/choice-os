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
        "flex gap-3 rounded-xl border border-neutral-200 p-3",
        !item.is_available && "opacity-50",
      )}
    >
      <ItemImage src={item.image_url} alt={item.name} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{item.name}</h3>
          {!item.is_available && (
            <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Sold Out
            </span>
          )}
        </div>
        {item.description && <p className="mt-0.5 text-sm text-neutral-500">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">${item.price.toFixed(2)}</span>
          <button
            type="button"
            disabled={!item.is_available}
            onClick={() =>
              addItem({
                menuItemId: item.id,
                name: item.name,
                unitPrice: item.price,
                imageUrl: item.image_url,
              })
            }
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
