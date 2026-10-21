import { cn } from "@/lib/utils/cn";
import { STATUS_LABEL } from "@/lib/preview-os/logic";
import type { Dish, OrderStatus } from "@/lib/preview-os/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-sunset-100 text-sunset-700 ring-sunset-300",
  accepted: "bg-ocean-100 text-ocean-800 ring-ocean-500/40",
  preparing: "bg-sand-100 text-ink-900 ring-sand-300",
  ready: "bg-palm-100 text-palm-700 ring-palm-500/40",
  completed: "bg-sand-100 text-ink-500 ring-sand-200",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset", STATUS_STYLE[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function DemoTag({ children = "Demo" }: { children?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-ink-300 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
      {children}
    </span>
  );
}

/** Dish photo, or a labelled placeholder Turay can replace from the Menu. */
export function DishPhoto({ dish, className }: { dish: Pick<Dish, "image" | "tone" | "name">; className?: string }) {
  if (dish.image) {
    // eslint-disable-next-line @next/next/no-img-element -- local data URL, not optimizable
    return <img src={dish.image} alt={dish.name} className={cn("object-cover", className)} />;
  }
  return (
    <div className={cn("ox-ph", `ox-ph-${dish.tone}`, className)} role="img" aria-label={`${dish.name}: photo placeholder`}>
      <span className="relative text-[9px] font-bold uppercase tracking-[0.12em] opacity-80">Photo</span>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="ox-display text-lg font-bold text-ink-900">{children}</h2>
      {aside}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="ox-display text-2xl font-extrabold text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-xl text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sunset-600 px-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-sunset-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-600 disabled:opacity-50",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 text-sm font-semibold text-ink-700 transition active:scale-[0.98] hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-600 disabled:opacity-50",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-500 transition hover:bg-sand-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-600",
} as const;

export const card = "rounded-2xl border border-sand-200 bg-white shadow-card";

export function Skeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-sand-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-sand-100" />
      <div className="h-28 animate-pulse rounded-2xl bg-sand-100" />
    </div>
  );
}
