"use client";

import { useState, type FormEvent } from "react";
import { deleteDailySpecialPhoto, uploadDailySpecialPhoto, upsertDailySpecial } from "@/lib/actions/specials";
import { PhotoUploadField } from "@/components/shared/PhotoUploadField";
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
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
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
      image_url: imageUrl,
    });

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onSaved({
      id: result.id,
      title: title.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      active,
      image_url: imageUrl,
      created_at: initial?.created_at ?? new Date().toISOString(),
    });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-sand-200 p-3">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        required
        className="rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
      />
      <input
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        placeholder="Price"
        inputMode="decimal"
        required
        className="rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
      />
      <PhotoUploadField
        label="Special photo"
        value={imageUrl}
        onChange={setImageUrl}
        uploadAction={uploadDailySpecialPhoto}
        deleteAction={deleteDailySpecialPhoto}
        onBusyChange={setUploadBusy}
      />
      <label className="flex items-center gap-2 text-sm text-ink-900">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active (visible to customers)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || uploadBusy}
          className="rounded-lg bg-ocean-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-sand-300"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-ink-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
