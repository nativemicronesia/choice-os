"use client";

import { useEffect, useRef, useState } from "react";
import {
  getOwnerActiveTickets,
  getOwnerKitchenRealtimeTopic,
  getOwnerTicket,
} from "@/lib/actions/private-orders";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
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
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(() => new Set());
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/chime.wav");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let refreshInProgress = false;
    let knownIds = new Set<string>();
    let initialized = false;
    const refresh = async () => {
      if (cancelled || refreshInProgress) return;
      refreshInProgress = true;
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
        setTicketsLoaded(true);
        setRefreshError(null);
      } catch {
        if (cancelled) return;
        setTicketsLoaded(true);
        setRefreshError("Kitchen tickets could not refresh. Showing the last loaded tickets.");
      } finally {
        refreshInProgress = false;
      }
    };

    void refresh();
    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: RealtimeChannel | null = null;
    if (process.env.NEXT_PUBLIC_CHOICE_DATA_MODE !== "fixtures") {
      void getOwnerKitchenRealtimeTopic().then((topic) => {
        if (cancelled) return;
        supabase = createClient();
        channel = supabase
          .channel(topic, { config: { private: true } })
          .on("broadcast", { event: "choice_order_changed" }, () => void refresh())
          .subscribe((status) => {
            if (status === "SUBSCRIBED") void refresh();
          });
      }).catch(() => {
        // The periodic owner-checked refresh remains available if Realtime is down.
      });
    }
    const interval = window.setInterval(
      refresh,
      process.env.NEXT_PUBLIC_CHOICE_DATA_MODE === "fixtures" ? 2_000 : 30_000,
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, []);

  async function handleAdvance(orderId: string, current: OrderStatus, next: OrderStatus) {
    if (updatingOrderIds.has(orderId)) return;
    setUpdatingOrderIds((prev) => new Set(prev).add(orderId));
    try {
      const result = await updateOrderStatus(orderId, current, next);
      setUpdateError(result.success ? null : result.error);
      // Refresh immediately in fixture mode and reconcile races between tablets.
      const fresh = await getOwnerTicket(orderId);
      setTickets((prev) => {
        if (!fresh || fresh.status === "completed" || fresh.status === "cancelled") return removeKey(prev, orderId);
        const { order_items, ...order } = fresh;
        return { ...prev, [orderId]: { order, items: order_items } };
      });
    } catch {
      setUpdateError("Ticket update failed. Try again.");
    } finally {
      setUpdatingOrderIds((prev) => {
        const nextIds = new Set(prev);
        nextIds.delete(orderId);
        return nextIds;
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
      {updateError ? <p role="alert" className="mb-3 text-sm text-red-700">{updateError}</p> : null}
      {refreshError ? <p role="status" className="mb-3 text-sm text-amber-800">{refreshError}</p> : null}
      {!ticketsLoaded ? <p role="status" className="mb-3 text-sm text-neutral-500">Loading kitchen tickets…</p> : null}
      <TicketBoard tickets={Object.values(tickets)} updatingOrderIds={updatingOrderIds} onAdvance={handleAdvance} />
    </OsShell>
  );
}
