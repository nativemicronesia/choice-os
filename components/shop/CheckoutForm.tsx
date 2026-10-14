"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";

export function CheckoutForm({ onCancel, onOrderPlaced }: { onCancel: () => void; onOrderPlaced: () => void }) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || items.length === 0) return;

    setSubmitting(true);
    setError(null);
    let response: Response;
    try {
      response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          items: items.map((item) => ({
            itemId: item.itemId,
            itemType: item.itemType,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        }),
      });
    } catch {
      setError("Couldn't place your order. Check your connection and try again.");
      setSubmitting(false);
      return;
    }

    const result = (await response.json().catch(() => null)) as { orderId?: string; error?: string } | null;
    if (!response.ok || !result?.orderId) {
      setError(result?.error ?? "Couldn't place your order. Please try again.");
      setSubmitting(false);
      return;
    }

    clearCart();
    onOrderPlaced();
    router.push(`/order/${result.orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-ink-900">
        Name for your order
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Mary"
          required
          className="mt-1 min-h-11 w-full rounded-lg border border-sand-300 px-3 py-2 text-ink-900 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
        />
      </label>
      {error && <p role="alert" aria-live="assertive" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="min-h-11 rounded-lg bg-sunset-500 py-2.5 text-center font-semibold text-white disabled:bg-sand-300"
      >
        {submitting ? "Placing order…" : `Place order · $${subtotal.toFixed(2)}`}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="min-h-11 rounded-lg border border-sand-300 py-2.5 text-center text-sm font-semibold text-ink-700 disabled:opacity-60"
      >
        Back to cart
      </button>
    </form>
  );
}
