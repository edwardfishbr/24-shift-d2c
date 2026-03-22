import "dotenv/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type Stripe from "stripe";
import { ZodError } from "zod";
import { mapCatalogById, loadCatalog } from "./catalog";
import { getStripe, getSupabase } from "./clients";
import { calculateTotals } from "./checkout";
import { createAndScheduleEvent, listAutomationTasks, processAutomationTasks } from "./automation";
import { saveContact } from "./contacts";
import { fetchOrderSummaryBySessionId, parseCartFromMetadata, persistPaidOrder } from "./orders";
import { createCorsMiddleware, createInternalTokenMiddleware } from "./security";
import { getOptionalEnv, hasCheckoutEnv, hasRequiredEnv, hasSupabaseEnv, hasWebhookEnv } from "./env";
import { contactRequestSchema, formatZodError, parseCheckoutRequest, parseStripePostalCode } from "./validation";

interface AppDependencies {
  saveContact: typeof saveContact;
  listAutomationTasks: typeof listAutomationTasks;
  processAutomationTasks: typeof processAutomationTasks;
}

interface ApiErrorPayload {
  error: string;
  details?: string;
}

const DEFAULT_APP_DEPENDENCIES: AppDependencies = {
  saveContact,
  listAutomationTasks,
  processAutomationTasks,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function sendServerError(
  res: express.Response,
  statusCode: number,
  message: string,
  error: unknown,
  isProduction: boolean,
): express.Response<ApiErrorPayload> {
  const details = getErrorMessage(error);
  if (statusCode >= 500) {
    console.error(`[api-error] ${message}:`, details);
  }

  if (isProduction) {
    return res.status(statusCode).json({ error: message });
  }
  return res.status(statusCode).json({ error: message, details });
}

function createRouteRateLimit(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message } satisfies ApiErrorPayload,
  });
}

function resolveStripePriceId(stripePriceId: string | null | undefined): string | null {
  const normalized = stripePriceId?.trim();
  if (!normalized) {
    return null;
  }
  if (normalized.includes("...")) {
    return null;
  }
  return normalized;
}

export function createApp(overrides: Partial<AppDependencies> = {}) {
  const env = getOptionalEnv();
  const isProduction = env.nodeEnv === "production";
  const dependencies: AppDependencies = {
    ...DEFAULT_APP_DEPENDENCIES,
    ...overrides,
  };

  const app = express();
  const requireInternalToken = createInternalTokenMiddleware(env.automationInternalToken);
  const contactRateLimit = createRouteRateLimit(
    env.rateLimitWindowMs,
    env.rateLimitContactMax,
    "Muitas tentativas de contato. Tente novamente em instantes.",
  );
  const checkoutRateLimit = createRouteRateLimit(
    env.rateLimitWindowMs,
    env.rateLimitCheckoutMax,
    "Muitas tentativas de checkout. Tente novamente em instantes.",
  );
  const automationRateLimit = createRouteRateLimit(
    env.rateLimitWindowMs,
    env.rateLimitAutomationMax,
    "Muitas operacoes de automacao. Aguarde e tente novamente.",
  );
  const webhookRateLimit = createRouteRateLimit(
    env.rateLimitWindowMs,
    env.rateLimitWebhookMax,
    "Muitas tentativas de webhook. Aguarde e tente novamente.",
  );

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(createCorsMiddleware(env.corsOrigins));

  app.post("/api/stripe/webhook", webhookRateLimit, express.raw({ type: "application/json" }), async (req, res) => {
    if (!hasWebhookEnv()) {
      return res.status(500).json({ error: "Stripe/Supabase credentials are not configured." });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(400).json({ error: "Missing Stripe signature." });
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      return sendServerError(res, 400, "Webhook invalido.", error, isProduction);
    }

    console.info("[stripe.webhook.received]", { eventId: event.id, eventType: event.type });

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const products = await loadCatalog();
        const productMap = mapCatalogById(products);
        const items = parseCartFromMetadata(session);
        const totals = calculateTotals(items, productMap);
        const postalCodeValidation = parseStripePostalCode(session.customer_details?.address?.postal_code);

        await persistPaidOrder({
          session,
          items,
          productMap,
          subtotalCents: totals.subtotalCents,
          shippingCents: totals.shippingCents,
          totalCents: totals.totalCents,
          postalCodeValidation,
        });

        await createAndScheduleEvent({
          eventType: "order.paid",
          stripeEventId: event.id,
          payload: {
            sessionId: session.id,
            customerEmail: session.customer_details?.email ?? null,
            totalCents: totals.totalCents,
            items,
            postalCode: postalCodeValidation.postalCode,
            postalCodeNormalized: postalCodeValidation.postalCodeNormalized,
            postalCodeValid: postalCodeValidation.postalCodeValid,
            validationFlags: postalCodeValidation.validationFlags,
          },
        });
      }

      if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;
        await createAndScheduleEvent({
          eventType: "checkout.abandoned",
          stripeEventId: event.id,
          payload: {
            sessionId: session.id,
            customerEmail: session.customer_details?.email ?? null,
            totalCents: Number(session.amount_total ?? 0),
          },
        });
      }
    } catch (error) {
      return sendServerError(res, 500, "Falha ao processar webhook.", error, isProduction);
    }

    console.info("[stripe.webhook.processed]", { eventId: event.id, eventType: event.type });
    return res.json({ received: true });
  });

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_, res) => {
    return res.json({
      ok: true,
      service: "24-shift-api",
      envReady: hasRequiredEnv(),
    });
  });

  app.get("/api/products", async (_, res) => {
    try {
      const products = await loadCatalog();
      return res.json({ products });
    } catch (error) {
      return sendServerError(res, 500, "Falha ao carregar produtos.", error, isProduction);
    }
  });

  app.post("/api/checkout/session", checkoutRateLimit, async (req, res) => {
    if (!hasCheckoutEnv()) {
      return res.status(500).json({ error: "Stripe/Supabase credentials are not configured." });
    }

    let payload: ReturnType<typeof parseCheckoutRequest>;
    try {
      payload = parseCheckoutRequest(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: formatZodError(error) });
      }
      return sendServerError(res, 400, "Payload de checkout invalido.", error, isProduction);
    }

    try {
      const products = await loadCatalog();
      const productMap = mapCatalogById(products);

      for (const item of payload.items) {
        if (!productMap.has(item.productId)) {
          return res.status(400).json({ error: `Produto invalido: ${item.productId}` });
        }
      }

      const totals = calculateTotals(payload.items, productMap);
      const stripe = getStripe();

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = payload.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const resolvedStripePriceId = resolveStripePriceId(product.stripePriceId);
        if (resolvedStripePriceId) {
          return {
            price: resolvedStripePriceId,
            quantity: item.quantity,
          };
        }

        return {
          quantity: item.quantity,
          price_data: {
            currency: "brl",
            product_data: {
              name: product.name,
              description: product.shortDescription,
              metadata: {
                product_id: product.id,
                line: product.line,
                provisional: String(product.provisional),
              },
            },
            unit_amount: product.priceCents,
          },
        };
      });

      if (totals.shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "brl",
            product_data: {
              name: "Frete padrao",
              description: "Frete fixo nacional",
              metadata: {
                shipping_rule: "fixed_free_over_299",
              },
            },
            unit_amount: totals.shippingCents,
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: payload.successUrl,
        cancel_url: payload.cancelUrl,
        billing_address_collection: "required",
        allow_promotion_codes: true,
        phone_number_collection: { enabled: true },
        metadata: {
          cart: JSON.stringify(payload.items),
          subtotalCents: String(totals.subtotalCents),
          shippingCents: String(totals.shippingCents),
          totalCents: String(totals.totalCents),
        },
      });

      const supabase = getSupabase();
      const checkoutPayload = {
        stripe_session_id: session.id,
        status: session.status ?? "open",
        payment_status: session.payment_status ?? "unpaid",
        customer_email: session.customer_details?.email ?? null,
        subtotal_cents: totals.subtotalCents,
        shipping_cents: totals.shippingCents,
        total_cents: totals.totalCents,
        currency: "BRL",
        items: payload.items,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: checkoutError } = await supabase
        .from("checkout_sessions")
        .upsert(checkoutPayload, { onConflict: "stripe_session_id", ignoreDuplicates: false });

      if (checkoutError) {
        throw new Error(`Falha ao salvar sessao de checkout: ${checkoutError.message}`);
      }

      return res.json({
        sessionId: session.id,
        url: session.url,
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        currency: "BRL",
      });
    } catch (error) {
      return sendServerError(res, 500, "Falha ao criar sessao de checkout.", error, isProduction);
    }
  });

  app.get("/api/orders/:sessionId", async (req, res) => {
    try {
      const summary = await fetchOrderSummaryBySessionId(req.params.sessionId);
      if (!summary) {
        return res.status(404).json({ error: "Pedido nao encontrado para esta sessao." });
      }
      return res.json({ order: summary });
    } catch (error) {
      return sendServerError(res, 500, "Falha ao carregar pedido.", error, isProduction);
    }
  });

  app.post("/api/contact", contactRateLimit, async (req, res) => {
    if (!hasSupabaseEnv()) {
      return res.status(500).json({ error: "Supabase credentials are not configured." });
    }

    try {
      const parsedPayload = contactRequestSchema.parse(req.body);
      await dependencies.saveContact(parsedPayload);
      return res.status(201).json({ ok: true });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: formatZodError(error) });
      }
      return sendServerError(res, 500, "Falha ao salvar contato.", error, isProduction);
    }
  });

  app.get("/api/automation/tasks", automationRateLimit, requireInternalToken, async (req, res) => {
    try {
      const status = typeof req.query.status === "string" ? req.query.status : "pending";
      const tasks = await dependencies.listAutomationTasks(status);
      return res.json({ tasks });
    } catch (error) {
      return sendServerError(res, 500, "Falha ao listar tarefas de automacao.", error, isProduction);
    }
  });

  app.post("/api/automation/process", automationRateLimit, requireInternalToken, async (req, res) => {
    try {
      const parsedLimit =
        typeof req.body?.limit === "number" ? Math.min(Math.max(Math.floor(req.body.limit), 1), 100) : 20;
      const processed = await dependencies.processAutomationTasks(parsedLimit);
      return res.json({ processedCount: processed.length, processed });
    } catch (error) {
      return sendServerError(res, 500, "Falha ao processar tarefas de automacao.", error, isProduction);
    }
  });

  app.post("/internal/hooks/:taskType", requireInternalToken, (req, res) => {
    return res.json({
      ok: true,
      taskType: req.params.taskType,
      receivedAt: new Date().toISOString(),
      payload: req.body ?? null,
    });
  });

  return app;
}

function isMainModule(moduleUrl: string): boolean {
  const currentPath = fileURLToPath(moduleUrl);
  const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return currentPath === entryPath;
}

if (isMainModule(import.meta.url)) {
  const { apiPort } = getOptionalEnv();
  const app = createApp();
  app.listen(apiPort, () => {
    console.log(`[24-shift-api] listening on http://localhost:${apiPort}`);
  });
}
