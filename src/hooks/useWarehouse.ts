import { getWarehousesService } from "@/services/global.services";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./useToast";

/**
 * Fetch the sales user's warehouses and lock to the login warehouse — no picker.
 * `/warehouses` is bearer-scoped to the logged-in sales; the locked warehouse is
 * the row matching login `user.warehouseName` (fallback: first row). Stored in
 * the cart store (1 order = 1 warehouse).
 */
const useWarehouse = () => {
  const toast = useToast();
  const warehouse = useCartStore((s) => s.warehouse);
  const setWarehouse = useCartStore((s) => s.setWarehouse);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Lock to the login warehouse: the fetched row matching login
  // `user.warehouseName` (fallback: first row, since `/warehouses` is already
  // login-scoped). Keep the stored gudang only if it still equals that target;
  // otherwise override (defensive against a stale gudang from a previous login).
  const reconcile = useCallback((list: any[]) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const user = useAuthStore.getState().user;
    const target =
      list.find((w) => w.name === user?.warehouseName) ?? list[0];
    const current = useCartStore.getState().warehouse;
    if (current?.id && current.id === target?.id) return;
    setWarehouse(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getWarehousesService();
        const arr = Array.isArray(list) ? list : [];
        if (active) {
          setWarehouses(arr);
          reconcile(arr);
        }
      } catch (err) {
        if (__DEV__) {
          console.log(err);
        }
        toast.warning("Perhatian", String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { warehouse, warehouses, loading };
};

export default useWarehouse;
