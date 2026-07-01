import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { wait } from "../../utils/helper";
import useProducts from "./useProducts";

type Options = {
  /** Scope products to the selected warehouse (Order flow). Catalog stays global. */
  scopeToWarehouse?: boolean;
};

/**
 * Product list controller (Order + Katalog) — owns product fetching, search
 * filtering, and pull-to-refresh, keeping the screen presentational. When
 * `scopeToWarehouse` is set, products are fetched per the cart's selected
 * warehouse and refetched whenever it changes (empty until one is picked).
 */
const useProductListController = (opts?: Options) => {
  const scoped = !!opts?.scopeToWarehouse;
  const { user } = useAuthStore();
  const { products, loading, fetchProducts } = useProducts();
  const warehouse = useCartStore((s) => s.warehouse);

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(() => {
    if (scoped) {
      if (warehouse?.id) fetchProducts(warehouse.id);
    } else {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoped, warehouse?.id]);

  // Refetch on mount (global) or whenever the warehouse changes (scoped).
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (scoped && !warehouse?.id) return [];
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p: any) =>
        p.productName?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products, search, scoped, warehouse?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    wait(1000).then(() => {
      setRefreshing(false);
      load();
    });
  }, [load]);

  return { user, filtered, loading, search, setSearch, refreshing, onRefresh };
};

export default useProductListController;
