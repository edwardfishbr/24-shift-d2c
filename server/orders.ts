import type Stripe from "stripe";
import type { CartItem, OrderSummary, Product } from "../shared/types";
import { getSupabase } from "./clients";
import type { PostalCodeValidationResult } from "./validation";

export function parseCartFromMetadata(session: Stripe.Checkout.Session): CartItem[] {
  const serialized = session.metadata?.cart;
  if (!serialized) {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized) as Array<{ productId: string; quantity: number }>;
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

export async function persistPaidOrder(params: {
  session: Stripe.Checkout.Session;
  items: CartItem[];
  productMap: Map<string, Product>;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  postalCodeValidation: PostalCodeValidationResult;
}) {
  const supabase = getSupabase();
  const session = params.session;
  const orderPayload = {
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    payment_status: session.payment_status ?? "unknown",
    customer_email: session.customer_details?.email ?? null,
    customer_name: session.customer_details?.name ?? null,
    postal_code: params.postalCodeValidation.postalCode,
    postal_code_normalized: params.postalCodeValidation.postalCodeNormalized,
    postal_code_valid: params.postalCodeValidation.postalCodeValid,
    validation_flags: params.postalCodeValidation.validationFlags,
    subtotal_cents: params.subtotalCents,
    shipping_cents: params.shippingCents,
    total_cents: params.totalCents,
    currency: "BRL",
    created_at: new Date().toISOString(),
  };

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .upsert(orderPayload, { onConflict: "stripe_session_id", ignoreDuplicates: false })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    throw new Error(`Falha ao persistir pedido: ${orderError?.message ?? "order row not returned"}`);
  }

  const orderItems = params.items
    .map((item) => {
      const product = params.productMap.get(item.productId);
      if (!product) {
        return null;
      }

      const totalPriceCents = product.priceCents * item.quantity;
      return {
        order_id: orderRow.id,
        product_id: product.id,
        slug: product.slug,
        line: product.line,
        name: product.name,
        quantity: item.quantity,
        unit_price_cents: product.priceCents,
        total_price_cents: totalPriceCents,
      };
    })
    .filter(Boolean);

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .upsert(orderItems, { onConflict: "order_id,product_id", ignoreDuplicates: false });
    if (itemsError) {
      throw new Error(`Falha ao persistir itens do pedido: ${itemsError.message}`);
    }
  }

  const { error: checkoutUpdateError } = await supabase
    .from("checkout_sessions")
    .update({
      status: "completed",
      payment_status: session.payment_status ?? "unknown",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", session.id);

  if (checkoutUpdateError) {
    console.error("Falha ao atualizar checkout session:", checkoutUpdateError.message);
  }
}

export async function fetchOrderSummaryBySessionId(sessionId: string): Promise<OrderSummary | null> {
  const supabase = getSupabase();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, stripe_session_id, payment_status, customer_email, customer_name, postal_code, postal_code_normalized, postal_code_valid, validation_flags, subtotal_cents, shipping_cents, total_cents, currency, created_at",
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (orderError) {
    throw new Error(`Falha ao carregar pedido: ${orderError.message}`);
  }
  if (!order) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, slug, line, name, quantity, unit_price_cents, total_price_cents")
    .eq("order_id", order.id)
    .order("name", { ascending: true });

  if (itemsError) {
    throw new Error(`Falha ao carregar itens do pedido: ${itemsError.message}`);
  }

  return {
    sessionId: order.stripe_session_id,
    paymentStatus: (order.payment_status as OrderSummary["paymentStatus"]) ?? "unknown",
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    postalCode: order.postal_code ?? null,
    postalCodeNormalized: order.postal_code_normalized ?? null,
    postalCodeValid: order.postal_code_valid ?? false,
    validationFlags: (order.validation_flags as Record<string, unknown> | null) ?? {},
    currency: "BRL",
    subtotalCents: order.subtotal_cents ?? 0,
    shippingCents: order.shipping_cents ?? 0,
    totalCents: order.total_cents ?? 0,
    items:
      items?.map((item) => ({
        productId: item.product_id,
        slug: item.slug,
        line: item.line,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        totalPriceCents: item.total_price_cents,
      })) ?? [],
    createdAt: order.created_at,
  };
}
