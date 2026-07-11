import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";

export function useProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalogue API indisponible.");
        return (await response.json()) as Product[];
      })
      .then((apiProducts) => {
        if (active && Array.isArray(apiProducts)) {
          setProducts(apiProducts);
        }
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
