"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveOrdersWithItems, getOrderWithItems } from "@/lib/supabase/queries";
import { updateOrderStatus } from "@/lib/actions/orders";
import { TicketBoard, type Ticket } from "@/components/kds/TicketBoard";
import { SoundUnlockOverlay } from "@/components/kds/SoundUnlockOverlay";
import { OsShell } from "@/components/os/OsShell";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/database";

function removeKey(record: Record<string, Ticket>, key: string): Record<string, Ticket> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

export default function KdsPage() {
  const [tickets, setTickets] = useState<Record<string, Ticket>>({});
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/chime.wav");
  }, []);

  useEffect(() => {
    let cancelled = false;

    getActiveOrdersWithItems().then((orders) => {
      if (cancelled) return;
      const initial: Record<string, Ticket> = {};
      for (const { order_items, ...order } of orders) {
        initial[order.id] = { order, items: order_items };
      }
      setTickets(initial);
    });

    const supabase = createClient();
    const channel = supabase
      .channel("kds-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            if (newOrder.status !== "pending") return;
            const { data: items } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", newOrder.id);
            setTickets((prev) => ({
              ...prev,
              [newOrder.id]: {
                order: { ...newOrder, total: Number(newOrder.total) },
                items: (items ?? []) as OrderItem[],
              },
            }));
            audioRef.current?.play().catch(() => {});
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setTickets((prev) => {
              if (updated.status === "completed") {
                return removeKey(prev, updated.id);
              }
              const existing = prev[updated.id];
              if (!existing) return prev;
              return {
                ...prev,
                [updated.id]: {
                  ...existing,
                  order: { ...existing.order, status: updated.status, updated_at: updated.updated_at },
                },
              };
            });
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleAdvance(orderId: string, current: OrderStatus, next: OrderStatus) {
    const result = await updateOrderStatus(orderId, current, next);
    if (!result.success) {
      // Lost a race with another tablet — soft-refresh just this ticket.
      const fresh = await getOrderWithItems(orderId);
      setTickets((prev) => {
        if (!fresh || fresh.status === "completed") return removeKey(prev, orderId);
        const { order_items, ...order } = fresh;
        return { ...prev, [orderId]: { order, items: order_items } };
      });
    }
  }

  function unlockSound() {
    const audio = audioRef.current;
    if (audio) {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    }
    setSoundUnlocked(true);
  }

  return (
    <OsShell title="Kitchen" subtitle="Advance tickets as food moves" active="kitchen">
      {!soundUnlocked && <SoundUnlockOverlay onUnlock={unlockSound} />}
      <TicketBoard tickets={Object.values(tickets)} onAdvance={handleAdvance} />
    </OsShell>
  );
}
