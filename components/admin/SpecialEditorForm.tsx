"use client";

import { useState, type FormEvent } from "react";
import { deleteDailySpecialPhoto, uploadDailySpecialPhoto, upsertDailySpecial } from "@/lib/actions/specials";
import { PhotoUploadField } from "@/components/shared/PhotoUploadField";
import { WEEKDAYS, type DailySpecial } from "@/lib/types/database";

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
  const [frequency, setFrequency] = useState<"daily" | "weekly">(initial?.frequency ?? "daily");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? []);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!title.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a title and a valid price.");
      return;
    }
    if (frequency === "weekly" && weekdays.length === 0) {
      setError("Choose at least one weekday for a weekly special.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await upsertDailySpecial({
        id: initial?.id,
        title: title.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        active,
        frequency,
        weekdays: frequency === "weekly" ? weekdays : [],
        image_url: imageUrl,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSaved({
        id: result.id,
        title: title.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        active,
        frequency,
        weekdays: frequency === "weekly" ? weekdays : [],
        image_url: imageUrl,
        created_at: initial?.created_at ?? new Date().toISOString(),
      });
    } catch {
      setError("Could not save this special. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-sand-200 p-3">
      <label htmlFor="special-title" className="flex flex-col gap-1 text-sm text-ink-700">
        Special name
        <input
          id="special-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="min-h-11 rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
        />
      </label>
      <label htmlFor="special-description" className="flex flex-col gap-1 text-sm text-ink-700">
        Description (optional)
        <textarea
          id="special-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="min-h-11 rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
        />
      </label>
      <label htmlFor="special-price" className="flex flex-col gap-1 text-sm text-ink-700">
        Price (USD)
        <input
          id="special-price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          required
          className="min-h-11 rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-700">
        Schedule
        <select
          value={frequency}
          onChange={(event) => {
            const next = event.target.value as "daily" | "weekly";
            setFrequency(next);
            if (next === "weekly" && weekdays.length === 0) setWeekdays([5]);
          }}
          className="min-h-11 rounded-lg border border-sand-300 px-3 py-2 text-sm text-ink-900"
        >
          <option value="daily">Every day</option>
          <option value="weekly">Weekly on selected days</option>
        </select>
      </label>
      {frequency === "weekly" ? (
        <fieldset className="rounded-lg border border-sand-200 p-3">
          <legend className="px-1 text-xs font-medium text-ink-500">Show this special on</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WEEKDAYS.map((day) => (
              <label key={day.value} className="flex min-h-11 items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={weekdays.includes(day.value)}
                  onChange={(event) => setWeekdays((current) => event.target.checked
                    ? [...current, day.value]
                    : current.filter((value) => value !== day.value))}
                />
                {day.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <PhotoUploadField
        label="Special photo"
        value={imageUrl}
        onChange={setImageUrl}
        uploadAction={uploadDailySpecialPhoto}
        deleteAction={deleteDailySpecialPhoto}
        onBusyChange={setUploadBusy}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm text-ink-900">
        <input className="h-5 w-5" type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active (visible to customers)
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || uploadBusy}
          className="min-h-11 rounded-lg bg-ocean-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-sand-300"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-lg px-4 py-2 text-sm text-ink-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
