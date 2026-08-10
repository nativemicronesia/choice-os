"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export function CartButton() {
  const { items, openDrawer } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-sunset-600 to-sunset-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      View cart · {count} item{count === 1 ? "" : "s"}
    </button>
  );
}
