import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";

type WishlistCtx = {
  ids: Set<string>;
  items: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);
const storageKey = "blossom_wishlist_items";

function loadWishlistItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as Product[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(loadWishlistItems);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const toggle = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  };

  const ids = new Set(items.map((p) => p.id));
  const has = (id: string) => ids.has(id);

  return (
    <Ctx.Provider value={{ ids, items, toggle, has, count: items.length }}>{children}</Ctx.Provider>
  );
}

export const useWishlist = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
};
