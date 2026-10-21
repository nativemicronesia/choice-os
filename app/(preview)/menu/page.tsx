import type { Metadata } from "next";
import Link from "next/link";
import { MenuCard } from "@/components/storefront/MenuCard";
import { Reveal } from "@/components/storefront/Reveal";
import { MENU } from "@/lib/storefront/catalog";
import { resolveAsset } from "@/lib/storefront/assets";

export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  const todays = MENU.filter((item) => item.group === "todays");
  const featured = MENU.filter((item) => item.group === "featured");

  return (
    <div className="bg-sand-50 pb-32">
      <section className="bg-ink-900 text-sand-50">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-400">The Menu</p>
          <h1 className="sf-display mt-3 text-5xl font-extrabold leading-none sm:text-7xl">Pick your <span className="text-sunset-400">craving.</span></h1>
          <p className="mt-4 max-w-xl text-sand-300">Tap to add what you want, then send an order request. No account, no online payment.</p>
          <nav aria-label="Menu sections" className="mt-8 flex flex-wrap gap-3">
            <a href="#todays" className="inline-flex min-h-11 items-center rounded-full bg-sunset-500 px-6 font-bold text-ink-900 transition hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Today&apos;s Menu</a>
            <a href="#featured" className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 font-bold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Featured Specials</a>
          </nav>
        </div>
      </section>

      <section id="todays" className="mx-auto max-w-7xl scroll-mt-32 px-5 pt-14 sm:px-8 sm:pt-20">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-palm-600">Changes daily</p>
          <h2 className="sf-display mt-2 text-4xl font-extrabold text-ink-900 sm:text-5xl">Today&apos;s Menu</h2>
          <p className="mt-2 max-w-2xl text-ink-700">What Choice is serving today. Offerings and plate choices can change from day to day.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {todays.map((item, i) => (
            <Reveal key={item.id} delay={(i % 2) * 80}><MenuCard item={item} src={resolveAsset(item.slot)} variant="row" /></Reveal>
          ))}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl scroll-mt-32 px-5 pt-16 sm:px-8 sm:pt-24">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-700">Always worth ordering</p>
          <h2 className="sf-display mt-2 text-4xl font-extrabold text-ink-900 sm:text-5xl">Featured Specials</h2>
          <p className="mt-2 max-w-2xl text-ink-700">The dishes Choice regularly puts front and center.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={i * 70}><MenuCard item={item} src={resolveAsset(item.slot)} variant="feature" /></Reveal>
          ))}
        </div>
      </section>

      <p className="mx-auto mt-14 max-w-7xl px-5 text-sm text-ink-500 sm:px-8">
        Preview note: dishes, descriptions, availability and the split between Today&apos;s Menu and Featured Specials are demo content until confirmed by Turay. Prices will appear once verified.{" "}
        <Link href="/order" className="font-semibold text-sunset-700 underline underline-offset-4">Go to your order</Link>
      </p>
    </div>
  );
}
