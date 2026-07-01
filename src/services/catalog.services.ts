import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getCategoriesProduct() {
  try {
    const res = await APIBEARER.get("svc/Categories/GetDataUnDeleted");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes;
    }
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function getDetailsCategoryProduct(id: number) {
  try {
    const res = await APIBEARER.get(
      `svc/SubCategories/GetDataByCategoryId/${id}`
    );
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes;
    }
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}
