export type ShiftLine = "CORE" | "START" | "FLOW" | "END" | "COMBO";

export interface Product {
  id: string;
  slug: string;
  line: ShiftLine;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  currency: "BRL";
  active: boolean;
  provisional: boolean;
  image: string;
  stripePriceId?: string | null;
}

export interface Price {
  id?: string;
  productId: string;
  amountCents: number;
  currency: "BRL";
  active: boolean;
  stripePriceId?: string | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CartItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: "BRL";
}

export interface OrderItemSummary {
  productId: string;
  slug: string;
  line: ShiftLine;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderSummary {
  sessionId: string;
  paymentStatus: "paid" | "unpaid" | "no_payment_required" | "unknown";
  customerEmail: string | null;
  customerName: string | null;
  postalCode?: string | null;
  postalCodeNormalized?: string | null;
  postalCodeValid?: boolean;
  validationFlags?: Record<string, unknown>;
  currency: "BRL";
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: OrderItemSummary[];
  createdAt: string;
}

export type AutomationEventType = "order.paid" | "checkout.abandoned";

export type AutomationTaskType =
  | "send_confirmation"
  | "education_24h"
  | "review_7d"
  | "reorder_25d"
  | "recover_1h"
  | "recover_24h";

export interface AutomationEvent {
  id: string;
  eventType: AutomationEventType;
  stripeEventId?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AutomationTask {
  id: string;
  eventId: string;
  taskType: AutomationTaskType;
  status: "pending" | "processing" | "completed" | "failed";
  dueAt: string;
  nextAttemptAt: string;
  retries: number;
  payload: Record<string, unknown>;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}
