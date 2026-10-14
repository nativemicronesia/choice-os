"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  itemId: string;
  itemType: "menu" | "special";
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
  removeItem: (itemId: string, itemType: CartItem["itemType"]) => void;
  setQuantity: (itemId: string, itemType: CartItem["itemType"], qty: number) => void;
  setInstructions: (itemId: string, itemType: CartItem["itemType"], text: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "choice-os-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // Hydrate from localStorage after mount only, to avoid an SSR/CSR mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Array<CartItem | (Omit<CartItem, "itemId" | "itemType"> & { menuItemId: string })>;
        // One-time hydration from an external source, not derived state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(saved.map((item) => ({
          ...item,
          itemId: "itemId" in item ? item.itemId : item.menuItemId,
          itemType: "itemType" in item ? item.itemType : "menu",
        })));
      }
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
      const existing = prev.find((i) => i.itemId === item.itemId && i.itemType === item.itemType);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.itemId && i.itemType === item.itemType
            ? { ...i, quantity: Math.min(20, i.quantity + qty) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(20, qty), specialInstructions: "" }];
    });
  }

  function removeItem(itemId: string, itemType: CartItem["itemType"]) {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId || i.itemType !== itemType));
  }

  function setQuantity(itemId: string, itemType: CartItem["itemType"], qty: number) {
    if (qty <= 0) {
      removeItem(itemId, itemType);
      return;
    }
    setItems((prev) => prev.map((i) => (
      i.itemId === itemId && i.itemType === itemType ? { ...i, quantity: Math.min(20, qty) } : i
    )));
  }

  function setInstructions(itemId: string, itemType: CartItem["itemType"], text: string) {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId && i.itemType === itemType ? { ...i, specialInstructions: text } : i)),
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
        openDrawer,
        closeDrawer,
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
