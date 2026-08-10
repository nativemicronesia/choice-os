import { MapPin } from "lucide-react";
import { getActiveDailySpecials, getTodaysMenuItems } from "@/lib/supabase/queries";
import { SpecialsBanner } from "@/components/shop/SpecialsBanner";
import { MenuBrowser } from "@/components/shop/MenuBrowser";
import { ShopHeader } from "@/components/shop/ShopHeader";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [items, specials] = await Promise.all([
    getTodaysMenuItems(),
    getActiveDailySpecials(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24">
      <ShopHeader />
      <p className="mt-4 flex items-center gap-2 rounded-2xl border border-sand-200 bg-sand-100 px-3 py-2 text-sm text-ink-700">
        <MapPin className="h-4 w-4 shrink-0 text-ocean-700" aria-hidden="true" />
        Order ahead online, then walk in to pick up. Pay cash when you collect.
      </p>
      <SpecialsBanner specials={specials} />
      <div className="mt-5">
        <h2 className="font-display text-base font-semibold text-ink-900">Today&apos;s board</h2>
        <p className="text-sm text-ink-500">What&apos;s available to order online right now.</p>
      </div>
      <MenuBrowser items={items} />
    </main>
  );
}
