import type { Product } from "./types";

export const SHIPPING_FREE_THRESHOLD_CENTS = 29900;
export const SHIPPING_FIXED_CENTS = 1990;

export const PRODUCT_CATALOG: Product[] = [
  {
    id: "core-creatine-300g",
    slug: "creatine",
    line: "CORE",
    name: "Creatina Monohidratada 300g",
    shortDescription: "A base da sua performance diária.",
    description:
      "Creatina monohidratada pura para sustentar consistência física e mental ao longo do dia.",
    priceCents: 12990,
    currency: "BRL",
    active: true,
    provisional: false,
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1600&auto=format&fit=crop",
    stripePriceId: null,
  },
  {
    id: "end-magnesium-blend",
    slug: "magnesium",
    line: "END",
    name: "Magnésio Blend",
    shortDescription: "Recuperação inteligente para fechar o dia.",
    description:
      "Blend de magnésio para relaxamento muscular e suporte à recuperação noturna.",
    priceCents: 14990,
    currency: "BRL",
    active: true,
    provisional: false,
    image:
      "https://images.unsplash.com/photo-1622484211148-7182101b0687?q=80&w=1600&auto=format&fit=crop",
    stripePriceId: null,
  },
  {
    id: "start-focus-energy",
    slug: "start-focus-energy",
    line: "START",
    name: "Focus & Energia",
    shortDescription: "Ativação inteligente para começar forte.",
    description:
      "SKU provisório vendável da linha START para energia e foco no início do dia.",
    priceCents: 13990,
    currency: "BRL",
    active: true,
    provisional: true,
    image:
      "https://images.unsplash.com/photo-1514996550219-62672472d03b?q=80&w=1600&auto=format&fit=crop",
    stripePriceId: null,
  },
  {
    id: "flow-electrolytes-plus",
    slug: "flow-electrolytes-plus",
    line: "FLOW",
    name: "Electrolytes+ Hidratação",
    shortDescription: "Hidratação e ritmo para performance contínua.",
    description:
      "SKU provisório vendável da linha FLOW com eletrólitos para sustentar o ritmo ao longo do dia.",
    priceCents: 11990,
    currency: "BRL",
    active: true,
    provisional: true,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1600&auto=format&fit=crop",
    stripePriceId: null,
  },
  {
    id: "combo-day-stack",
    slug: "combo",
    line: "COMBO",
    name: "SHIFT DAY STACK — Combo",
    shortDescription: "Sua base diária do começo ao fechamento do dia.",
    description:
      "Combo Creatina + Magnésio com economia para iniciar a rotina integrada 24 SHIFT.",
    priceCents: 24990,
    currency: "BRL",
    active: true,
    provisional: false,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    stripePriceId: null,
  },
];

export function getCatalogMap(products = PRODUCT_CATALOG): Map<string, Product> {
  return new Map(products.map((product) => [product.id, product]));
}

export function getProductBySlug(slug: string, products = PRODUCT_CATALOG): Product | undefined {
  return products.find((product) => product.slug === slug && product.active);
}

export function withStripePriceIds(
  products = PRODUCT_CATALOG,
  env: NodeJS.ProcessEnv = process.env,
): Product[] {
  const sanitizeStripePriceId = (value: string | undefined): string | null => {
    const normalized = value?.trim();
    if (!normalized || normalized.includes("...")) {
      return null;
    }
    return normalized;
  };

  const mapById: Record<string, string | undefined> = {
    "core-creatine-300g": env.STRIPE_PRICE_CORE,
    "end-magnesium-blend": env.STRIPE_PRICE_END,
    "start-focus-energy": env.STRIPE_PRICE_START,
    "flow-electrolytes-plus": env.STRIPE_PRICE_FLOW,
    "combo-day-stack": env.STRIPE_PRICE_COMBO,
  };

  return products.map((product) => ({
    ...product,
    stripePriceId: sanitizeStripePriceId(mapById[product.id]),
  }));
}
