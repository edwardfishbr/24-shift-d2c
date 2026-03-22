import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../server/index";

const INTERNAL_TOKEN = "test-internal-token";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "service-role-for-tests";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_placeholder";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? "http://localhost:3000";
process.env.AUTOMATION_INTERNAL_TOKEN = INTERNAL_TOKEN;

function createTestApp(overrides?: Parameters<typeof createApp>[0]) {
  return createApp({
    saveContact: async () => undefined,
    processAutomationTasks: async () => [],
    listAutomationTasks: async () => [],
    ...overrides,
  });
}

test("POST /api/contact rejeita payload invalido de email e cep", async () => {
  const app = createTestApp();

  const response = await request(app).post("/api/contact").send({
    name: "Ed",
    email: "invalido",
    cep: "123",
    message: "Mensagem valida com mais de 10 caracteres.",
    source: "contact-page",
  });

  assert.equal(response.status, 400);
});

test("POST /api/contact aceita payload valido e normaliza campos", async () => {
  let savedPayload: Record<string, unknown> | null = null;
  const app = createTestApp({
    saveContact: async (payload) => {
      savedPayload = payload;
    },
  });

  const response = await request(app).post("/api/contact").send({
    name: "Eduardo",
    email: "ED@EMAIL.COM",
    cep: "12345678",
    message: "Mensagem valida com mais de 10 caracteres.",
    source: "contact-page",
  });

  assert.equal(response.status, 201);
  assert.equal(savedPayload?.emailNormalized, "ed@email.com");
  assert.equal(savedPayload?.cepNormalized, "12345678");
});

test("POST /api/automation/process retorna 401 sem token interno", async () => {
  const app = createTestApp();
  const response = await request(app).post("/api/automation/process").send({ limit: 1 });
  assert.equal(response.status, 401);
});

test("POST /api/automation/process retorna 200 com token interno valido", async () => {
  const app = createTestApp({
    processAutomationTasks: async () => [{ taskId: "task-1", status: "completed" }],
  });

  const response = await request(app)
    .post("/api/automation/process")
    .set("x-internal-token", INTERNAL_TOKEN)
    .send({ limit: 1 });

  assert.equal(response.status, 200);
  assert.equal(response.body.processedCount, 1);
});

test("POST /api/checkout/session rejeita payload invalido", async () => {
  const app = createTestApp();

  const response = await request(app).post("/api/checkout/session").send({
    items: [],
    successUrl: "notaurl",
    cancelUrl: "https://example.com/cancel",
  });

  assert.equal(response.status, 400);
});
