"use client";

import { useState, type FormEvent } from "react";
import { upsertDailySpecial } from "@/lib/actions/specials";
import type { DailySpecial } from "@/lib/types/database";

export function SpecialEditorForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: DailySpecial;
  onSaved: (special: DailySpecial) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!title.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Enter a title and a valid price.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await upsertDailySpecial({
      id: initial?.id,
      title: title.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      active,
    });

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onSaved({ id: result.id, title: title.trim(), description: description.trim() || null, price: parsedPrice, active, created_at: initial?.created_at ?? new Date().toISOString() });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        placeholder="Price"
        inputMode="decimal"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active (visible to customers)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-neutral-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
