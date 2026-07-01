import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getApprovalService(id: any) {
  try {
    const res = await APIBEARER.get(`/orders/${id}/review`);
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

export async function onSubmitApprovalService(id: any) {
  try {
    const res = await APIBEARER.post(`/orders/${id}/approve`);
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

export async function onRejectApprovalService(id: any, rejectReason: string) {
  try {
    const res = await APIBEARER.post(`/orders/${id}/reject`, {
      reason: rejectReason,
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

export async function onDeleteApprovalService(id: any, itemId: any) {
  try {
    const res = await APIBEARER.delete(`/orders/${id}/items/${itemId}`);
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
