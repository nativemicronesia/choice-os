import Link from "next/link";

export type OsTab = "menu" | "kitchen" | "day";

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c.9-3.1 3.3-4.75 6.5-4.75s5.6 1.65 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Choice OS</p>
          <h1 className="text-lg font-bold leading-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-neutral-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700"
          >
            Storefront
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700"
              aria-label="Sign out"
              title="Sign out"
            >
              <AccountIcon />
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-neutral-200 md:w-48 md:shrink-0 md:border-b-0 md:border-r">
          <nav className="flex gap-1 p-3 md:flex-col" aria-label="Owner OS">
            <Link
              href="/os/menu"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "menu" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
              }`}
              aria-current={active === "menu" ? "page" : undefined}
            >
              Today&apos;s menu
            </Link>
            <Link
              href="/kds"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "kitchen"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
              aria-current={active === "kitchen" ? "page" : undefined}
            >
              Kitchen
            </Link>
            <Link
              href="/os/day"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active === "day" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
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
