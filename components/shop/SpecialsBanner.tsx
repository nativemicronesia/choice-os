import type { DailySpecial } from "@/lib/types/database";

export function SpecialsBanner({ specials }: { specials: DailySpecial[] }) {
  if (specials.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      {specials.map((special) => (
        <div key={special.id} className="rounded-xl bg-amber-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-amber-900">{special.title}</h2>
            <span className="shrink-0 font-semibold text-amber-900">${special.price.toFixed(2)}</span>
          </div>
          {special.description && <p className="mt-1 text-sm text-amber-800">{special.description}</p>}
        </div>
      ))}
    </div>
  );
}
