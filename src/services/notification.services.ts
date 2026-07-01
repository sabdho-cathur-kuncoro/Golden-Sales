import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getNotifService(paramsHeader: any) {
  try {
    const res = await APIBEARER.get("/notifications", { params: paramsHeader }); // pageSize: 50
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

export async function getNotifCountService() {
  try {
    const res = await APIBEARER.get("/notifications/count");
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

export async function onReadNotifService(notif: any) {
  try {
    const res = await APIBEARER.post(`/notifications/${notif.id}/read`);
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

export async function onReadAllNotifService() {
  try {
    const res = await APIBEARER.post("/notifications/read-all");
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
