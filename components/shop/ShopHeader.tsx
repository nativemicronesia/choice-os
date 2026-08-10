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
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Choice Fast Food</h1>
        <p className="text-sm text-neutral-500">Weno, Chuuk · Order for pickup</p>
      </div>
      <Link
        href={session ? "/os/menu" : "/login"}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
        aria-label={session ? "Open Choice OS" : "Owner sign in"}
        title={session ? "Choice OS" : "Owner sign in"}
      >
        <AccountIcon />
      </Link>
    </header>
  );
}
