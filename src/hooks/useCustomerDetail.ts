import {
  getCustomerDetailService,
  requestCustomerStatusService,
} from "@/services/sale.services";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./useToast";

/**
 * Customer detail controller — loads `/customers/:id` and submits a
 * status-change request (`/status-request`) that needs admin approval. While a
 * request is pending (`data.pending`) the action button is disabled upstream.
 */
const useCustomerDetail = (id: string | number) => {
  const toast = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    try {
      const res = await getCustomerDetailService(id);
      setData(res ?? null);
    } catch (err) {
      if (__DEV__) console.log(err);
      const msg = String(err instanceof Error ? err.message : err);
      setError(msg);
      toast.warning("Perhatian", msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // Submit status-change request. Returns true on success so the screen can
  // collapse the form.
  const submitStatusRequest = useCallback(
    async (newStatus: string, reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed) {
        toast.warning("Perhatian", "Alasan wajib diisi.");
        return false;
      }
      setSubmitting(true);
      try {
        await requestCustomerStatusService(id, { newStatus, reason: trimmed });
        toast.success("Berhasil", "Request terkirim, menunggu approval admin.");
        await fetchData();
        return true;
      } catch (err) {
        if (__DEV__) console.log(err);
        const msg = String(err instanceof Error ? err.message : err);
        toast.error("Gagal", msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, fetchData]
  );

  return {
    data,
    loading,
    submitting,
    error,
    submitStatusRequest,
    refetch: fetchData,
  };
};

export default useCustomerDetail;
