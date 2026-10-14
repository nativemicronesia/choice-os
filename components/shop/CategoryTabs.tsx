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
    <nav aria-label="Menu categories" className="sticky top-[68px] z-10 -mx-5 flex gap-2 overflow-x-auto border-b border-sand-200 bg-sand-50/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className={cn(
            "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-700",
            selected === category
              ? "border-ocean-900 bg-ocean-900 text-white"
              : "border-sand-200 bg-white text-ink-700 hover:border-ocean-700 hover:text-ocean-900",
          )}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
