"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_QTY, MENU_BY_ID } from "@/lib/storefront/catalog";

type Quantities = Record<string, number>;

type CartValue = {
  quantities: Quantities;
  count: number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const KEY = "choice-preview-cart";

export function PreviewCartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Quantities>({});

  // Restore after mount to avoid an SSR/CSR mismatch; unknown ids are dropped.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Quantities;
      const clean: Quantities = {};
      for (const [id, qty] of Object.entries(saved)) {
        if (MENU_BY_ID.has(id) && Number.isInteger(qty) && qty > 0) clean[id] = Math.min(MAX_QTY, qty);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantities(clean);
    } catch {
      // storage blocked or corrupt: start empty
    }
  }, []);

  const persist = useCallback((next: Quantities) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // not persisted; cart still works for this visit
    }
    return next;
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(MAX_QTY, qty);
      return persist(next);
    });
  }, [persist]);

  const add = useCallback((id: string) => {
    setQuantities((prev) => persist({ ...prev, [id]: Math.min(MAX_QTY, (prev[id] ?? 0) + 1) }));
  }, [persist]);

  const clear = useCallback(() => setQuantities(persist({})), [persist]);

  const value = useMemo<CartValue>(() => ({
    quantities,
    count: Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    add,
    setQty,
    clear,
  }), [quantities, add, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function usePreviewCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("usePreviewCart must be used within PreviewCartProvider");
  return ctx;
}
