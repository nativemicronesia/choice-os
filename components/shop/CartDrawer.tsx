"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { ItemImage } from "./ItemImage";
import { CheckoutForm } from "./CheckoutForm";

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer, setQuantity, setInstructions, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  function closeCart() {
    setIsCheckingOut(false);
    closeDrawer();
  }

  function finishCheckout() {
    setIsCheckingOut(false);
    closeDrawer();
  }

  useEffect(() => {
    if (!isDrawerOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = document.querySelectorAll<HTMLElement>(
        '[role="dialog"] a[href], [role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled), [role="dialog"] [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-900/55 backdrop-blur-[2px]" onClick={closeCart}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="flex h-dvh w-full max-w-lg flex-col overscroll-contain bg-sand-50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl sm:px-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="cart-title" className="font-display text-2xl font-semibold text-ink-900">Your order</h2>
            <p className="mt-1 text-sm text-ink-500">Pickup in Weno · Pay cash at the counter</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={closeCart} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-700" aria-label="Close cart">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          {items.length === 0 && <p className="rounded-xl bg-white p-4 text-sm text-ink-500">Your order is empty. Close this panel to keep browsing.</p>}
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={`${item.itemType}:${item.itemId}`} className="flex gap-3 border-b border-sand-200 pb-5">
                <ItemImage src={item.imageUrl} alt={item.name} size={48} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-ink-900">{item.name}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-ink-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => setQuantity(item.itemId, item.itemType, item.quantity - 1)}
                      className="min-h-11 min-w-11 rounded-full border border-sand-300 bg-white text-ink-700 transition-colors hover:border-ocean-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-800"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="w-6 text-center text-ink-900">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => setQuantity(item.itemId, item.itemType, item.quantity + 1)}
                      className="min-h-11 min-w-11 rounded-full border border-sand-300 bg-white text-ink-700 transition-colors hover:border-ocean-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-800"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.itemId, item.itemType)}
                      className="ml-auto min-h-11 px-2 text-sm font-semibold text-ocean-800 underline underline-offset-2 hover:text-ocean-600 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="sr-only" htmlFor={`instructions-${item.itemType}-${item.itemId}`}>Special instructions for {item.name}</label>
                  <input
                    id={`instructions-${item.itemType}-${item.itemId}`}
                    value={item.specialInstructions}
                    onChange={(event) => setInstructions(item.itemId, item.itemType, event.target.value)}
                    placeholder="Note for the kitchen (optional)…"
                    className="mt-3 min-h-11 w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ocean-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 border-t border-sand-200 pt-4">
            <div className="mb-3 flex items-center justify-between font-display text-lg font-semibold text-ink-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="mb-4 text-xs leading-5 text-ink-500">The final total is confirmed against today&apos;s menu when you place your order. Pay cash when you collect.</p>
            {isCheckingOut ? (
              <CheckoutForm onCancel={() => setIsCheckingOut(false)} onOrderPlaced={finishCheckout} />
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className="min-h-12 w-full rounded-full bg-ocean-900 py-3 text-center font-semibold text-white transition-colors hover:bg-ocean-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-700"
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
