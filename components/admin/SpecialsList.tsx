"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { upsertDailySpecial } from "@/lib/actions/specials";
import type { DailySpecial } from "@/lib/types/database";
import { SpecialEditorForm } from "./SpecialEditorForm";

export function SpecialsList({ specials: initialSpecials }: { specials: DailySpecial[] }) {
  const [specials, setSpecials] = useState(initialSpecials);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  function upsertLocal(special: DailySpecial) {
    setSpecials((prev) => {
      const exists = prev.some((s) => s.id === special.id);
      return exists ? prev.map((s) => (s.id === special.id ? special : s)) : [special, ...prev];
    });
    setEditingId(null);
  }

  async function handleToggleActive(special: DailySpecial, next: boolean) {
    setSpecials((prev) => prev.map((s) => (s.id === special.id ? { ...s, active: next } : s)));
    const result = await upsertDailySpecial({ ...special, active: next });
    if (!result.success) {
      setSpecials((prev) => prev.map((s) => (s.id === special.id ? { ...s, active: !next } : s)));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {specials.map((special) =>
        editingId === special.id ? (
          <SpecialEditorForm
            key={special.id}
            initial={special}
            onSaved={upsertLocal}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={special.id} className="flex items-center justify-between rounded-lg border border-sand-200 p-3">
            <div>
              <p className="font-medium text-ink-900">{special.title}</p>
              <p className="text-xs text-ink-500">${special.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingId(special.id)}
                className="text-sm text-ink-500 underline"
              >
                Edit
              </button>
              <ToggleSwitch
                checked={special.active}
                onChange={(next) => handleToggleActive(special, next)}
                label={`${special.title} active`}
              />
            </div>
          </div>
        ),
      )}

      {editingId === "new" ? (
        <SpecialEditorForm onSaved={upsertLocal} onCancel={() => setEditingId(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="rounded-lg border border-dashed border-sand-300 py-2 text-sm font-medium text-ink-500"
        >
          + Add daily special
        </button>
      )}
    </div>
  );
}
