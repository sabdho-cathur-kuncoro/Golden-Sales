import useProducts from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart.store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { wait } from "../../utils/helper";
import { describePromos } from "../../utils/promo";

/**
 * Katalog detail (`/katalog/[id]`) controller — browsing-only product detail:
 * load, promo ladder preview, and pull-to-refresh. No cart interaction.
 */
const useKatalogDetailController = (id: any) => {
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
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const isKartuPerdana = useMemo(
    () => productDetail?.category?.toLowerCase().includes("kartu perdana"),
    [productDetail]
  );

  const promos = productDetail?.activePromos || [];
  // Catalog is browsing-only — show the promo ladder for a sample qty of 1.
  const sampleQty = 1;
  const { active: activePromo } = describePromos(promos, sampleQty);

  useEffect(() => {
    fetchProductDetail(String(id), warehouse?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    wait(1000).then(() => {
      setRefreshing(false);
      fetchProductDetail(String(id), warehouse?.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse?.id]);

  return {
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    setImagetoView,
    refreshing,
    onRefresh,
    isKartuPerdana,
    promos,
    activePromo,
  };
};

export default useKatalogDetailController;
