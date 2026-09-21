import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem } from '../lib/types';

export interface CartLine {
  item: MenuItem;
  qty: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  add: (item: MenuItem, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  qtyOf: (id: number) => number;
}

const CartContext = createContext<CartValue | null>(null);

const STORAGE_KEY = 'sfp_cart_v1';

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l.item && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => load());
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const value = useMemo<CartValue>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.qty * Number(l.item.price), 0);
    const qtyOf = (id: number) => lines.find((l) => l.item.id === id)?.qty ?? 0;
    return {
      lines,
      count,
      total,
      isOpen,
      setOpen,
      add: (item, qty = 1) =>
        setLines((prev) => {
          const found = prev.find((l) => l.item.id === item.id);
          if (found)
            return prev.map((l) => (l.item.id === item.id ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
          return [...prev, { item, qty: Math.min(20, qty) }];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.item.id !== id)
            : prev.map((l) => (l.item.id === id ? { ...l, qty: Math.min(20, qty) } : l))
        ),
      clear: () => setLines([]),
      qtyOf
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
