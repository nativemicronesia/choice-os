import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink-900 text-sand-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="sf-display text-2xl font-extrabold text-sand-50">Choice Fast Food</p>
          <p className="mt-1 text-sm">Chuuk, Federated States of Micronesia</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-semibold">
          {[["Home", "/"], ["Menu", "/menu"], ["Order", "/order"], ["Visit", "/visit"]].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-400">{label}</Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-white/10 px-5 py-4 text-center text-xs text-sand-300/80">
        Sales preview prepared by NWA for Turay · demo content and placeholder images · no real orders are placed
      </p>
    </footer>
  );
}
