import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";
import { TicketCard } from "./TicketCard";

export type Ticket = { order: Order; items: OrderItem[] };

export function TicketBoard({
  tickets,
  onAdvance,
}: {
  tickets: Ticket[];
  onAdvance: (orderId: string, current: OrderStatus, next: OrderStatus) => void;
}) {
  const sorted = [...tickets].sort(
    (a, b) => new Date(a.order.created_at).getTime() - new Date(b.order.created_at).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="mt-12 text-center text-neutral-400">No active tickets.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((ticket) => (
        <TicketCard
          key={ticket.order.id}
          order={ticket.order}
          items={ticket.items}
          onAdvance={(next) => onAdvance(ticket.order.id, ticket.order.status, next)}
        />
      ))}
    </div>
  );
}
