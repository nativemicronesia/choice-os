import Link from "next/link";
import { getOwnerSession } from "@/lib/auth/require";

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

export async function ShopHeader() {
  const session = await getOwnerSession();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <span className="font-display text-lg font-semibold text-ink-900">Choice Fast Food</span>
        <Link
          href={session ? "/os/menu" : "/login"}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-800"
          aria-label={session ? "Open Choice OS" : "Owner sign in"}
          title={session ? "Choice OS" : "Owner sign in"}
        >
          <AccountIcon />
        </Link>
      </div>
    </header>
  );
}
