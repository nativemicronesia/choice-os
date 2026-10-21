"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ClipboardList, Home, MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { startBridge, usePreviewState } from "@/lib/preview-os/store";

const TABS = [
  { href: "/os", label: "Home", Icon: Home },
  { href: "/os/orders", label: "Orders", Icon: ClipboardList },
  { href: "/os/menu", label: "Menu", Icon: UtensilsCrossed },
  { href: "/os/more", label: "More", Icon: MoreHorizontal },
] as const;

export function PreviewShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const state = usePreviewState();
  const newCount = state?.orders.filter((o) => o.status === "new").length ?? 0;

  useEffect(() => startBridge(), []);

  const isActive = (href: string) => (href === "/os" ? pathname === "/os" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-sand-50 md:flex">
      {/* iPad / desktop rail */}
      <aside className="hidden shrink-0 bg-ink-900 text-sand-100 md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:flex-col md:p-4">
        <Link href="/os" className="mb-6 block rounded-xl px-2 py-2 focus-visible:outline-2 focus-visible:outline-sunset-400" aria-label="Choice OS home">
          <span className="ox-display block text-xl font-extrabold leading-none text-white">Choice</span>
          <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-sunset-300">OS · Turay</span>
        </Link>
        <nav aria-label="Choice OS" className="flex flex-col gap-1">
          {TABS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-sunset-400",
                isActive(href) ? "bg-sunset-600 text-white" : "text-sand-200 hover:bg-white/10",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
              {href === "/os/orders" && newCount > 0 ? (
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-sunset-700">{newCount}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-sand-300/80">
          Private workspace preview. Demonstration data only.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div role="status" className="bg-ink-900 px-4 py-2 text-center text-xs font-medium text-sand-100 md:bg-sunset-100 md:text-sunset-700">
          <strong className="font-bold">Preview</strong>
          <span className="px-1.5 opacity-60">·</span>
          Demonstration data on this device. Nothing is sent to the restaurant.
        </div>

        {/* phone header */}
        <header className="flex items-center justify-between border-b border-sand-200 bg-white px-4 py-3 md:hidden">
          <Link href="/os" className="ox-display text-lg font-extrabold text-ink-900" aria-label="Choice OS home">
            Choice <span className="text-sunset-600">OS</span>
          </Link>
          <span className="text-xs font-semibold text-ink-500">Turay</span>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
          <div className="ox-enter">{children}</div>
        </main>
      </div>

      {/* phone tab bar */}
      <nav
        aria-label="Choice OS"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-sand-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {TABS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold",
              isActive(href) ? "text-sunset-600" : "text-ink-500",
            )}
          >
            <span className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {href === "/os/orders" && newCount > 0 ? (
                <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-sunset-600 px-1 text-center text-[10px] leading-4 text-white">{newCount}</span>
              ) : null}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
