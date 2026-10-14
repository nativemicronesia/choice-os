"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type MenuItem } from "@/lib/types/database";
import { CategoryTabs } from "./CategoryTabs";
import { ItemCard } from "./ItemCard";

export function MenuBrowser({ items }: { items: MenuItem[] }) {
  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => items.some((item) => item.category === c)),
    [items],
  );
  const [selected, setSelected] = useState<string>(availableCategories[0] ?? CATEGORIES[0]);
  const activeCategory = availableCategories.includes(selected as (typeof CATEGORIES)[number])
    ? selected
    : (availableCategories[0] ?? selected);
  const filtered = useMemo(
    () => items.filter((item) => item.category === activeCategory),
    [items, activeCategory],
  );

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-sand-300 bg-white px-5 py-12 text-center">
        <p className="font-display text-xl font-semibold text-ink-900">The menu is being updated</p>
        <p className="mt-2 text-sm text-ink-500">There are no dishes available to order online right now. Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <CategoryTabs
        categories={availableCategories}
        selected={activeCategory}
        onSelect={setSelected}
      />
      <div className="mb-3 mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-700">{activeCategory}</p>
        <p className="text-sm text-ink-500">{filtered.length} {filtered.length === 1 ? "item" : "items"}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-sand-300 py-8 text-center text-sm text-ink-500 md:col-span-2">Nothing is available in this category today.</p>
        )}
      </div>
    </div>
  );
}
