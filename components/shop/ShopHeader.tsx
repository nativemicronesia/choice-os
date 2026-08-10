import Link from "next/link";
import { getOwnerSession } from "@/lib/auth/require";

function BrandMark() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-800 font-display text-sm font-semibold text-white">
      CF
    </span>
  );
}

export async function ShopHeader() {
  const session = await getOwnerSession();

  return (
    <header className="sticky top-0 z-30 -mx-4 flex items-start justify-between gap-3 border-b border-sand-200 bg-sand-50/90 px-4 py-3 backdrop-blur">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Choice Fast Food</h1>
        <p className="text-sm text-ink-500">Weno, Chuuk · Order for pickup</p>
      </div>
      <Link
        href={session ? "/os/menu" : "/login"}
        aria-label={session ? "Open Choice OS" : "Owner sign in"}
        title={session ? "Choice OS" : "Owner sign in"}
      >
        <BrandMark />
      </Link>
    </header>
  );
}
