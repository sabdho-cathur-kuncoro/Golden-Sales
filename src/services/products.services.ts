import { APIBEARER } from "@/constants/API";
import { productsCache } from "@/storage/product.cache";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getProductsService(warehouseId?: any) {
  try {
    const res = await APIBEARER.get("/products/GetAll", {
      params: warehouseId ? { warehouseId } : undefined,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

// Cache scope: per-warehouse (Order) vs "all" (global Katalog), so the two
// lists don't overwrite each other's cached rows.
const cacheScope = (warehouseId?: any) =>
  warehouseId != null && warehouseId !== "" ? String(warehouseId) : "all";

/**
 * Online-first: fetch, refresh cache, return fresh data.
 * Offline/error: fall back to the SQLite-cached products for this scope.
 */
export async function getProductsCachedService(warehouseId?: any) {
  const scope = cacheScope(warehouseId);
  try {
    const data = await getProductsService(warehouseId);
    if (Array.isArray(data) && data.length > 0) {
      await productsCache.upsertMany(data, scope);
    }
    return data;
  } catch (err) {
    if (__DEV__) {
      console.log(
        `[getProductsCachedService] falling back to cache (scope=${scope})`,
        err
      );
    }
    return productsCache.getAll(scope);
  }
}

export async function getDetailProductsService(id: string, warehouseId?: any) {
  try {
    const res = await APIBEARER.get(`/products/Details/${id}`, {
      params: warehouseId ? { warehouseId } : undefined,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err?.response?.data);
    }
    throw new Error(getApiErrorMessage(err));
  }
}
