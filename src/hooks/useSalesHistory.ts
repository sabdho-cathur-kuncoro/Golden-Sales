import {
  getSellHistoryDetailService,
  getSellHistoryService,
} from "@/services/sale.services";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "../../utils/days";
import { useToast } from "./useToast";

const PAGE_SIZE = 10;
const YMD = "YYYY-MM-DD";

/**
 * Penjualan Saya (`/report/penjualan`) controller — server-paginated
 * `/sell/history` with search + date-range filter and infinite scroll. Rows
 * expand to fetch their SN-level detail from `/sell/history/:ref` (cached).
 * Mirrors the web `SalesSalesHistory` flow. Keeps the screen presentational.
 */
const useSalesHistory = () => {
  const toast = useToast();

  const [search, setSearchState] = useState("");
  // Default rentang: 30 hari terakhir s/d hari ini.
  const [from, setFromState] = useState(dayjs().subtract(30, "day").format(YMD));
  const [to, setToState] = useState(dayjs().format(YMD));

  const [sales, setSales] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, any>>({});
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      try {
        const res = await getSellHistoryService({
          from: from || undefined,
          to: to || undefined,
          search: search || undefined,
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        const rows = res?.data ?? [];
        setSales((prev) => (append ? [...prev, ...rows] : rows));
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
    [search, from, to]
  );

  // Refetch from page 1 whenever search / date-range change.
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

  const setSearch = (term: string) => {
    if (term === search) return;
    setSales([]);
    setSearchState(term);
  };

  const setDateRange = (start: string | null, end: string | null) => {
    const nextFrom = start ?? "";
    const nextTo = end ?? "";
    if (nextFrom === from && nextTo === to) return;
    setSales([]);
    setFromState(nextFrom);
    setToState(nextTo);
  };

  const toggleExpand = useCallback(
    async (saleNumber: string) => {
      if (expanded === saleNumber) {
        setExpanded(null);
        return;
      }
      setExpanded(saleNumber);
      if (detailCache[saleNumber]) return;
      setDetailLoading(true);
      try {
        const res = await getSellHistoryDetailService(saleNumber);
        setDetailCache((c) => ({ ...c, [saleNumber]: res }));
      } catch (err) {
        const msg = String(err instanceof Error ? err.message : err);
        setDetailCache((c) => ({ ...c, [saleNumber]: { error: msg } }));
      } finally {
        setDetailLoading(false);
      }
    },
    [expanded, detailCache]
  );

  // Ringkasan halaman ini: jumlah item + total nominal dari rows yg termuat.
  const summary = useMemo(() => {
    const itemCount = sales.reduce((s, x) => s + (x.itemCount || 0), 0);
    const totalNominal = sales.reduce((s, x) => s + Number(x.total || 0), 0);
    return { itemCount, totalNominal };
  }, [sales]);

  const isFilterActive = useMemo(() => {
    const defFrom = dayjs().subtract(30, "day").format(YMD);
    const defTo = dayjs().format(YMD);
    return from !== defFrom || to !== defTo;
  }, [from, to]);

  return {
    search,
    setSearch,
    from,
    to,
    setDateRange,
    isFilterActive,
    sales,
    summary,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
    expanded,
    detailCache,
    detailLoading,
    toggleExpand,
  };
};

export default useSalesHistory;
