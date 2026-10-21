"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { compressImageFile } from "@/lib/utils/compressImage";
import type { Dish, MenuGroup } from "@/lib/preview-os/types";
import { DishPhoto, btn } from "./ui";

const GROUP_LABEL: Record<MenuGroup, string> = { todays: "Today’s Menu", featured: "Featured Specials" };
const field = "mt-1 block min-h-11 w-full rounded-xl border border-sand-300 bg-white px-3 text-base text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ocean-600";

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function DishEditor({ initial, isNew, onSave, onClose }: { initial: Dish; isNew: boolean; onSave: (d: Dish) => void; onClose: () => void }) {
  const [dish, setDish] = useState(initial);
  const [price, setPrice] = useState(initial.price == null ? "" : String(initial.price));
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    try {
      const small = await compressImageFile(file, { maxDimension: 640, quality: 0.72 });
      const url = await readAsDataUrl(small);
      if (url.length > 400_000) return setError("That photo is too large for the preview. Try a smaller one.");
      setError(null);
      setDish((d) => ({ ...d, image: url }));
    } catch {
      setError("Could not read that photo.");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = dish.name.trim();
    if (!name) return setError("Please give the dish a name.");
    const trimmed = price.trim().replace(/^\$/, "");
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && (!Number.isFinite(parsed) || parsed < 0 || parsed > 999)) return setError("Enter a price like 6.50, or leave it blank.");
    onSave({ ...dish, name, description: dish.description.trim(), price: parsed == null ? null : Math.round(parsed * 100) / 100, demo: dish.demo && name === initial.name && dish.description.trim() === initial.description });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-900/50 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-editor-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-sand-50 p-5 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="dish-editor-title" className="ox-display text-xl font-extrabold text-ink-900">{isNew ? "Add a dish" : "Edit dish"}</h2>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand-100" aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink-700">
            Name
            <input ref={nameRef} className={field} value={dish.name} maxLength={80} onChange={(e) => setDish({ ...dish, name: e.target.value })} />
          </label>
          <label className="block text-sm font-semibold text-ink-700">
            Description
            <textarea className={`${field} min-h-24 py-2`} value={dish.description} maxLength={300} onChange={(e) => setDish({ ...dish, description: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-ink-700">
              Price (USD)
              <input className={field} inputMode="decimal" placeholder="Not set" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-ink-700">
              Section
              <select className={field} value={dish.group} onChange={(e) => setDish({ ...dish, group: e.target.value as MenuGroup })}>
                {(Object.keys(GROUP_LABEL) as MenuGroup[]).map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-sand-200 bg-white px-3">
            <span className="text-sm font-semibold text-ink-700">Available now</span>
            <ToggleSwitch checked={dish.available} onChange={(v) => setDish({ ...dish, available: v })} label="Available now" />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-700">Photo</p>
            <div className="mt-1 flex items-center gap-3">
              <DishPhoto dish={dish} className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="flex flex-wrap gap-2">
                <label className={`${btn.secondary} cursor-pointer`}>
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {dish.image ? "Replace photo" : "Add photo"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {dish.image ? <button type="button" className={btn.ghost} onClick={() => setDish({ ...dish, image: null })}>Remove</button> : null}
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-500">Photos stay on this device in the preview.</p>
          </div>

          {error ? <p role="alert" className="rounded-xl bg-sunset-50 px-3 py-2 text-sm font-semibold text-sunset-700">{error}</p> : null}
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" className={`${btn.secondary} flex-1`} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${btn.primary} flex-1`}>{isNew ? "Add dish" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
