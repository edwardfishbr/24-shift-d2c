import { z } from "zod";
import type { CartItem } from "../shared/types";

const CART_MAX_ITEMS = 50;

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeBrazilianCep(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{8}$/.test(digits)) {
    return null;
  }
  return digits;
}

export function formatBrazilianCep(normalizedCep: string): string {
  return `${normalizedCep.slice(0, 5)}-${normalizedCep.slice(5)}`;
}

export const cartItemSchema = z.object({
  productId: z
    .string({ message: "Produto invalido." })
    .trim()
    .min(1, "Produto invalido.")
    .max(120, "Produto invalido."),
  quantity: z
    .number({ message: "Quantidade invalida." })
    .int("Quantidade invalida.")
    .min(1, "Quantidade invalida. Use entre 1 e 20 unidades por item.")
    .max(20, "Quantidade invalida. Use entre 1 e 20 unidades por item."),
});

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Carrinho invalido. Informe ao menos um item.").max(CART_MAX_ITEMS),
  successUrl: z
    .string({ message: "URLs de sucesso/cancelamento sao obrigatorias." })
    .url("URLs de redirecionamento invalidas.")
    .refine(isHttpUrl, "URLs de redirecionamento invalidas."),
  cancelUrl: z
    .string({ message: "URLs de sucesso/cancelamento sao obrigatorias." })
    .url("URLs de redirecionamento invalidas.")
    .refine(isHttpUrl, "URLs de redirecionamento invalidas."),
});

export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;

export function parseCheckoutRequest(payload: unknown): { items: CartItem[]; successUrl: string; cancelUrl: string } {
  const parsed = checkoutRequestSchema.parse(payload);
  const items: CartItem[] = parsed.items.map((item) => ({
    productId: item.productId.trim(),
    quantity: item.quantity,
  }));

  return {
    items,
    successUrl: parsed.successUrl,
    cancelUrl: parsed.cancelUrl,
  };
}

export const contactRequestSchema = z
  .object({
    name: z.string({ message: "Nome invalido." }).trim().min(2, "Nome invalido.").max(120, "Nome invalido."),
    email: z.string({ message: "E-mail invalido." }).trim().email("E-mail invalido.").max(320, "E-mail invalido."),
    cep: z
      .string({ message: "CEP invalido." })
      .trim()
      .refine((value) => normalizeBrazilianCep(value) !== null, "CEP invalido. Use 12345-678 ou 12345678."),
    message: z
      .string({ message: "Mensagem invalida." })
      .trim()
      .min(10, "Mensagem invalida. Use ao menos 10 caracteres.")
      .max(2000, "Mensagem invalida."),
    source: z.string().trim().min(1).max(80).optional().default("site"),
  })
  .transform((payload) => {
    const normalizedCep = normalizeBrazilianCep(payload.cep)!;
    const normalizedEmail = normalizeEmail(payload.email);
    return {
      name: payload.name,
      email: normalizedEmail,
      emailNormalized: normalizedEmail,
      cep: formatBrazilianCep(normalizedCep),
      cepNormalized: normalizedCep,
      message: payload.message,
      source: payload.source,
    };
  });

export type ContactValidatedPayload = z.infer<typeof contactRequestSchema>;

export interface PostalCodeValidationResult {
  postalCode: string | null;
  postalCodeNormalized: string | null;
  postalCodeValid: boolean;
  validationFlags: Record<string, boolean>;
}

export function parseStripePostalCode(postalCode: unknown): PostalCodeValidationResult {
  const rawPostalCode = typeof postalCode === "string" ? postalCode.trim() : "";
  if (!rawPostalCode) {
    return {
      postalCode: null,
      postalCodeNormalized: null,
      postalCodeValid: false,
      validationFlags: {
        postalCodeMissing: true,
      },
    };
  }

  const normalizedPostalCode = normalizeBrazilianCep(rawPostalCode);
  if (!normalizedPostalCode) {
    return {
      postalCode: rawPostalCode,
      postalCodeNormalized: null,
      postalCodeValid: false,
      validationFlags: {
        postalCodeInvalid: true,
      },
    };
  }

  return {
    postalCode: rawPostalCode,
    postalCodeNormalized: normalizedPostalCode,
    postalCodeValid: true,
    validationFlags: {},
  };
}

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join(" ");
}
