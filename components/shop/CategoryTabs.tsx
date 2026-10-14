"use client";

import { cn } from "@/lib/utils/cn";

export function CategoryTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <nav aria-label="Menu categories" className="sticky top-14 z-10 -mx-4 flex gap-2 overflow-x-auto bg-sand-50/90 px-4 py-3 backdrop-blur">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className={cn(
            "min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
            selected === category
              ? "bg-ocean-700 text-white shadow-[var(--shadow-card)]"
              : "bg-sand-100 text-ink-700",
          )}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
