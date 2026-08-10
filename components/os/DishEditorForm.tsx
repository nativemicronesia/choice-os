"use client";

import { useState } from "react";
import { CATEGORIES, type MenuItem } from "@/lib/types/database";
import { upsertMenuItem } from "@/lib/actions/menu";

type Props = {
  initial?: MenuItem | null;
  onSaved: (item: MenuItem) => void;
  onCancel: () => void;
};

export function DishEditorForm({ initial, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isAvailable, setIsAvailable] = useState(initial?.is_available ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const parsedPrice = Number(price);
    const result = await upsertMenuItem({
      id: initial?.id,
      name,
      category,
      description: description.trim() || null,
      price: parsedPrice,
      image_url: imageUrl.trim() || null,
      is_available: isAvailable,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSaved({
      id: result.id,
      name: name.trim(),
      category,
      description: description.trim() || null,
      price: parsedPrice,
      image_url: imageUrl.trim() || null,
      is_available: isAvailable,
      created_at: initial?.created_at ?? new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div>
        <label className="mb-1 block text-xs text-neutral-600" htmlFor="dish-name">
          Dish name
        </label>
        <input
          id="dish-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-600" htmlFor="dish-category">
            Category
          </label>
          <select
            id="dish-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600" htmlFor="dish-price">
            Price ($)
          </label>
          <input
            id="dish-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-600" htmlFor="dish-desc">
          Description (optional)
        </label>
        <textarea
          id="dish-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-600" htmlFor="dish-image">
          Image URL (optional)
        </label>
        <input
          id="dish-image"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
        />
        On today&apos;s board (orderable online)
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save dish"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
