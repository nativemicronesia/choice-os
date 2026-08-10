"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions: string;
  imageUrl: string | null;
};

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "specialInstructions">, qty?: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, qty: number) => void;
  setInstructions: (menuItemId: string, text: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "choice-os-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hydrate from localStorage after mount only, to avoid an SSR/CSR mismatch
  // (server always renders an empty cart). One-time read of an external
  // source on mount, not a derived-state loop — safe to disable the rule here.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupt/blocked storage — start with an empty cart
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private browsing, quota) — cart just won't persist
    }
  }, [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );

  function addItem(item: Omit<CartItem, "quantity" | "specialInstructions">, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { ...item, quantity: qty, specialInstructions: "" }];
    });
    setIsDrawerOpen(true);
  }

  function removeItem(menuItemId: string) {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  function setQuantity(menuItemId: string, qty: number) {
    if (qty <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i)));
  }

  function setInstructions(menuItemId: string, text: string) {
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, specialInstructions: text } : i)),
    );
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        isDrawerOpen,
        addItem,
        removeItem,
        setQuantity,
        setInstructions,
        clearCart,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
