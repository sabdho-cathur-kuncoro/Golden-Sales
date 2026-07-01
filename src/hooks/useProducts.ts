import {
  getDetailProductsService,
  getProductsCachedService,
} from "@/services/products.services";
import { productsCache } from "@/storage/product.cache";
import { useCallback, useState } from "react";
import { useToast } from "./useToast";

const useProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [imgView, setImgView] = useState<string | null>(null);
  const [imgList, setImgList] = useState<any>([]);
  const [stockList, setStockList] = useState<any>([]);

  const fetchProducts = useCallback((warehouseId?: any) => {
    onGetProducts(warehouseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProductDetail = useCallback((uid: string, warehouseId?: any) => {
    onGetProductDetail(uid, warehouseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setImagetoView = useCallback((val: any) => {
    setImgView(val);
  }, []);

  async function onGetProducts(warehouseId?: any) {
    setLoading(true);
    try {
      const data = await getProductsCachedService(warehouseId);
      setProducts(Array.isArray(data) ? data : []);
      const scope =
        warehouseId != null && warehouseId !== "" ? String(warehouseId) : "all";
      setLastSync(await productsCache.getUpdatedAt(scope));
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGetProductDetail(uid: string, warehouseId?: any) {
    setDetailLoading(true);
    try {
      const data = await getDetailProductsService(uid, warehouseId);
      const listImg = data?.imageList;
      const base64Img = listImg[0]?.imageBase64;
      const listStock = data?.stockList;
      setProductDetail(data ?? null);
      setImgList(listImg);
      setImgView(base64Img ?? null);
      setStockList(listStock);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    } finally {
      setDetailLoading(false);
    }
  }

  return {
    products,
    loading,
    lastSync,
    fetchProducts,
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    fetchProductDetail,
    setImagetoView,
  };
};

export default useProducts;
