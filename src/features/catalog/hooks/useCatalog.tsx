import { useToast } from "@/features/shared/hooks/useToast";
import { useCallback, useState } from "react";
import { getCategoriesProduct, getDetailsCategoryProduct } from "../services";

const useCatalog = () => {
  const toast = useToast();
  const [catalogItem, setCatalogItem] = useState<any>([]);
  const [detailCatalogItem, setDetailCatalogItem] = useState<any>([]);

  const fetchCatalog = useCallback(() => {
    onGetCategories();
  }, []);

  const fetchDetailCatalog = useCallback((id: number) => {
    onGetDetailCategories(id);
  }, []);

  async function onGetCategories() {
    try {
      const data = await getCategoriesProduct();
      setCatalogItem(data ?? []);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    }
  }

  async function onGetDetailCategories(id: number) {
    try {
      const data = await getDetailsCategoryProduct(id);
      setDetailCatalogItem(data ?? []);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    }
  }
  return { catalogItem, detailCatalogItem, fetchCatalog, fetchDetailCatalog };
};

export default useCatalog;
