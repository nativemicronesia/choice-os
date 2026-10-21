"use client";

import { useSyncExternalStore } from "react";
import { addSampleOrder, ingestStorefront, menuFeed, removeDish, setOrderStatus, toggleDish, upsertDish } from "./logic";
import { seedState } from "./seed";
import type { Dish, OrderStatus, PreviewState, StorefrontRecord } from "./types";

// Browser-local store. Choice OS and the public storefront are one Next app on
// one origin, but the storefront posts to the server, so localStorage is used
// only for OS-owned data (menu edits, order progress) and the bridge below
// carries data across: storefront orders in, menu feed out.

const KEY = "choice-os-preview:v1";
const listeners = new Set<() => void>();
let state: PreviewState | null = null;
let persistFailed = false;

function isState(v: unknown): v is PreviewState {
  const s = v as PreviewState | null;
  return !!s && s.v === 1 && Array.isArray(s.dishes) && Array.isArray(s.orders) && Array.isArray(s.seenRefs);
}

function load(): PreviewState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isState(parsed)) return parsed;
    }
  } catch {
    // Storage blocked or corrupt: fall through to a fresh demo.
  }
  return seedState();
}

function persist(next: PreviewState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    persistFailed = false;
  } catch {
    persistFailed = true; // e.g. private mode or quota: keep working in memory
  }
}

function ensure(): PreviewState | null {
  if (typeof window === "undefined") return null;
  if (!state) {
    state = load();
    persist(state);
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      state = load();
      emit();
    });
  }
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

let publishTimer: ReturnType<typeof setTimeout> | undefined;

function commit(next: PreviewState) {
  const dishesChanged = state?.dishes !== next.dishes;
  state = next;
  persist(next);
  emit();
  if (dishesChanged) {
    clearTimeout(publishTimer);
    publishTimer = setTimeout(publishMenu, 400);
  }
}

function update(fn: (s: PreviewState) => PreviewState) {
  const current = ensure();
  if (current) commit(fn(current));
}

export function usePreviewState(): PreviewState | null {
  return useSyncExternalStore(
    (cb) => {
      ensure();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    ensure,
    () => null,
  );
}

export const actions = {
  setStatus: (id: string, to: OrderStatus) => update((s) => setOrderStatus(s, id, to)),
  saveDish: (dish: Dish) => update((s) => upsertDish(s, dish)),
  removeDish: (id: string) => update((s) => removeDish(s, id)),
  toggleDish: (id: string) => update((s) => toggleDish(s, id)),
  addSampleOrder: () => update((s) => addSampleOrder(s)),
  reset: () => commit(seedState()),
};

export const storageIsPersistent = () => !persistFailed;

// ---- Bridge to the rest of the app ------------------------------------------------

export type BridgeStatus = {
  storefront: "idle" | "connected" | "unavailable";
  checkedAt: string | null;
  menuPublishedAt: string | null;
};

let bridge: BridgeStatus = { storefront: "idle", checkedAt: null, menuPublishedAt: null };
const bridgeListeners = new Set<() => void>();
const setBridge = (patch: Partial<BridgeStatus>) => {
  bridge = { ...bridge, ...patch };
  bridgeListeners.forEach((l) => l());
};

export function useBridgeStatus(): BridgeStatus {
  return useSyncExternalStore(
    (cb) => {
      bridgeListeners.add(cb);
      return () => bridgeListeners.delete(cb);
    },
    () => bridge,
    () => bridge,
  );
}

export async function pullStorefrontOrders() {
  try {
    const res = await fetch("/api/os-preview/storefront-orders", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as { orders?: StorefrontRecord[] };
    const records = Array.isArray(body.orders) ? body.orders : [];
    update((s) => ingestStorefront(s, records));
    setBridge({ storefront: "connected", checkedAt: new Date().toISOString() });
  } catch {
    setBridge({ storefront: "unavailable", checkedAt: new Date().toISOString() });
  }
}

export async function publishMenu() {
  const current = ensure();
  if (!current) return;
  try {
    const res = await fetch("/api/os-preview/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishes: menuFeed(current) }),
    });
    if (res.ok) setBridge({ menuPublishedAt: new Date().toISOString() });
  } catch {
    // Best effort: the OS keeps working from its own store.
  }
}

/** Start polling once; returns a stop function. */
export function startBridge(): () => void {
  ensure();
  void pullStorefrontOrders();
  void publishMenu();
  const timer = setInterval(() => void pullStorefrontOrders(), 6000);
  const onVisible = () => {
    if (document.visibilityState === "visible") void pullStorefrontOrders();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
