"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { cn } from "@/lib/utils/cn";
import { blankDish, formatPrice } from "@/lib/preview-os/logic";
import { actions, useBridgeStatus, usePreviewState } from "@/lib/preview-os/store";
import type { Dish, MenuGroup } from "@/lib/preview-os/types";
import { DishEditor } from "./DishEditor";
import { DemoTag, DishPhoto, PageHeader, Skeleton, btn, card } from "./ui";

const SECTIONS: { id: MenuGroup; label: string; blurb: string; empty: string }[] = [
  {
    id: "todays",
    label: "Today’s Menu",
    blurb: "Meals and plates that can change from day to day.",
    empty: "Nothing in Today’s Menu yet. Add what you’re serving today.",
  },
  {
    id: "featured",
    label: "Featured Specials",
    blurb: "Dishes you regularly promote.",
    empty: "No Featured Specials yet. Add a dish you like to promote.",
  },
];

export function MenuView() {
  const state = usePreviewState();
  const bridge = useBridgeStatus();
  const [section, setSection] = useState<MenuGroup>("todays");
  const [editing, setEditing] = useState<{ dish: Dish; isNew: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  if (!state) return <Skeleton />;

  const current = SECTIONS.find((s) => s.id === section)!;
  const dishes = state.dishes.filter((d) => d.group === section);
  const count = (g: MenuGroup) => state.dishes.filter((d) => d.group === g).length;

  return (
    <>
      <PageHeader
        title="Menu"
        subtitle="Dishes below are demonstration samples, not Choice’s confirmed menu. Prices stay blank until you set them."
        action={
          <button type="button" className={btn.primary} onClick={() => setEditing({ dish: blankDish(section), isNew: true })}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add dish
          </button>
        }
      />

      <div className="mb-2 grid grid-cols-2 gap-1 rounded-2xl bg-sand-100 p-1" role="tablist" aria-label="Menu sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            onClick={() => { setSection(s.id); setConfirmId(null); }}
            className={cn("min-h-12 rounded-xl px-3 text-sm font-bold transition", section === s.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900")}
          >
            {s.label} <span className="ml-1 text-xs font-semibold text-ink-300">{count(s.id)}</span>
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-ink-500">{current.blurb}</p>

      {dishes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-300 bg-white px-6 py-12 text-center text-sm text-ink-500">{current.empty}</div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {dishes.map((d) => (
            <li key={d.id} className={cn(card, "flex gap-3 p-3", !d.available && "bg-sand-50")}>
              <button type="button" onClick={() => setEditing({ dish: d, isNew: false })} className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-ocean-600" aria-label={`Change photo or details for ${d.name}`}>
                <DishPhoto dish={d} className={cn("h-24 w-24 rounded-xl", !d.available && "opacity-50 grayscale")} />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className={cn("truncate font-bold", d.available ? "text-ink-900" : "text-ink-500")}>{d.name}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
                      <span className={d.price == null ? "text-ink-500" : "font-bold text-sunset-700"}>{formatPrice(d.price)}</span>
                      {d.demo ? <DemoTag /> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <ToggleSwitch checked={d.available} onChange={() => actions.toggleDish(d.id)} label={`${d.name} available`} />
                    <span className="-mt-2 text-[11px] font-semibold text-ink-500">{d.available ? "Available" : "Sold out"}</span>
                  </div>
                </div>
                {d.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-500">{d.description}</p> : null}
                <div className="mt-auto flex items-center gap-1 pt-2">
                  <button type="button" className={cn(btn.ghost, "-ml-3")} onClick={() => setEditing({ dish: d, isNew: false })}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </button>
                  {confirmId === d.id ? (
                    <>
                      <button type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sunset-700 px-3 text-sm font-bold text-white" onClick={() => { actions.removeDish(d.id); setConfirmId(null); }}>
                        Confirm remove
                      </button>
                      <button type="button" className={btn.ghost} onClick={() => setConfirmId(null)}>Keep</button>
                    </>
                  ) : (
                    <button type="button" className={btn.ghost} onClick={() => setConfirmId(d.id)} aria-label={`Remove ${d.name}`}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-ink-500">
        {bridge.menuPublishedAt
          ? "Changes are saved on this device and shared with the storefront preview’s menu feed."
          : "Changes are saved on this device."}
      </p>

      {editing ? (
        <DishEditor
          key={editing.dish.id}
          initial={editing.dish}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(d) => { actions.saveDish(d); setSection(d.group); setEditing(null); }}
        />
      ) : null}
    </>
  );
}
