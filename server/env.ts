const SUPABASE_ENV = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const CHECKOUT_ENV = [...SUPABASE_ENV, "STRIPE_SECRET_KEY"] as const;
const WEBHOOK_ENV = [...CHECKOUT_ENV, "STRIPE_WEBHOOK_SECRET"] as const;
const INTERNAL_AUTOMATION_ENV = ["AUTOMATION_INTERNAL_TOKEN"] as const;

function listMissingEnv(
  required: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return required.filter((key) => !env[key]);
}

function parseNumberEnv(
  rawValue: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, minimum), maximum);
}

function parseCsvEnv(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function getOptionalEnv(env: NodeJS.ProcessEnv = process.env) {
  const appUrl = env.APP_URL ?? "http://localhost:3000";
  const corsOrigins = parseCsvEnv(env.CORS_ORIGINS);
  if (corsOrigins.length === 0) {
    corsOrigins.push(appUrl);
  }

  return {
    appUrl,
    apiPort: parseNumberEnv(env.PORT ?? env.API_PORT, 4000, 1, 65535),
    nodeEnv: env.NODE_ENV ?? "development",
    corsOrigins,
    automationInternalToken: env.AUTOMATION_INTERNAL_TOKEN?.trim() || null,
    rateLimitWindowMs: parseNumberEnv(env.RATE_LIMIT_WINDOW_MS, 60_000, 1_000, 60 * 60 * 1_000),
    rateLimitContactMax: parseNumberEnv(env.RATE_LIMIT_CONTACT_MAX, 20, 1, 10_000),
    rateLimitCheckoutMax: parseNumberEnv(env.RATE_LIMIT_CHECKOUT_MAX, 30, 1, 10_000),
    rateLimitAutomationMax: parseNumberEnv(env.RATE_LIMIT_AUTOMATION_MAX, 10, 1, 10_000),
    rateLimitWebhookMax: parseNumberEnv(env.RATE_LIMIT_WEBHOOK_MAX, 180, 1, 10_000),
    automationWebhookBaseUrl: env.AUTOMATION_WEBHOOK_BASE_URL ?? "http://localhost:4000/internal/hooks",
  };
}

export function assertRequiredEnv(env: NodeJS.ProcessEnv = process.env) {
  const missing = listMissingEnv(WEBHOOK_ENV, env);
  if (missing.length > 0) {
    const message =
      `Missing required environment variables: ${missing.join(", ")}. ` +
      `Create a local .env with Stripe and Supabase credentials.`;
    throw new Error(message);
  }
}

export function hasRequiredEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return listMissingEnv(WEBHOOK_ENV, env).length === 0;
}

export function hasSupabaseEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return listMissingEnv(SUPABASE_ENV, env).length === 0;
}

export function hasCheckoutEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return listMissingEnv(CHECKOUT_ENV, env).length === 0;
}

export function hasWebhookEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return listMissingEnv(WEBHOOK_ENV, env).length === 0;
}

export function hasAutomationTokenEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return listMissingEnv(INTERNAL_AUTOMATION_ENV, env).length === 0;
}
