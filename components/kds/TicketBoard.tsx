import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";
import { TicketCard } from "./TicketCard";

export type Ticket = { order: Order; items: OrderItem[] };

const STAGES: { status: Exclude<OrderStatus, "completed">; label: string }[] = [
  { status: "pending", label: "New tickets" },
  { status: "cooking", label: "Preparing" },
  { status: "ready", label: "Ready for pickup" },
];

export function TicketBoard({
  tickets,
  onAdvance,
  updatingOrderIds,
}: {
  tickets: Ticket[];
  onAdvance: (orderId: string, current: OrderStatus, next: OrderStatus) => void;
  updatingOrderIds: ReadonlySet<string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STAGES.map((stage) => {
        const stageTickets = tickets
          .filter((ticket) => ticket.order.status === stage.status)
          .sort((a, b) => new Date(a.order.created_at).getTime() - new Date(b.order.created_at).getTime());
        return (
          <section key={stage.status} aria-labelledby={`stage-${stage.status}`} className="min-w-0">
            <header className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-2">
              <h2 id={`stage-${stage.status}`} className="font-semibold text-neutral-800">{stage.label}</h2>
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                {stageTickets.length}
              </span>
            </header>
            <div className="flex flex-col gap-3">
              {stageTickets.length ? stageTickets.map((ticket) => (
                <TicketCard
                  key={ticket.order.id}
                  order={ticket.order}
                  items={ticket.items}
                  isUpdating={updatingOrderIds.has(ticket.order.id)}
                  onAdvance={(next) => onAdvance(ticket.order.id, ticket.order.status, next)}
                />
              )) : (
                <p className="rounded-xl border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-400">
                  No {stage.label.toLowerCase()}.
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
