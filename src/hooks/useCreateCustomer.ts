import {
  checkCustomerCodeService,
  checkCustomerPhoneService,
  createCustomerService,
  getSalesWarehousesService,
} from "@/services/sale.services";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "./useToast";

export type AvailabilityStatus = null | "checking" | "available" | "taken";

const initialForm = {
  customerCode: "",
  customerName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address1: "",
  city: "",
  regency: "",
  warehouseId: "",
};

export type CustomerForm = typeof initialForm;

/**
 * Create-customer controller. Loads `/warehouses` (auto-locks when there's
 * exactly one), live-checks customerCode + phone uniqueness (debounced 500ms),
 * and POSTs `/customers`. Region/branch are derived server-side from the
 * sales profile, so they're not part of the form.
 */
const useCreateCustomer = () => {
  const toast = useToast();

  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [whLoading, setWhLoading] = useState(true);

  const [codeStatus, setCodeStatus] = useState<AvailabilityStatus>(null);
  const [codeMessage, setCodeMessage] = useState("");
  const codeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phoneStatus, setPhoneStatus] = useState<AvailabilityStatus>(null);
  const [phoneMessage, setPhoneMessage] = useState("");
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setField = useCallback((key: keyof CustomerForm, value: string) => {
    setForm((s) => ({ ...s, [key]: value }));
  }, []);

  // Load warehouses (scoped by branch). Auto-select when only one option.
  useEffect(() => {
    let active = true;
    (async () => {
      setWhLoading(true);
      try {
        const list = await getSalesWarehousesService();
        const arr = Array.isArray(list) ? list : [];
        if (!active) return;
        setWarehouses(arr);
        if (arr.length === 1) {
          setForm((s) => ({ ...s, warehouseId: String(arr[0].id) }));
        }
      } catch {
        if (active) setWarehouses([]);
      } finally {
        if (active) setWhLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Clean up pending debounce timers on unmount.
  useEffect(() => {
    return () => {
      if (codeTimer.current) clearTimeout(codeTimer.current);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
    };
  }, []);

  const onCodeChange = useCallback((raw: string) => {
    const value = raw.trim().toUpperCase();
    setForm((s) => ({ ...s, customerCode: value }));
    setCodeStatus(null);
    setCodeMessage("");
    if (codeTimer.current) clearTimeout(codeTimer.current);
    if (!value) return;
    setCodeStatus("checking");
    codeTimer.current = setTimeout(async () => {
      try {
        const r = await checkCustomerCodeService(value);
        if (r?.available) {
          setCodeStatus("available");
          setCodeMessage(r.message || "Code tersedia.");
        } else {
          setCodeStatus("taken");
          setCodeMessage(r?.message || "Code sudah dipakai.");
        }
      } catch {
        setCodeStatus(null);
        setCodeMessage("");
      }
    }, 500);
  }, []);

  const onPhoneChange = useCallback((raw: string) => {
    const value = raw.trim();
    setForm((s) => ({ ...s, phone: value }));
    setPhoneStatus(null);
    setPhoneMessage("");
    if (phoneTimer.current) clearTimeout(phoneTimer.current);
    if (!value) return;
    setPhoneStatus("checking");
    phoneTimer.current = setTimeout(async () => {
      try {
        const r = await checkCustomerPhoneService(value);
        if (r?.available) {
          setPhoneStatus("available");
          setPhoneMessage(r.message || "Nomor HP tersedia.");
        } else {
          setPhoneStatus("taken");
          setPhoneMessage(r?.message || "Nomor HP sudah dipakai.");
        }
      } catch {
        setPhoneStatus(null);
        setPhoneMessage("");
      }
    }, 500);
  }, []);

  // Validate + POST. Returns the success message on success, null on failure.
  const submit = useCallback(async (): Promise<string | null> => {
    if (!form.customerCode.trim()) return fail("Customer Code wajib.");
    if (codeStatus === "taken")
      return fail(codeMessage || "Customer Code sudah dipakai.");
    if (!form.customerName.trim()) return fail("Nama customer wajib.");
    if (!form.phone.trim()) return fail("Nomor HP wajib.");
    if (phoneStatus === "taken")
      return fail(phoneMessage || "Nomor HP sudah dipakai.");
    if (warehouses.length > 1 && !form.warehouseId)
      return fail("Pilih gudang.");

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        warehouseId: form.warehouseId ? Number(form.warehouseId) : null,
      };
      const r = await createCustomerService(payload);
      return (
        r?.message || "Pendaftaran customer terkirim, menunggu approval admin."
      );
    } catch (err) {
      if (__DEV__) console.log(err);
      const msg = String(err instanceof Error ? err.message : err);
      setError(msg);
      toast.error("Gagal", msg);
      return null;
    } finally {
      setSubmitting(false);
    }

    function fail(msg: string) {
      setError(msg);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, codeStatus, codeMessage, phoneStatus, phoneMessage, warehouses]);

  const canSubmit =
    !submitting &&
    codeStatus !== "taken" &&
    codeStatus !== "checking" &&
    phoneStatus !== "taken" &&
    phoneStatus !== "checking";

  return {
    form,
    setField,
    warehouses,
    whLoading,
    codeStatus,
    codeMessage,
    onCodeChange,
    phoneStatus,
    phoneMessage,
    onPhoneChange,
    submitting,
    error,
    submit,
    canSubmit,
  };
};

export default useCreateCustomer;
