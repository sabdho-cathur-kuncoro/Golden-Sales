import {
  completeOrderService,
  getMyOrdersService,
} from "@/services/orders.services";
import { useCallback, useEffect, useState } from "react";
import dayjs from "../../utils/days";
import { useToast } from "./useToast";

// Urutan flow status aktif (Selesai/Dibatalkan di-exclude — order final pindah
// ke halaman Laporan). Transaksi hanya nampilkan order yg masih jalan:
//   Menunggu Konfirmasi → Diproses Sales → Diproses Admin → Dipicking → Dikirim
export const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "Menunggu Konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "Diproses Sales", label: "Diproses Sales" },
  { value: "Diproses Admin", label: "Diproses Admin" },
  { value: "Dipicking", label: "Dipicking" },
  { value: "Dikirim", label: "Dikirim" },
];

// Status final — di-exclude dari Transaksi (default), atau dipakai sebagai
// status di halaman Permintaan (order final: Selesai + Dibatalkan).
const EXCLUDE_FINAL = "Selesai,Dibatalkan";

// Opsi status halaman Permintaan (order final).
export const REQUEST_STATUS_OPTIONS = [
  { value: "Selesai,Dibatalkan", label: "Semua" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

type UseMyOrdersOpts = {
  /** Status awal terpilih (default ""=Semua aktif). */
  initialStatus?: string;
  /** Status yg di-exclude server-side. "" untuk tidak meng-exclude apa pun
   *  (halaman Permintaan). Default = EXCLUDE_FINAL (halaman Transaksi). */
  excludeStatus?: string;
  /** Daftar chip status yg dikembalikan sebagai STATUS_OPTIONS. */
  statusOptions?: { value: string; label: string }[];
};

const PAGE_SIZE = 10;
const YMD = "YYYY-MM-DD";

/**
 * Transaksi list controller — server-paginated `/orders/mine` with status,
 * search + date-range filters and infinite scroll. Mirrors the web
 * `SalesTransactions` flow: only active orders (final statuses excluded), and a
 * "Selesai" action that completes a delivered order into the sales user's stock.
 */
const useMyOrders = (opts: UseMyOrdersOpts = {}) => {
  const {
    initialStatus = "",
    excludeStatus = EXCLUDE_FINAL,
    statusOptions = STATUS_OPTIONS,
  } = opts;
  const toast = useToast();

  const [status, setStatusState] = useState(initialStatus);
  const [search, setSearchState] = useState("");
  // Default rentang: 30 hari terakhir s/d hari ini.
  const [from, setFromState] = useState(
    dayjs().subtract(30, "day").format(YMD)
  );
  const [to, setToState] = useState(dayjs().format(YMD));
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState<any>(null);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      try {
        const res = await getMyOrdersService({
          status: status || undefined,
          excludeStatus: excludeStatus || undefined,
          search: search || undefined,
          from: from || undefined,
          to: to || undefined,
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
    [status, search, from, to]
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
  const setDateRange = (start: string | null, end: string | null) => {
    const nextFrom = start ?? "";
    const nextTo = end ?? "";
    if (nextFrom === from && nextTo === to) return;
    setOrders([]);
    setFromState(nextFrom);
    setToState(nextTo);
  };

  // Tap "Selesai" → POST /complete → SN masuk stock. On success the order is
  // terminal (excluded from this list), so drop it locally; return the result
  // so the screen can surface the inserted-SN count.
  const completeOrder = useCallback(async (id: any) => {
    setCompletingId(id);
    try {
      const res = await completeOrderService(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setTotalRecords((n) => Math.max(0, n - 1));
      return res;
    } finally {
      setCompletingId(null);
    }
  }, []);

  return {
    STATUS_OPTIONS: statusOptions,
    status,
    setStatus,
    search,
    setSearch,
    from,
    to,
    setDateRange,
    orders,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
    completeOrder,
    completingId,
  };
};

export default useMyOrders;
