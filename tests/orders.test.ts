import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { parseCartFromMetadata } from "../server/orders";

test("parseCartFromMetadata extrai itens validos da metadata do checkout", () => {
  const session = {
    metadata: {
      cart: JSON.stringify([
        { productId: "core-creatine-300g", quantity: 2 },
        { productId: "end-magnesium-blend", quantity: 1 },
      ]),
    },
  } as unknown as Stripe.Checkout.Session;

  const items = parseCartFromMetadata(session);

  assert.deepEqual(items, [
    { productId: "core-creatine-300g", quantity: 2 },
    { productId: "end-magnesium-blend", quantity: 1 },
  ]);
});

test("parseCartFromMetadata retorna lista vazia para metadata invalida", () => {
  const session = { metadata: { cart: "{invalid-json" } } as unknown as Stripe.Checkout.Session;
  const items = parseCartFromMetadata(session);

  assert.deepEqual(items, []);
});

test("parseCartFromMetadata corrige quantidade minima", () => {
  const session = {
    metadata: {
      cart: JSON.stringify([{ productId: "core-creatine-300g", quantity: 0 }]),
    },
  } as unknown as Stripe.Checkout.Session;

  const items = parseCartFromMetadata(session);
  assert.deepEqual(items, [{ productId: "core-creatine-300g", quantity: 1 }]);
});
