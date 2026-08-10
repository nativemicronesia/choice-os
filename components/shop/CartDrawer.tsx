"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { ItemImage } from "./ItemImage";
import { CheckoutForm } from "./CheckoutForm";

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer, setQuantity, setInstructions, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-ink-900/40" onClick={closeDrawer}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-sand-50 p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Your order</h2>
          <button type="button" onClick={closeDrawer} className="text-ink-300" aria-label="Close cart">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {items.length === 0 && <p className="text-ink-300">Your cart is empty.</p>}
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex gap-3 border-b border-sand-200 pb-3">
                <ItemImage src={item.imageUrl} alt={item.name} size={48} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-ink-900">{item.name}</span>
                    <span className="font-medium text-ink-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                      className="h-7 w-7 rounded-full border border-sand-300 text-ink-700"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-ink-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                      className="h-7 w-7 rounded-full border border-sand-300 text-ink-700"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItemId)}
                      className="ml-auto text-sm text-ink-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={item.specialInstructions}
                    onChange={(event) => setInstructions(item.menuItemId, event.target.value)}
                    placeholder="Special instructions (optional)"
                    className="mt-2 w-full rounded-lg border border-sand-200 px-2 py-1 text-sm text-ink-900 placeholder:text-ink-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 border-t border-sand-200 pt-4">
            <div className="mb-3 flex items-center justify-between font-display font-semibold text-ink-900">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {isCheckingOut ? (
              <CheckoutForm />
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className="w-full rounded-lg bg-ocean-700 py-2.5 text-center font-semibold text-white"
              >
                Checkout
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
