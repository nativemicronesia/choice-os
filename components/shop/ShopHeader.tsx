import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { getOwnerSession } from "@/lib/auth/require";

export async function ShopHeader({ skipHref = "/#menu", skipLabel = "Skip to menu" }: { skipHref?: string; skipLabel?: string }) {
  const session = await getOwnerSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ocean-950 text-white shadow-sm shadow-black/10">
      <a href={skipHref} className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:not-sr-only focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-ocean-900 focus:shadow-lg">
        {skipLabel}
      </a>
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="Choice Fast Food home">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunset-700 text-white transition-colors group-hover:bg-sunset-600">
            <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold leading-tight">Choice</span>
            <span className="block text-[11px] leading-tight text-white/60">Fast Food &amp; Snack-bar</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-4 sm:gap-7">
          <Link href="/#specials" className="hidden min-h-11 items-center text-sm font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex">Specials</Link>
          <Link href="/#menu" className="inline-flex min-h-11 items-center text-sm font-semibold text-white transition-colors hover:text-sunset-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Menu</Link>
          <Link
            href={session ? "/os/menu" : "/login"}
            className="inline-flex min-h-10 items-center rounded-full border border-white/25 px-4 text-xs font-semibold text-white/80 transition-colors hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm"
          >
            {session ? "Owner OS" : "Staff"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
