import Image from "next/image";
import type { DailySpecial } from "@/lib/types/database";
import { PlaceholderArt } from "./ItemImage";

export function SpecialsBanner({ specials }: { specials: DailySpecial[] }) {
  if (specials.length === 0) return null;

  return (
    <div className="mt-4 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {specials.map((special) => (
        <div
          key={special.id}
          className="w-[85%] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] border border-sand-200 bg-white shadow-[var(--shadow-card)]"
        >
          <div className="relative aspect-16/9 bg-sand-100">
            {special.image_url ? (
              <Image src={special.image_url} alt={special.title} fill sizes="85vw" className="object-cover" />
            ) : (
              <PlaceholderArt className="h-full w-full rounded-none" />
            )}
            <span className="absolute left-3 top-3 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              Today&apos;s Special
            </span>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-ink-900">{special.title}</h2>
              <span className="shrink-0 font-display text-lg font-semibold text-sunset-600">
                ${special.price.toFixed(2)}
              </span>
            </div>
            {special.description && <p className="mt-1 text-sm text-ink-500">{special.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
