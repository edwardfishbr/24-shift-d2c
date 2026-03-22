import { PRODUCT_CATALOG } from "../../shared/catalog";
import type { CartItem, CheckoutResponse, OrderSummary, Product } from "../../shared/types";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error((payload as { error?: string }).error ?? "Erro na API");
  }
  return payload;
}

export async function fetchProductsFromApi(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    const payload = await parseJson<{ products: Product[] }>(response);
    if (!payload.products?.length) {
      return PRODUCT_CATALOG;
    }
    return payload.products;
  } catch (error) {
    console.warn("Fallback to local catalog:", error);
    return PRODUCT_CATALOG;
  }
}

export async function createCheckoutSession(params: {
  items: CartItem[];
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/api/checkout/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return parseJson<CheckoutResponse>(response);
}

export async function fetchOrderSummary(sessionId: string): Promise<OrderSummary> {
  const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(sessionId)}`);
  const payload = await parseJson<{ order: OrderSummary }>(response);
  return payload.order;
}

export async function submitContactForm(payload: {
  name: string;
  email: string;
  cep: string;
  message: string;
  source: string;
}) {
  const response = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<{ ok: boolean }>(response);
}
