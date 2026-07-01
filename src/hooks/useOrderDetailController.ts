import useProducts from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart.store";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { describePromos, lineWithPromo } from "../../utils/promo";
import { useToast } from "./useToast";

/**
 * Order detail (`/order/productDetail`) controller — interactive product detail
 * for canvassing: warehouse guard, qty / serial selection, live promo math, and
 * add-to-cart. Mirrors the web `SalesProductDetail` flow.
 */
const useOrderDetailController = (uid: any) => {
  const toast = useToast();
  const {
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    setImagetoView,
    fetchProductDetail,
  } = useProducts();

  const warehouse = useCartStore((s) => s.warehouse);
  const setQty = useCartStore((s) => s.setQty);
  const addSerial = useCartStore((s) => s.addSerial);

  const [qty, setQtyLocal] = useState(1);
  const [selectedSerials, setSelectedSerials] = useState<any[]>([]);

  // No warehouse chosen → back to the list so its picker can resolve one.
  useEffect(() => {
    if (!warehouse?.id) {
      router.replace("/order");
      return;
    }
    // Warehouse-scoped detail — stock/price/serials for the locked warehouse.
    fetchProductDetail(String(uid), warehouse.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, warehouse?.id]);

  const isKartuPerdana = useMemo(
    () => productDetail?.category?.toLowerCase().includes("kartu perdana"),
    [productDetail]
  );

  const stock = productDetail?.stock ?? 0;
  const price = productDetail?.price ?? 0;
  const promos = productDetail?.activePromos || [];
  const effectiveQty = isKartuPerdana ? selectedSerials.length : qty;
  const { active: activePromo, next: nextPromo } = describePromos(
    promos,
    effectiveQty
  );
  const line = lineWithPromo(price, effectiveQty, promos);

  // Pre-fill from cart: serial lines hydrate the checkboxes, others the stepper.
  useEffect(() => {
    if (!productDetail?.id) return;
    const items = useCartStore.getState().items;
    const inCartSn = items.find(
      (i) => i?.productId === productDetail.id && i?.serials?.length > 0
    );
    if (inCartSn) {
      setSelectedSerials(inCartSn.serials);
      return;
    }
    const inCartQty = items.find(
      (i) =>
        i?.productId === productDetail.id &&
        (!i?.serials || i.serials.length === 0)
    );
    if (inCartQty && inCartQty.quantity > 0) {
      setQtyLocal(inCartQty.quantity);
    }
  }, [productDetail?.id]);

  const toggleSerial = (v: any) =>
    setSelectedSerials((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const onChangeQty = (v: number) => {
    if (v > stock) {
      toast.warning(
        "Melebihi stok",
        `Jumlah melebihi stok yang tersedia (stok: ${stock}).`
      );
      return;
    }
    // Allow transient 0 / empty while editing; clamp to >=1 on blur (commitQty).
    setQtyLocal(v);
  };

  const commitQty = () => {
    if (qty < 1) setQtyLocal(1);
  };

  const handleAddToCart = () => {
    if (!productDetail) return;
    const cartProduct = {
      id: productDetail.id,
      productName: productDetail.productName,
      productCode: productDetail.uid,
      salesPrice: productDetail.price ?? 0,
      imageBase64: productDetail.imageList?.[0]?.imageBase64,
      imageContentType: productDetail.imageList?.[0]?.contentType,
      promos: productDetail.activePromos || [],
    };
    if (isKartuPerdana) {
      if (selectedSerials.length === 0) {
        toast.warning("Perhatian", "Pilih minimal satu nomor perdana");
        return;
      }
      addSerial(cartProduct, selectedSerials);
    } else {
      if (qty <= 0) return;
      setQty(cartProduct, qty);
    }
    router.back();
  };

  return {
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    setImagetoView,
    isKartuPerdana,
    promos,
    activePromo,
    nextPromo,
    line,
    stock,
    price,
    qty,
    effectiveQty,
    selectedSerials,
    toggleSerial,
    onChangeQty,
    commitQty,
    handleAddToCart,
  };
};

export default useOrderDetailController;
