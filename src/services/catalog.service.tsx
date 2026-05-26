// import { APIBEARER } from "@/constants/API";

import { KatalogGlobalDetail, KatalogProduk } from "@/constants/dummy";

export async function getCategoriesProduct() {
  try {
    // const res = await APIBEARER.get("svc/Categories/GetDataUnDeleted");
    // const status = res.status;
    // const data = res.data;
    // if (status === 200) {
    //   return data;
    // }
    // return [];
    const data = KatalogProduk;
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ?? err?.message ?? "Something went wrong"
    );
  }
}

export async function getDetailsCategoryProduct(id: number) {
  try {
    // const res = await APIBEARER.get(
    //   `svc/SubCategories/GetDataByCategoryId/${id}`
    // );
    // const status = res.status;
    // const data = res.data;
    // if (status === 200) {
    //   return data;
    // }
    // return [];
    const data = KatalogGlobalDetail;
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ?? err?.message ?? "Something went wrong"
    );
  }
}
