"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePreviewCart } from "./PreviewCart";

/** Persistent path from Menu to Order once something is selected. */
export function OrderBar() {
  const { count } = usePreviewCart();
  const pathname = usePathname();
  if (count === 0 || pathname.startsWith("/order")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/order"
        className="pointer-events-auto flex min-h-14 w-full max-w-md items-center justify-between gap-4 rounded-full bg-sunset-500 px-6 font-bold text-ink-900 shadow-2xl shadow-black/30 transition hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-live="polite">{count} {count === 1 ? "item" : "items"} selected</span>
        <span>Review order <span aria-hidden="true">→</span></span>
      </Link>
    </div>
  );
}
