import useCart from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useConfirmStore } from "@/stores/confirm.store";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

/** Stable line key — non-serial vs serial line for one product. */
export const keyOf = (item: any) =>
  `${item.productId}-${item.serials?.length ? "S" : "N"}`;

/** Stable per-serial key for the exclusion set. */
const serialKey = (productId: any, sn: string) => `${productId}::${sn}`;

/** Reconstruct a product-shaped object from a cart line for setQty(). */
const toProduct = (item: any) => ({
  id: item.productId,
  productName: item.productName,
  productCode: item.productCode,
  salesPrice: item.salesPrice,
  imageBase64: item.imageBase64,
  imageContentType: item.imageContentType,
  promos: item.promos,
  stock: item.stock,
});

/** True when requested qty exceeds a known stock (null/undefined = uncapped). */
const overStock = (item: any, qty: number) =>
  typeof item?.stock === "number" && qty > item.stock;

/**
 * Cart screen controller — owns all selection/checkout business logic, keeping
 * the screen presentational. Consumes `useCart` for data + mutations.
 */
const useCartController = () => {
  const { show } = useConfirmStore();
  const toast = useToast();
  const { items, setQty, remove, removeSerial, lineInfo, refresh } = useCart();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Re-pull DB blob + server cart whenever the screen gains focus (instant DB
  // paint, server overwrites when it lands).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Track DESELECTED line keys + serial keys so newly-added entries default to
  // selected. A serial line is "selected" while it keeps ≥1 selected serial.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [excludedSerials, setExcludedSerials] = useState<Set<string>>(
    new Set()
  );

  const selectedSerialsOf = useCallback(
    (item: any): string[] =>
      (item.serials ?? []).filter(
        (sn: string) => !excludedSerials.has(serialKey(item.productId, sn))
      ),
    [excludedSerials]
  );

  const isSelected = useCallback(
    (item: any) =>
      item.serials?.length
        ? selectedSerialsOf(item).length > 0
        : !excluded.has(keyOf(item)),
    [excluded, selectedSerialsOf]
  );

  /** Map a line to its effective (selection-aware) shape for totals/checkout. */
  const effectiveItem = useCallback(
    (item: any) => {
      if (!item.serials?.length) return item;
      const sel = selectedSerialsOf(item);
      return { ...item, serials: sel, quantity: sel.length };
    },
    [selectedSerialsOf]
  );

  const toggleSelect = useCallback(
    (item: any) => {
      if (item.serials?.length) {
        // Serial line: exclude-all vs clear-all for this product's serials.
        const sel = selectedSerialsOf(item);
        setExcludedSerials((prev) => {
          const next = new Set(prev);
          if (sel.length > 0) {
            item.serials.forEach((sn: string) =>
              next.add(serialKey(item.productId, sn))
            );
          } else {
            item.serials.forEach((sn: string) =>
              next.delete(serialKey(item.productId, sn))
            );
          }
          return next;
        });
        return;
      }
      const k = keyOf(item);
      setExcluded((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    },
    [selectedSerialsOf]
  );

  const toggleSerial = useCallback((item: any, sn: string) => {
    const k = serialKey(item.productId, sn);
    setExcludedSerials((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  const toggleSerialAll = useCallback(
    (item: any) => {
      const allSel =
        selectedSerialsOf(item).length === (item.serials?.length ?? 0);
      setExcludedSerials((prev) => {
        const next = new Set(prev);
        (item.serials ?? []).forEach((sn: string) => {
          const k = serialKey(item.productId, sn);
          if (allSel) next.add(k);
          else next.delete(k);
        });
        return next;
      });
    },
    [selectedSerialsOf]
  );

  const allSelected = useMemo(
    () => items.length > 0 && items.every((i) => isSelected(i)),
    [items, isSelected]
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setExcluded(new Set(items.filter((i) => !i.serials?.length).map(keyOf)));
      setExcludedSerials(
        new Set(
          items.flatMap((i) =>
            (i.serials ?? []).map((sn: string) => serialKey(i.productId, sn))
          )
        )
      );
    } else {
      setExcluded(new Set());
      setExcludedSerials(new Set());
    }
  }, [allSelected, items]);

  const selectedItems = useMemo(
    () => items.filter(isSelected).map(effectiveItem),
    [items, isSelected, effectiveItem]
  );

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + lineInfo(i).subtotal, 0),
    [selectedItems, lineInfo]
  );

  const capWarn = useCallback(
    (item: any) =>
      toast.warning(
        "Melebihi stok",
        `Jumlah melebihi stok yang tersedia (stok: ${item.stock}).`
      ),
    [toast]
  );

  const onInc = useCallback(
    (item: any) => {
      const next = (item.quantity ?? 0) + 1;
      if (overStock(item, next)) return capWarn(item);
      setQty(toProduct(item), next);
    },
    [setQty, capWarn]
  );
  const onDec = useCallback(
    (item: any) => {
      // Clamp at 1 — decrement never deletes the line (use handleDelete for that).
      const next = (item.quantity ?? 0) - 1;
      if (next < 1) return;
      setQty(toProduct(item), next);
    },
    [setQty]
  );
  // Returns false when rejected (over stock) so the tile can reset its field.
  const onChangeQty = useCallback(
    (item: any, qty: number): boolean => {
      if (overStock(item, qty)) {
        capWarn(item);
        return false;
      }
      setQty(toProduct(item), qty);
      return true;
    },
    [setQty, capWarn]
  );

  const handleDelete = useCallback(
    (item: any) => {
      show({
        title: "Hapus Item",
        message: `Hapus "${item?.productName}" dari keranjang?`,
        type: "danger",
        onConfirm: async () => remove(item.productId),
      });
    },
    [show, remove]
  );

  const handleRemoveSerial = useCallback(
    (item: any, sn: string) => {
      show({
        title: "Hapus Nomor",
        message: `Hapus nomor "${sn}"?`,
        type: "danger",
        onConfirm: async () => removeSerial(item.productId, sn),
      });
    },
    [show, removeSerial]
  );

  const handleCheckout = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.warning("Pilih Produk", "Pilih minimal satu produk untuk dipesan");
      return;
    }
    router.push("/checkout");
  }, [selectedItems, toast]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const keyExtractor = useCallback((item: any) => keyOf(item), []);

  return {
    items,
    refreshing,
    onRefresh,
    keyExtractor,
    isSelected,
    selectedSerialsOf,
    toggleSelect,
    toggleSerial,
    toggleSerialAll,
    allSelected,
    toggleSelectAll,
    selectedItems,
    selectedTotal,
    onInc,
    onDec,
    onChangeQty,
    handleDelete,
    handleRemoveSerial,
    handleCheckout,
  };
};

export default useCartController;
