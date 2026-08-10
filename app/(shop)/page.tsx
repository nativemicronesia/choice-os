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
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-5">
      <ShopHeader />
      <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
        Order ahead online, then walk in to pick up. Pay cash when you collect.
      </p>
      <SpecialsBanner specials={specials} />
      <div className="mt-5">
        <h2 className="text-base font-semibold">Today&apos;s board</h2>
        <p className="text-sm text-neutral-500">What&apos;s available to order online right now.</p>
      </div>
      <MenuBrowser items={items} />
    </main>
  );
}
