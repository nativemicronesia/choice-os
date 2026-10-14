import Link from "next/link";
import { LogOut } from "lucide-react";
import { DataModeNotice } from "@/components/shared/DataModeNotice";

export type OsTab = "menu" | "kitchen" | "day";

export function OsShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active: OsTab;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col bg-sand-50">
      <DataModeNotice />
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-sand-200 bg-sand-50/90 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Choice OS</p>
          <h1 className="text-lg font-bold leading-tight text-ink-900">{title}</h1>
          {subtitle ? <p className="text-sm text-ink-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-sand-300 px-3 text-sm font-medium text-ink-700"
          >
            Storefront
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 text-ink-700"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-sand-200 md:w-48 md:shrink-0 md:border-b-0 md:border-r">
          <nav className="flex gap-1 p-3 md:flex-col" aria-label="Owner OS">
            <Link
              href="/os/menu"
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "menu" ? "bg-ocean-700 text-white" : "text-ink-700 hover:bg-sand-100"
              }`}
              aria-current={active === "menu" ? "page" : undefined}
            >
              Today&apos;s menu
            </Link>
            <Link
              href="/kds"
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "kitchen" ? "bg-ocean-700 text-white" : "text-ink-700 hover:bg-sand-100"
              }`}
              aria-current={active === "kitchen" ? "page" : undefined}
            >
              Kitchen
            </Link>
            <Link
              href="/os/day"
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "day" ? "bg-ocean-700 text-white" : "text-ink-700 hover:bg-sand-100"
              }`}
              aria-current={active === "day" ? "page" : undefined}
            >
              Day
            </Link>
          </nav>
        </aside>

        <section className="flex-1 px-4 py-5 pb-10">{children}</section>
      </div>
    </div>
  );
}
