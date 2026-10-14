"use client";

import { useEffect, useRef, useState } from "react";
import { getOwnerActiveTickets, getOwnerTicket } from "@/lib/actions/private-orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { TicketBoard, type Ticket } from "@/components/kds/TicketBoard";
import { SoundUnlockOverlay } from "@/components/kds/SoundUnlockOverlay";
import { OsShell } from "@/components/os/OsShell";
import type { OrderStatus } from "@/lib/types/database";

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
    let knownIds = new Set<string>();
    let initialized = false;
    const refresh = async () => {
      try {
        const orders = await getOwnerActiveTickets();
        if (cancelled) return;
        const next: Record<string, Ticket> = {};
        for (const { order_items, ...order } of orders) {
          next[order.id] = { order, items: order_items };
        }
        if (initialized && orders.some(({ id }) => !knownIds.has(id))) {
          audioRef.current?.play().catch(() => {});
        }
        knownIds = new Set(orders.map(({ id }) => id));
        initialized = true;
        setTickets(next);
      } catch {
        // Retain existing tickets when the local connection briefly drops.
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function handleAdvance(orderId: string, current: OrderStatus, next: OrderStatus) {
    const result = await updateOrderStatus(orderId, current, next);
    if (!result.success) {
      // Lost a race with another tablet — soft-refresh just this ticket.
      const fresh = await getOwnerTicket(orderId);
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
