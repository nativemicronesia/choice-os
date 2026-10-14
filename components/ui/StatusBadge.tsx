import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/lib/types/database";

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  cooking: "Cooking",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  cooking: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-neutral-200 text-neutral-600",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
