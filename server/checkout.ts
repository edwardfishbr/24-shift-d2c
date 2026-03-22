import { SHIPPING_FIXED_CENTS, SHIPPING_FREE_THRESHOLD_CENTS } from "../shared/catalog";
import type { CartItem, Product } from "../shared/types";

export interface CheckoutTotals {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export function calculateTotals(items: CartItem[], productMap: Map<string, Product>): CheckoutTotals {
  const subtotalCents = items.reduce((total, item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return total;
    }
    return total + product.priceCents * item.quantity;
  }, 0);

  const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FIXED_CENTS;
  const totalCents = subtotalCents + shippingCents;

  return { subtotalCents, shippingCents, totalCents };
}

export function normalizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Carrinho inválido. Informe ao menos um item.");
  }

  return items.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { productId?: unknown }).productId !== "string" ||
      typeof (item as { quantity?: unknown }).quantity !== "number"
    ) {
      throw new Error("Formato de item inválido no carrinho.");
    }

    const quantity = Math.floor((item as { quantity: number }).quantity);

    if (quantity < 1 || quantity > 20) {
      throw new Error("Quantidade inválida. Use entre 1 e 20 unidades por item.");
    }

    return {
      productId: (item as { productId: string }).productId,
      quantity,
    } satisfies CartItem;
  });
}

export function validateUrls(successUrl: unknown, cancelUrl: unknown) {
  if (typeof successUrl !== "string" || typeof cancelUrl !== "string") {
    throw new Error("URLs de sucesso/cancelamento são obrigatórias.");
  }

  try {
    const success = new URL(successUrl);
    const cancel = new URL(cancelUrl);
    if (!["http:", "https:"].includes(success.protocol) || !["http:", "https:"].includes(cancel.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error("URLs de redirecionamento inválidas.");
  }
}
