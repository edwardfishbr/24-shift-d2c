import "dotenv/config";
import { PRODUCT_CATALOG, withStripePriceIds } from "../../shared/catalog";
import { getSupabase } from "../clients";

async function seed() {
  const supabase = getSupabase();
  const products = withStripePriceIds(PRODUCT_CATALOG);
  const now = new Date().toISOString();

  const productRows = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    line: product.line,
    name: product.name,
    short_description: product.shortDescription,
    description: product.description,
    currency: product.currency,
    active: product.active,
    provisional: product.provisional,
    image: product.image,
    price_cents: product.priceCents,
    stripe_price_id: product.stripePriceId ?? null,
    updated_at: now,
  }));

  const { error: productsError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id", ignoreDuplicates: false });

  if (productsError) {
    throw new Error(`Falha no seed de products: ${productsError.message}`);
  }

  const productIds = products.map((product) => product.id);

  const { error: deletePricesError } = await supabase
    .from("prices")
    .delete()
    .in("product_id", productIds);

  if (deletePricesError) {
    throw new Error(`Falha ao limpar prices anteriores: ${deletePricesError.message}`);
  }

  const priceRows = products.map((product) => ({
    product_id: product.id,
    amount_cents: product.priceCents,
    currency: product.currency,
    active: true,
    stripe_price_id: product.stripePriceId ?? null,
    updated_at: now,
  }));

  const { error: pricesError } = await supabase.from("prices").insert(priceRows);

  if (pricesError) {
    throw new Error(`Falha no seed de prices: ${pricesError.message}`);
  }

  console.log(`[seed] ${products.length} produtos atualizados.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
