import assert from "node:assert/strict";
import test from "node:test";
import { ZodError } from "zod";
import {
  contactRequestSchema,
  normalizeBrazilianCep,
  parseCheckoutRequest,
  parseStripePostalCode,
} from "../server/validation";

test("normalizeBrazilianCep aceita formatos validos e normaliza para 8 digitos", () => {
  assert.equal(normalizeBrazilianCep("12345-678"), "12345678");
  assert.equal(normalizeBrazilianCep("12345678"), "12345678");
});

test("normalizeBrazilianCep rejeita formatos invalidos", () => {
  assert.equal(normalizeBrazilianCep("1234-567"), null);
  assert.equal(normalizeBrazilianCep("abc"), null);
});

test("contactRequestSchema valida e normaliza email e cep", () => {
  const parsed = contactRequestSchema.parse({
    name: " Eduardo ",
    email: " ED@EMAIL.COM ",
    cep: "12345-678",
    message: "Mensagem valida com mais de 10 caracteres.",
    source: "contact-page",
  });

  assert.equal(parsed.email, "ed@email.com");
  assert.equal(parsed.emailNormalized, "ed@email.com");
  assert.equal(parsed.cep, "12345-678");
  assert.equal(parsed.cepNormalized, "12345678");
});

test("contactRequestSchema rejeita email ou cep invalidos", () => {
  assert.throws(
    () =>
      contactRequestSchema.parse({
        name: "Eduardo",
        email: "email-invalido",
        cep: "12345-678",
        message: "Mensagem valida com mais de 10 caracteres.",
        source: "contact-page",
      }),
    ZodError,
  );

  assert.throws(
    () =>
      contactRequestSchema.parse({
        name: "Eduardo",
        email: "ed@email.com",
        cep: "0000",
        message: "Mensagem valida com mais de 10 caracteres.",
        source: "contact-page",
      }),
    ZodError,
  );
});

test("parseCheckoutRequest valida urls e carrinho", () => {
  const parsed = parseCheckoutRequest({
    items: [{ productId: "core-creatine-300g", quantity: 2 }],
    successUrl: "https://example.com/success",
    cancelUrl: "http://localhost:3000/checkout?canceled=1",
  });

  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0].quantity, 2);
  assert.equal(parsed.successUrl, "https://example.com/success");
});

test("parseStripePostalCode marca status de validacao", () => {
  const valid = parseStripePostalCode("12345-678");
  assert.equal(valid.postalCodeValid, true);
  assert.equal(valid.postalCodeNormalized, "12345678");

  const missing = parseStripePostalCode(null);
  assert.equal(missing.postalCodeValid, false);
  assert.equal(missing.validationFlags.postalCodeMissing, true);

  const invalid = parseStripePostalCode("12-abc");
  assert.equal(invalid.postalCodeValid, false);
  assert.equal(invalid.validationFlags.postalCodeInvalid, true);
});
