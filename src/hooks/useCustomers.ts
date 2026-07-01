import {
  getCustomersService,
  getPendingRegistrationsService,
} from "@/services/sale.services";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./useToast";

// Status filter chips for the customer list (mirrors web SalesCustomers).
export const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "Active", label: "Aktif" },
  { value: "Inactive", label: "Nonaktif" },
];

/**
 * Customer list controller — the sales user's own customers from
 * `/customers` (filterable by `q` + `status`), plus the separate
 * `/registrations/pending` queue shown above the list.
 */
const useCustomers = () => {
  const toast = useToast();

  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [pendingRegs, setPendingRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    try {
      const data = await getCustomersService({
        q: search || undefined,
        status: status || undefined,
      });
      setRows(data ?? []);
    } catch (err) {
      if (__DEV__) console.log(err);
      const msg = String(err instanceof Error ? err.message : err);
      setError(msg);
      toast.warning("Perhatian", msg);
    }
    // Pending queue is best-effort — never block the list on it.
    try {
      const pending = await getPendingRegistrationsService();
      setPendingRegs(pending ?? []);
    } catch {
      setPendingRegs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchData();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const setSearch = (term: string) => setSearchState(term);
  const setStatus = (value: string) => setStatusState(value);

  return {
    STATUS_OPTIONS,
    search,
    setSearch,
    status,
    setStatus,
    rows,
    pendingRegs,
    loading,
    refreshing,
    error,
    onRefresh,
  };
};

export default useCustomers;
