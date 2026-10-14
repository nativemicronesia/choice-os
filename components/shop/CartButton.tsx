"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export function CartButton() {
  const { items, subtotal, openDrawer } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Review order, ${count} item${count === 1 ? "" : "s"}, $${subtotal.toFixed(2)}`}
      aria-live="polite"
      className="fixed inset-x-4 z-20 mx-auto flex min-h-14 max-w-md items-center justify-between gap-4 rounded-2xl bg-sunset-700 px-5 text-left text-white shadow-xl shadow-ink-900/20 transition-colors hover:bg-sunset-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-900 [bottom:max(1rem,env(safe-area-inset-bottom))]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold">Review order</span>
          <span className="block text-xs text-white/75">{count} {count === 1 ? "item" : "items"}</span>
        </span>
      </span>
      <span className="font-display text-lg font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
    </button>
  );
}
