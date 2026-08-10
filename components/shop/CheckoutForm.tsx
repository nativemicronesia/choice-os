"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { createClient } from "@/lib/supabase/client";

export function CheckoutForm() {
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
    const supabase = createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ customer_name: name.trim(), status: "pending", total: subtotal })
      .select()
      .single();

    if (orderError || !order) {
      setError("Couldn't place your order. Please try again.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        item_name: item.name,
        quantity: item.quantity,
        price_at_time: item.unitPrice,
        special_instructions: item.specialInstructions || null,
      })),
    );

    if (itemsError) {
      setError("Your order was started but items failed to save — please try again.");
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(`/order/${order.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Name for your order
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Mary"
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="rounded-lg bg-neutral-900 py-2.5 text-center font-semibold text-white disabled:bg-neutral-300"
      >
        {submitting ? "Placing order…" : `Place order · $${subtotal.toFixed(2)}`}
      </button>
    </form>
  );
}
