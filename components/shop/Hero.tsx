import { ArrowDown, MapPin, Sandwich, Sparkles, Utensils } from "lucide-react";

export function Hero() {
  return (
    <section className="choice-hero relative isolate overflow-hidden bg-ocean-950 text-white">
      <div aria-hidden="true" className="choice-hero-glow" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90">
            <MapPin className="h-4 w-4 text-sunset-300" aria-hidden="true" />
            Weno, Chuuk
          </p>
          <h1 className="mt-6 max-w-xl font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-pretty sm:text-6xl lg:text-7xl">
            Good food.<br />
            <span className="text-sunset-300">Ready when you are.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
            Rice plates, grilled favorites, burgers, and cold drinks. Order ahead, pick up in Weno, and pay cash when you collect.
          </p>
          <a
            href="#menu"
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-sunset-700 px-6 py-3 font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-sunset-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Browse today&apos;s menu
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-5 text-sm text-white/60">Pickup only <span className="px-2 text-sunset-300">/</span> Cash at pickup</p>
        </div>

        <div className="choice-hero-art relative mx-auto flex aspect-[1.1/1] w-full max-w-[440px] items-center justify-center" aria-hidden="true">
          <div className="absolute inset-[8%] rounded-full border border-white/10" />
          <div className="absolute inset-[17%] rounded-full border border-white/10" />
          <div className="choice-hero-sun absolute inset-[23%] rounded-full bg-sunset-500 shadow-[0_18px_80px_rgba(226,112,26,0.25)]" />
          <div className="choice-hero-plate absolute inset-[12%] flex items-center justify-center rounded-full border-[14px] border-sand-100 bg-white shadow-2xl shadow-black/25 sm:border-[18px]">
            <div className="choice-hero-food relative flex h-[78%] w-[78%] items-center justify-center rounded-full bg-sand-100">
              <span className="absolute left-[13%] top-[22%] h-[28%] w-[28%] rounded-full bg-palm-500 shadow-inner" />
              <span className="absolute bottom-[17%] left-[20%] h-[22%] w-[48%] rounded-[45%] bg-sunset-500 shadow-inner" />
              <span className="absolute right-[15%] top-[20%] h-[38%] w-[38%] rounded-full border-[8px] border-sunset-300 bg-sunset-100 sm:border-[10px]" />
              <Utensils className="relative z-10 h-12 w-12 rotate-[-16deg] text-ocean-900/75 sm:h-16 sm:w-16" strokeWidth={1.25} />
            </div>
          </div>
          <div className="absolute bottom-[7%] right-0 flex items-center gap-3 rounded-2xl border border-white/10 bg-ocean-900 px-4 py-3 shadow-xl sm:bottom-[9%] sm:right-[2%]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sunset-100 text-sunset-700">
              <Sandwich className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-xs text-white/60">Made for your day</span>
              <span className="block font-semibold">The Choice menu</span>
            </span>
            <Sparkles className="ml-1 h-4 w-4 text-sunset-300" />
          </div>
          <span className="absolute left-[5%] top-[18%] h-2 w-2 rounded-full bg-sunset-300" />
          <span className="absolute right-[8%] top-[15%] h-3 w-3 rounded-full bg-palm-500" />
          <span className="absolute bottom-[16%] left-[12%] h-2 w-2 rounded-full bg-sunset-400" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
