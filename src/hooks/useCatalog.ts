import { useCallback, useState } from "react";
import {
  getCategoriesProduct,
  getDetailsCategoryProduct,
} from "../services/catalog.services";
import { useToast } from "./useToast";

const useCatalog = () => {
  const toast = useToast();
  const [catalogItem, setCatalogItem] = useState<any>([]);
  const [detailCatalogItem, setDetailCatalogItem] = useState<any>([]);

  const fetchCatalog = useCallback(() => {
    onGetCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDetailCatalog = useCallback((id: number) => {
    onGetDetailCategories(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
