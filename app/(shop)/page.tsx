import { Banknote, MapPin } from "lucide-react";
import { getActiveDailySpecials, getTodaysMenuItems } from "@/lib/supabase/queries";
import { SpecialsBanner } from "@/components/shop/SpecialsBanner";
import { MenuBrowser } from "@/components/shop/MenuBrowser";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Hero } from "@/components/shop/Hero";
import { DataModeNotice } from "@/components/shared/DataModeNotice";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [items, specials] = await Promise.all([
    getTodaysMenuItems(),
    getActiveDailySpecials(),
  ]);

  return (
    <>
      <DataModeNotice />
      <ShopHeader />
      <Hero />
      <main className="bg-sand-50">
        <section className="mx-auto grid max-w-6xl gap-3 px-5 py-5 sm:grid-cols-2 sm:px-8 sm:py-6">
          <p className="flex min-h-14 items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-700">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-ocean-800">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <span><strong className="block text-ink-900">Pickup in Weno</strong><span className="text-ink-500">Order ahead, then collect at the shop.</span></span>
          </p>
          <p className="flex min-h-14 items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-700">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunset-100 text-sunset-700">
              <Banknote className="h-4 w-4" aria-hidden="true" />
            </span>
            <span><strong className="block text-ink-900">Pay when you pick up</strong><span className="text-ink-500">Cash payment at the counter.</span></span>
          </p>
        </section>
        <div id="specials" className="scroll-mt-20">
          <SpecialsBanner specials={specials} />
        </div>
        <section id="menu" tabIndex={-1} className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-28 pt-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ocean-700 sm:px-8 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sunset-700">Made fresh for today</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Today&apos;s menu</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500 sm:text-base">Choose a favorite, set your quantity, and add any notes for the kitchen.</p>
            </div>
            <p className="hidden pb-1 text-sm text-ink-500 sm:block">Menu availability can change through the day.</p>
          </div>
          <MenuBrowser items={items} />
        </section>
      </main>
    </>
  );
}
