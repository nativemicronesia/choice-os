import type { MenuItem } from "@/lib/types/database";
import { MenuToggleRow } from "./MenuToggleRow";

export function MenuToggleList({ items }: { items: MenuItem[] }) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(byCategory).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-neutral-500">{category}</h3>
          <div className="mt-1">
            {categoryItems.map((item) => (
              <MenuToggleRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
