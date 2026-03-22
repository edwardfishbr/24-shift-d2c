import assert from "node:assert/strict";
import test from "node:test";
import { PRODUCT_CATALOG, SHIPPING_FIXED_CENTS, SHIPPING_FREE_THRESHOLD_CENTS } from "../shared/catalog";
import { calculateTotals, normalizeCartItems, validateUrls } from "../server/checkout";
import type { CartItem } from "../shared/types";

const productMap = new Map(PRODUCT_CATALOG.map((product) => [product.id, product]));

test("calculateTotals aplica frete fixo abaixo de R$299", () => {
  const items: CartItem[] = [{ productId: "core-creatine-300g", quantity: 1 }];
  const totals = calculateTotals(items, productMap);

  assert.equal(totals.subtotalCents, 12990);
  assert.equal(totals.shippingCents, SHIPPING_FIXED_CENTS);
  assert.equal(totals.totalCents, 12990 + SHIPPING_FIXED_CENTS);
});

test("calculateTotals aplica frete gratis acima do limiar", () => {
  const items: CartItem[] = [{ productId: "core-creatine-300g", quantity: 3 }];
  const totals = calculateTotals(items, productMap);

  assert.ok(totals.subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS);
  assert.equal(totals.shippingCents, 0);
  assert.equal(totals.totalCents, totals.subtotalCents);
});

test("normalizeCartItems valida estrutura e limites de quantidade", () => {
  const parsed = normalizeCartItems([{ productId: "core-creatine-300g", quantity: 2 }]);
  assert.deepEqual(parsed, [{ productId: "core-creatine-300g", quantity: 2 }]);

  assert.throws(
    () => normalizeCartItems([{ productId: "core-creatine-300g", quantity: 0 }]),
    /Quantidade/i,
  );
  assert.throws(
    () => normalizeCartItems([{ productId: "core-creatine-300g" }]),
    /Formato de item/i,
  );
});

test("validateUrls aceita apenas http/https validos", () => {
  assert.doesNotThrow(() => validateUrls("https://example.com/success", "http://localhost:3000/cancel"));
  assert.throws(() => validateUrls("javascript:alert(1)", "https://example.com/cancel"), /redirecionamento/i);
  assert.throws(() => validateUrls(undefined, "https://example.com/cancel"), /sucesso\/cancelamento/i);
});
