"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { deleteMenuItem, toggleMenuItemAvailability } from "@/lib/actions/menu";
import type { MenuItem } from "@/lib/types/database";
import { DishEditorForm } from "./DishEditorForm";

export function TodaysMenuManager({ items: initialItems }: { items: MenuItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  function upsertLocal(item: MenuItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
    setEditingId(null);
  }

  async function handleToggle(item: MenuItem, next: boolean) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: next } : i)));
    const result = await toggleMenuItemAvailability(item.id, next);
    if (!result.success) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: !next } : i)));
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Remove “${item.name}” from the dish library?`)) return;
    const result = await deleteMenuItem(item.id);
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-neutral-600">
          Toggle what customers can order online today. Add new platters when the lineup
          changes.
        </p>
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
        >
          Add dish
        </button>
      </div>

      {editingId === "new" ? (
        <DishEditorForm onSaved={upsertLocal} onCancel={() => setEditingId(null)} />
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No dishes yet. Add today&apos;s platters to open the online board.
        </p>
      ) : (
        Object.entries(byCategory).map(([category, categoryItems]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-neutral-500">{category}</h2>
            <div className="mt-2 flex flex-col gap-2">
              {categoryItems.map((item) =>
                editingId === item.id ? (
                  <DishEditorForm
                    key={item.id}
                    initial={item}
                    onSaved={upsertLocal}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        ${item.price.toFixed(2)}
                        {item.is_available ? " · on today's board" : " · hidden online"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ToggleSwitch
                        checked={item.is_available}
                        onChange={(next) => handleToggle(item, next)}
                        label={`${item.name} on today's board`}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
