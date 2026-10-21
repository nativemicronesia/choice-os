import type { Metadata } from "next";
import Link from "next/link";
import { FoodImage } from "@/components/storefront/FoodImage";
import { Reveal } from "@/components/storefront/Reveal";
import { LOCATIONS } from "@/lib/storefront/locations";
import { resolveAsset } from "@/lib/storefront/assets";

export const metadata: Metadata = { title: "Visit" };

const TBC = <span className="rounded-md bg-sand-100 px-2 py-0.5 text-sm font-semibold text-ink-500">To be confirmed</span>;

export default function VisitPage() {
  return (
    <div className="bg-sand-50">
      <section className="relative isolate overflow-hidden bg-ink-900 text-sand-50">
        <div className="absolute inset-0 -z-10 opacity-40">
          <FoodImage src={resolveAsset("visit-hero")} alt="" label="Visit banner · 2000×900" tone="char" sizes="100vw" zoom={false} quiet />
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-400">Visit</p>
          <h1 className="sf-display mt-3 text-5xl font-extrabold leading-none sm:text-7xl">Two ways to <span className="text-sunset-400">Choice.</span></h1>
          <p className="mt-4 max-w-xl text-sand-300">Sit down at the restaurant, or stop by the shop when you are on the move.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2">
        {LOCATIONS.map((place, i) => (
          <Reveal key={place.id} delay={i * 100}>
            <article className="group h-full overflow-hidden rounded-3xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink-900/15">
              <div className="relative aspect-[16/10] overflow-hidden">
                <FoodImage src={resolveAsset(place.slot)} alt={`${place.name} exterior`} label={`${place.kind} photo · 1600×1000`} tone={place.id === "dine-in" ? "ember" : "leaf"} sizes="(min-width: 1024px) 50vw, 100vw" />
                <span className="absolute left-4 top-4 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-sunset-400">{place.kind}</span>
              </div>
              <div className="p-6 sm:p-8">
                <h2 className="sf-display text-3xl font-extrabold text-ink-900">{place.name}</h2>
                <p className="mt-1 text-ink-700">{place.summary}</p>
                <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-[7rem_1fr]">
                  {([["Address", place.address], ["Directions", place.directions], ["Phone", place.phone], ["Hours", place.hours]] as const).map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-sm font-bold uppercase tracking-wider text-ink-500">{label}</dt>
                      <dd className="text-ink-900">{value ?? TBC}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <section className="bg-ink-900 text-sand-50">
        <Reveal>
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-5 py-14 sm:px-8 sm:py-20 md:flex-row md:items-center md:justify-between">
            <h2 className="sf-display text-4xl font-extrabold leading-none sm:text-5xl">Hungry already? <span className="text-sunset-400">Start your order.</span></h2>
            <Link href="/menu" className="inline-flex min-h-14 items-center rounded-full bg-sunset-500 px-8 text-lg font-extrabold text-ink-900 transition hover:-translate-y-0.5 hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore Menu →</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
