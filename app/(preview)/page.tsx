import Link from "next/link";
import { FoodImage } from "@/components/storefront/FoodImage";
import { Reveal } from "@/components/storefront/Reveal";
import { resolveAsset } from "@/lib/storefront/assets";

const TILES = [
  { slot: "tile-burgers", label: "Burgers & wraps", tone: "ember", cls: "col-span-2 row-span-2 aspect-square sm:aspect-auto" },
  { slot: "tile-tacos", label: "Tacos & burritos", tone: "leaf", cls: "aspect-square" },
  { slot: "tile-ramen", label: "Ramen", tone: "char", cls: "aspect-square" },
  { slot: "tile-fries", label: "Loaded fries", tone: "cream", cls: "aspect-square" },
  { slot: "tile-drinks", label: "Matcha & Thai tea", tone: "ember", cls: "aspect-square" },
] as const;

const STEPS = [
  ["1", "Browse the menu", "See what's on today and what Choice is known for."],
  ["2", "Pick your food", "Tap to add. Your picks follow you."],
  ["3", "Send an order request", "Review it and send. No payment online."],
];

export default function HomePage() {
  const hero = resolveAsset("hero-main");
  const inset = resolveAsset("hero-inset");

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-900 text-sand-50">
        <div aria-hidden="true" className="absolute -left-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-sunset-600/25 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-6 sm:px-8 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-12 lg:gap-10 lg:py-12">
          <div className="relative lg:order-2 lg:col-span-7">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] md:aspect-[16/10] lg:aspect-square">
              <FoodImage src={hero} alt="Choice Fast Food signature dish" label="Hero · 1600×1800" tone="ember" priority sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
            <div className="absolute -bottom-5 left-4 hidden h-36 w-36 overflow-hidden rounded-3xl border-4 border-ink-900 shadow-2xl sm:block lg:-left-8 lg:h-48 lg:w-48">
              <FoodImage src={inset} alt="Choice Fast Food side dish" label="Inset · 800×800" tone="cream" sizes="200px" />
            </div>
          </div>
          <div className="lg:order-1 lg:col-span-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-400">Choice Fast Food · Chuuk</p>
            <h1 className="sf-display mt-4 text-[clamp(3rem,9vw,6.25rem)] font-extrabold leading-[0.92]">
              Food worth <span className="text-sunset-400">the stop.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-sand-300">
              Burgers, tacos, ramen, loaded fries and cold drinks, ready when you are.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/menu" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sunset-500 px-8 text-lg font-extrabold text-ink-900 shadow-lg shadow-sunset-700/30 transition hover:-translate-y-0.5 hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Explore Menu <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/visit" className="inline-flex min-h-11 items-center text-base font-semibold text-sand-50 underline decoration-sunset-400 decoration-2 underline-offset-8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Find a location
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="sf-display max-w-xl text-4xl font-extrabold leading-none text-ink-900 sm:text-6xl">What are you craving?</h2>
              <Link href="/menu" className="inline-flex min-h-11 items-center font-bold text-sunset-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-700">See the full menu →</Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TILES.map((tile, i) => (
              <Reveal key={tile.slot} delay={i * 70} className={tile.cls.includes("col-span-2") ? "col-span-2 row-span-2" : ""}>
                <Link href="/menu" className="group relative block h-full overflow-hidden rounded-3xl bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sunset-600">
                  <div className={`relative h-full min-h-40 ${tile.cls.includes("col-span-2") ? "aspect-square sm:aspect-auto sm:min-h-[26rem]" : "aspect-square"}`}>
                    <FoodImage src={resolveAsset(tile.slot)} alt={tile.label} label={`${tile.label} · 1200×1200`} tone={tile.tone} sizes="(min-width: 640px) 25vw, 50vw" />
                  </div>
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
                    <span className="sf-display text-lg font-bold leading-tight sm:text-xl">{tile.label}</span>
                    <span aria-hidden="true" className="translate-x-0 text-xl opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-100">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-700">How it works</h2>
          </Reveal>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map(([n, title, body], i) => (
              <Reveal key={n} delay={i * 90}>
                <li className="flex h-full gap-4 rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-1">
                  <span className="sf-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xl font-extrabold text-sunset-400">{n}</span>
                  <span>
                    <span className="sf-display block text-xl font-bold text-ink-900">{title}</span>
                    <span className="mt-1 block text-ink-700">{body}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink-900 text-sand-50">
        <Reveal>
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 sm:px-8 sm:py-24 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="sf-display text-4xl font-extrabold leading-none sm:text-6xl">Dine in. <span className="text-sunset-400">Or stop by.</span></h2>
              <p className="mt-4 max-w-md text-sand-300">Two Choice locations in Chuuk, one for sitting down and one for grabbing and going.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="inline-flex min-h-14 items-center rounded-full bg-sunset-500 px-8 text-lg font-extrabold text-ink-900 transition hover:-translate-y-0.5 hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore Menu</Link>
              <Link href="/visit" className="inline-flex min-h-14 items-center rounded-full border border-white/30 px-8 text-lg font-bold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">See locations</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
