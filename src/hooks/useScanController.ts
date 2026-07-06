import { greenColor, greyColor, primaryColor } from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import {
  checkSellService,
  getSellStockService,
  submitSellService,
} from "@/services/sale.services";
import { useConfirmStore } from "@/stores/confirm.store";
import { useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Code,
  useCameraDevice,
  useCameraFormat,
  useCodeScanner,
} from "react-native-vision-camera";
import { currencyFormat } from "../../utils/currencyFormat";

/**
 * Scan / Penjualan (`/scan`) controller — camera setup, SN validation + sell
 * cart, stock list, and sale submission. Keeps the screen presentational.
 */
const useScanController = () => {
  const toast = useToast();
  const showConfirm = useConfirmStore((s) => s.show);

  const [cart, setCart] = useState<any[]>([]);
  const [manualQr, setManualQr] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [statusKind, setStatusKind] = useState<"" | "ok" | "err">("");
  const [busy, setBusy] = useState<boolean>(false);
  const [camOn, setCamOn] = useState<boolean>(false);

  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [stock, setStock] = useState<{ totalQty: number; groups: any[] }>({
    totalQty: 0,
    groups: [],
  });
  const [stockLoading, setStockLoading] = useState<boolean>(true);
  const [stockErr, setStockErr] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const lastDecoded = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  // SN yang sedang di keranjang — sumber kebenaran sinkron untuk dedup
  // (state `cart` tidak bisa dibaca-balik sinkron dari dalam updater setState).
  const cartSns = useRef<Set<string>>(new Set());
  // Cache resolusi QR-mentah → SN kanonik (dari checkSellService). Monotonik,
  // tak perlu cleanup: `cartSns` yang authoritative soal isi keranjang. Dipakai
  // agar scan-ulang QR terbungkus (mis. "B100X<sn>00001") short-circuit di
  // pre-check tanpa hit server lagi.
  const resolvedSn = useRef<Map<string, string>>(new Map());

  const norm = (s: string) => s.trim().toUpperCase();

  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [{ fps: 30 }]);
  const fps = Math.min(format?.maxFps ?? 1, 30);
  const isFocused = useIsFocused();

  const loadStock = useCallback(async () => {
    setStockLoading(true);
    setStockErr("");
    try {
      const res = await getSellStockService();
      setStock(res ?? { totalQty: 0, groups: [] });
    } catch (err: any) {
      setStockErr(err?.message ?? "Gagal memuat stok");
    } finally {
      setStockLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const tryAdd = useCallback(
    async (code: string) => {
      const c = (code || "").trim();
      if (!c) return;

      // Debounce same SN per-frame (camera fires repeatedly).
      const now = Date.now();
      if (
        lastDecoded.current.code === c &&
        now - lastDecoded.current.at < 2500
      ) {
        return;
      }
      lastDecoded.current = { code: c, at: now };

      // Pre-check sinkron — resolve QR mentah → SN kanonik (kalau pernah
      // di-scan), lalu cek membership authoritative di `cartSns`.
      const raw = norm(c);
      const knownCanon = resolvedSn.current.get(raw) ?? raw;
      if (cartSns.current.has(knownCanon)) {
        setStatusKind("err");
        setStatusMsg(`SN ${c} sudah di keranjang.`);
        return;
      }

      setBusy(true);
      setStatusKind("");
      setStatusMsg(`Memvalidasi ${c}…`);
      try {
        const res = await checkSellService(c);
        if (!res?.success || !res?.item?.sn) {
          setStatusKind("err");
          setStatusMsg(res?.message || "SN tidak valid.");
          toast.warning("SN tidak valid", res?.message || `SN ${c} ditolak.`);
          return;
        }
        const it = res.item;
        const sn = it.sn;
        const k = norm(sn);
        // Cache resolusi QR-mentah → kanonik untuk short-circuit scan berikutnya.
        resolvedSn.current.set(raw, k);
        // Guard kedua di dalam updater — dua SN bisa validasi konkuren sebelum
        // salah satu commit, jadi pre-check saja tak cukup. Pakai SN kanonik.
        let added = false;
        setCart((prev) => {
          if (prev.some((x) => norm(x.qr) === k)) return prev;
          added = true;
          return [
            ...prev,
            {
              qr: sn,
              productId: it.productId,
              productName: it.productName || `Product #${it.productId}`,
              productNumber: it.productNumber,
              unitPrice: Number(it.unitPrice || 0),
            },
          ];
        });
        if (added) {
          cartSns.current.add(k);
          setStatusKind("ok");
          setStatusMsg(`✓ ${sn} ditambah ke keranjang.`);
          setManualQr("");
        } else {
          setStatusKind("err");
          setStatusMsg(`SN ${sn} sudah di keranjang.`);
        }
      } catch (err: any) {
        setStatusKind("err");
        setStatusMsg(err?.message || "Server error.");
        toast.warning("Gagal", err?.message || "Server error.");
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  const onCodeScanned = useCallback(
    (codes: Code[]) => {
      const value = codes[0]?.value;
      if (value == null) return;
      tryAdd(value);
    },
    [tryAdd]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13", "code-128"],
    onCodeScanned,
  });

  const addFromStock = useCallback((sn: string, group: any) => {
    const k = norm(sn);
    let added = false;
    setCart((prev) => {
      if (prev.some((x) => norm(x.qr) === k)) return prev;
      added = true;
      return [
        ...prev,
        {
          qr: sn,
          productId: group.productId,
          productName: group.productName || `Product #${group.productId}`,
          productNumber: group.productNumber,
          unitPrice: Number(group.unitPrice || 0),
        },
      ];
    });
    if (added) {
      cartSns.current.add(k);
      setStatusKind("ok");
      setStatusMsg(`✓ ${sn} ditambah.`);
    } else {
      setStatusKind("err");
      setStatusMsg(`SN ${sn} sudah di keranjang.`);
    }
  }, []);

  const removeItem = useCallback((qr: string) => {
    cartSns.current.delete(norm(qr));
    setCart((prev) => prev.filter((x) => x.qr !== qr));
  }, []);

  const updatePrice = useCallback((qr: string, val: string) => {
    const num = Number(val) || 0;
    setCart((prev) =>
      prev.map((x) => (x.qr === qr ? { ...x, unitPrice: num } : x))
    );
  }, []);

  const cartTotal = cart.reduce((s, x) => s + Number(x.unitPrice || 0), 0);

  const toggleGroup = useCallback((productId: any) => {
    setExpanded((p) => ({ ...p, [productId]: !p[productId] }));
  }, []);

  const submit = useCallback(() => {
    if (cart.length === 0) {
      toast.warning("Keranjang kosong", "Scan / tap SN dari stok dulu.");
      return;
    }
    showConfirm({
      title: "Konfirmasi Penjualan",
      message: `Jual ${cart.length} item senilai ${currencyFormat(cartTotal)}?`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await submitSellService({
            items: cart.map((x) => ({ qr: x.qr, unitPrice: x.unitPrice })),
            buyerName: buyerName.trim() || null,
            buyerPhone: buyerPhone.trim() || null,
          });
          if (res?.success) {
            toast.success(
              "Berhasil",
              `${res.message ?? "Penjualan berhasil"} · Total ${currencyFormat(
                res.totalAmount ?? cartTotal
              )}`
            );
            cartSns.current.clear();
            setCart([]);
            setBuyerName("");
            setBuyerPhone("");
            setStatusKind("");
            setStatusMsg("");
            setCamOn(false);
            loadStock();
          } else {
            toast.error("Gagal", res?.message || "Gagal menjual.");
          }
        } catch (err: any) {
          toast.error("Gagal", err?.message || "Server error.");
        } finally {
          setSubmitting(false);
        }
      },
    });
  }, [cart, cartTotal, buyerName, buyerPhone, toast, showConfirm, loadStock]);

  const statusColor =
    statusKind === "ok"
      ? greenColor
      : statusKind === "err"
      ? primaryColor
      : greyColor;

  return {
    cart,
    manualQr,
    setManualQr,
    statusMsg,
    statusColor,
    busy,
    camOn,
    setCamOn,
    buyerName,
    setBuyerName,
    buyerPhone,
    setBuyerPhone,
    submitting,
    stock,
    stockLoading,
    stockErr,
    expanded,
    toggleGroup,
    device,
    codeScanner,
    fps,
    format,
    isFocused,
    tryAdd,
    addFromStock,
    removeItem,
    updatePrice,
    cartTotal,
    submit,
  };
};

export default useScanController;
