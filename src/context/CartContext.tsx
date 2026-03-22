import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCT_CATALOG, SHIPPING_FIXED_CENTS, SHIPPING_FREE_THRESHOLD_CENTS } from "../../shared/catalog";
import type { CartItem, Product } from "../../shared/types";

const CART_STORAGE_KEY = "shift_cart_v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  addItem: (productId: string, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const productMap = new Map(PRODUCT_CATALOG.map((product) => [product.id, product]));

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && typeof item.productId === "string" && typeof item.quantity === "number")
      .map((item) => ({ productId: item.productId, quantity: Math.max(1, Math.floor(item.quantity)) }));
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function calculateSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return total;
    }
    return total + product.priceCents * item.quantity;
  }, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getStoredCart());

  useEffect(() => {
    persistCart(items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = calculateSubtotal(items);
    const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FIXED_CENTS;
    const totalCents = subtotalCents + shippingCents;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      items,
      itemCount,
      subtotalCents,
      shippingCents,
      totalCents,
      addItem(productId, quantity = 1) {
        const qty = Math.max(1, Math.floor(quantity));
        setItems((current) => {
          const existing = current.find((item) => item.productId === productId);
          if (existing) {
            return current.map((item) =>
              item.productId === productId ? { ...item, quantity: Math.min(20, item.quantity + qty) } : item,
            );
          }
          return [...current, { productId, quantity: Math.min(20, qty) }];
        });
      },
      setItemQuantity(productId, quantity) {
        const qty = Math.floor(quantity);
        setItems((current) =>
          current
            .map((item) => (item.productId === productId ? { ...item, quantity: qty } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

export function resolveProduct(productId: string): Product | undefined {
  return productMap.get(productId);
}
