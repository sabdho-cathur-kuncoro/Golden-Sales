import { APIBEARER } from "@/constants/API";
import { cartCache } from "@/storage/cart.cache";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getCartsService() {
  try {
    const res = await APIBEARER.get("/cart");
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

/**
 * Online-first: fetch cart, refresh local cache (respecting unsynced local
 * changes), return fresh data. Offline/error: fall back to cached cart.
 */
export async function getCartsCachedService() {
  try {
    const data = await getCartsService();
    if (Array.isArray(data) && data.length > 0) {
      await cartCache.upsertFromServer(data);
    }
    return data;
  } catch (err) {
    if (__DEV__) {
      console.log("[getCartsCachedService] falling back to cache", err);
    }
    return cartCache.getAll();
  }
}

// NOTE: push endpoints below assume a REST shape (POST/PUT/DELETE /cart).
// Adjust paths/payloads once the real cart API is confirmed.

export async function onAddCartService(payload: any) {
  try {
    const res = await APIBEARER.post("/cart", payload);
    const status = res.status;
    const dataRes = res.data;
    if (status === 200 || status === 201) {
      return dataRes;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onUpdateCartService(payload: any) {
  try {
    const res = await APIBEARER.put(`/cart`, payload);
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

export async function onDeleteCartService(id: string) {
  try {
    const res = await APIBEARER.delete(`/cart/${id}`);
    const status = res.status;
    if (status === 200 || status === 204) {
      return true;
    }
    return false;
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}
