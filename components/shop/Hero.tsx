import { Utensils } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean-800 via-ocean-700 to-sunset-600 px-4 py-14 text-center text-white sm:py-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 select-none font-display text-[10rem] font-semibold text-white/10 sm:text-[14rem]"
      >
        CF
      </span>
      <div className="relative mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Weno, Chuuk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Choice Fast Food</h1>
        <p className="mx-auto mt-3 max-w-md text-white/80">
          Local plates, burgers, and cold drinks — order ahead online, then walk in and pick up. Pay
          cash when you collect.
        </p>
        <a
          href="#menu"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ocean-800 shadow-lg"
        >
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Order Now
        </a>
      </div>
    </section>
  );
}
