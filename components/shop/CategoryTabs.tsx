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
    <div className="sticky top-14 z-10 -mx-4 flex gap-2 overflow-x-auto bg-white/90 px-4 py-3 backdrop-blur">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
            selected === category ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
