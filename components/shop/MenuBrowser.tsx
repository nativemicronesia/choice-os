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
      <p className="mt-6 rounded-xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500">
        Nothing on today&apos;s board yet. Check back soon, or visit the shop to walk in.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <CategoryTabs
        categories={availableCategories}
        selected={activeCategory}
        onSelect={setSelected}
      />
      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-neutral-400">Nothing in this category today.</p>
        )}
      </div>
    </div>
  );
}
