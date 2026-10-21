"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePreviewCart } from "./PreviewCart";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/visit", label: "Visit" },
];

export function SiteHeader({ logoSrc }: { logoSrc: string | null }) {
  const pathname = usePathname();
  const { count } = usePreviewCart();

  return (
    <header className="sticky top-0 z-40 bg-ink-900 text-sand-50">
      <a href="#main" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:not-sr-only focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-ink-900">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 pt-3 sm:h-[72px] sm:px-8 sm:pt-0">
        <Link href="/" className="sf-display flex min-h-11 items-center gap-2 rounded-lg text-xl font-extrabold leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sunset-400" aria-label="Choice Fast Food, home">
          {logoSrc ? (
            <Image src={logoSrc} alt="Choice Fast Food" width={160} height={40} className="h-9 w-auto" priority />
          ) : (
            <>
              Choice
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-300">Fast Food</span>
            </>
          )}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => <NavLink key={link.href} {...link} active={isActive(pathname, link.href)} count={link.href === "/order" ? count : 0} />)}
        </nav>
        <Link href="/order" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sunset-500 px-5 text-sm font-bold text-ink-900 transition hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden">
          Your order{count > 0 && <span className="rounded-full bg-ink-900 px-2 py-0.5 text-xs text-sand-50 tabular-nums">{count}</span>}
        </Link>
      </div>
      <nav aria-label="Main" className="mx-auto grid max-w-7xl grid-cols-4 px-3 sm:hidden">
        {LINKS.map((link) => <NavLink key={link.href} {...link} active={isActive(pathname, link.href)} count={0} mobile />)}
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({ href, label, active, count, mobile = false }: { href: string; label: string; active: boolean; count: number; mobile?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sunset-400 ${mobile ? "" : "rounded-full px-4 hover:bg-white/10"} ${active ? "text-white" : "text-sand-300 hover:text-white"}`}
    >
      {label}
      {count > 0 && <span className="rounded-full bg-sunset-500 px-1.5 text-[11px] font-bold leading-5 text-ink-900 tabular-nums">{count}</span>}
      <span aria-hidden="true" className={`absolute bottom-0 h-0.5 rounded-full bg-sunset-400 transition-all ${active ? "w-8" : "w-0"}`} />
    </Link>
  );
}
