import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../shared/types";
import { PRODUCT_CATALOG } from "../../shared/catalog";
import { fetchProductsFromApi } from "../lib/api";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCT_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchProductsFromApi()
      .then((result) => {
        if (!mounted) return;
        setProducts(result);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar produtos");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const bySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);

  return { products, loading, error, byId, bySlug };
}
