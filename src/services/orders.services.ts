import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getOrdersService(paramsHeader: any) {
  try {
    const res = await APIBEARER.get("/orders", { params: paramsHeader }); // status, search, page, pageSize = 10
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

export async function getMyOrdersService(paramsHeader: any) {
  try {
    const res = await APIBEARER.get("/orders/mine", {
      params: paramsHeader,
    }); // status, search, page, pageSize = 10
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

export async function getDetailOrdersService(id: any) {
  try {
    const res = await APIBEARER.get(`/orders/${id}`);
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

export async function getOrderReviewService(id: any) {
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

export async function onReviewOrderService(id: any, data: any) {
  try {
    const res = await APIBEARER.post(`/orders/${id}/review`, data); // rating, comment, photo
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

export async function onSubmitOrdersService(data: any) {
  try {
    const res = await APIBEARER.post("/orders/create", data); // branchId, warehouseId, notes, deliveryMethod, paymentMethod, voucherCode, items: [{productId, quantity, serials}]
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

// Sales confirms a delivered ("Dikirim") order → marks it Selesai and pushes
// its serial numbers into the sales user's stock (sellable via Scan).
export async function completeOrderService(id: any) {
  try {
    const res = await APIBEARER.post(`/orders/${id}/complete`);
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // { success, message, snInserted }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onReceiptOrdersService(id: any) {
  try {
    const res = await APIBEARER.post(`/orders/${id}/confirm-receipt`);
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

// VOUCHER
export async function getVoucherValidateService(
  code: string,
  subTotal: number
) {
  try {
    const res = await APIBEARER.get("/vouchers/validate", {
      params: { code, subTotal },
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

// MESSAGES
export async function getOrderMessagesService(orderId: any, since: any) {
  try {
    const incremental = true;
    const params = incremental && since.current ? { since: since.current } : {};
    const res = await APIBEARER.get(`/orders/${orderId}/messages`, { params });
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

export async function onMessagesOrderService(orderId: any, draft: string) {
  try {
    const body = draft.trim();
    const res = await APIBEARER.post(`/orders/${orderId}/messages`, {
      data: body,
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

// TIMELINE ORDER
export async function getOrderTimelineService(orderId: any, since: any) {
  try {
    const incremental = true;
    const params = incremental && since.current ? { since: since.current } : {};
    const res = await APIBEARER.get(`/orders/${orderId}/timeline`, { params });
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
