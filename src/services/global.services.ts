import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getWarehousesService() {
  try {
    const res = await APIBEARER.get("/warehouses");
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

export async function getSlidersService() {
  try {
    const res = await APIBEARER.get("/sliders");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      const dataSliders = dataRes.map((s: any) => {
        return {
          id: s.id,
          image: s.imageBase64,
        };
      });
      return dataSliders;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function getFlashSaleService() {
  try {
    const res = await APIBEARER.get("/flash-sales");
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
