import { PRODUCT_CATALOG, withStripePriceIds } from "../shared/catalog";
import type { Product } from "../shared/types";
import { getSupabase } from "./clients";

interface ProductRow {
  id: string;
  slug: string;
  line: Product["line"];
  name: string;
  short_description: string;
  description: string;
  currency: "BRL";
  active: boolean;
  provisional: boolean;
  image: string;
  price_cents: number | null;
  stripe_price_id: string | null;
}

interface PriceRow {
  product_id: string;
  amount_cents: number;
  stripe_price_id: string | null;
  active: boolean;
}

export async function loadCatalog(): Promise<Product[]> {
  const fallback = withStripePriceIds(PRODUCT_CATALOG);
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return fallback;
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, slug, line, name, short_description, description, currency, active, provisional, image, price_cents, stripe_price_id",
    )
    .eq("active", true)
    .order("line", { ascending: true });

  if (productsError || !products) {
    return fallback;
  }

  const { data: prices, error: pricesError } = await supabase
    .from("prices")
    .select("product_id, amount_cents, stripe_price_id, active")
    .eq("active", true);

  const priceMap = new Map<string, PriceRow>();
  if (!pricesError && prices) {
    for (const row of prices as PriceRow[]) {
      priceMap.set(row.product_id, row);
    }
  }

  return (products as ProductRow[]).map((row) => {
    const fallbackProduct = fallback.find((product) => product.id === row.id);
    const activePrice = priceMap.get(row.id);

    return {
      id: row.id,
      slug: row.slug,
      line: row.line,
      name: row.name,
      shortDescription: row.short_description,
      description: row.description,
      priceCents: activePrice?.amount_cents ?? row.price_cents ?? fallbackProduct?.priceCents ?? 0,
      currency: row.currency ?? "BRL",
      active: row.active,
      provisional: row.provisional,
      image: row.image,
      stripePriceId:
        activePrice?.stripe_price_id ??
        row.stripe_price_id ??
        fallbackProduct?.stripePriceId ??
        null,
    } satisfies Product;
  });
}

export function mapCatalogById(products: Product[]) {
  return new Map(products.map((product) => [product.id, product]));
}
