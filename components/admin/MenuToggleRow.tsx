"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { toggleMenuItemAvailability } from "@/lib/actions/menu";
import type { MenuItem } from "@/lib/types/database";

export function MenuToggleRow({ item }: { item: MenuItem }) {
  const [available, setAvailable] = useState(item.is_available);
  const [pending, setPending] = useState(false);

  async function handleChange(next: boolean) {
    setAvailable(next); // optimistic
    setPending(true);
    const result = await toggleMenuItemAvailability(item.id, next);
    if (!result.success) setAvailable(!next); // revert
    setPending(false);
  }

  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-neutral-500">
          {item.category} · ${item.price.toFixed(2)}
        </p>
      </div>
      <ToggleSwitch checked={available} onChange={handleChange} disabled={pending} label={`${item.name} available`} />
    </div>
  );
}
