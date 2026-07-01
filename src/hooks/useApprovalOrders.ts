import { getOrdersService } from "@/services/orders.services";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./useToast";

export const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "Menunggu Konfirmasi", label: "Menunggu" },
  { value: "Diproses Sales", label: "Diproses" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Batal" },
];

const PAGE_SIZE = 10;

/**
 * Approval/orders list controller — server-paginated `/orders` with status +
 * search filters and infinite scroll. Mirrors the web `SalesOrders` flow.
 */
const useApprovalOrders = () => {
  const toast = useToast();

  const [status, setStatusState] = useState("Menunggu Konfirmasi");
  const [search, setSearchState] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      try {
        const res = await getOrdersService({
          status: status || undefined,
          search: search || undefined,
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        const rows = res?.data ?? [];
        setOrders((prev) => (append ? [...prev, ...rows] : rows));
        setTotalPages(res?.totalPages ?? 0);
        setTotalRecords(res?.totalRecords ?? 0);
        setPage(nextPage);
      } catch (err) {
        if (__DEV__) console.log(err);
        const msg = String(err instanceof Error ? err.message : err);
        if (!append) setError(msg);
        toast.warning("Perhatian", msg);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, search]
  );

  // Refetch from page 1 whenever status/search change.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      await fetchPage(1, false);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || refreshing) return;
    if (page >= totalPages) return;
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  }, [loading, loadingMore, refreshing, page, totalPages, fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError("");
    await fetchPage(1, false);
    setRefreshing(false);
  }, [fetchPage]);

  const setStatus = (value: string) => {
    if (value === status) return;
    setOrders([]);
    setStatusState(value);
  };
  const setSearch = (term: string) => {
    if (term === search) return;
    setOrders([]);
    setSearchState(term);
  };

  return {
    STATUS_OPTIONS,
    status,
    setStatus,
    search,
    setSearch,
    orders,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
  };
};

export default useApprovalOrders;
