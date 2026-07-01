import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getSellStockService() {
  try {
    const res = await APIBEARER.get("/sell/stock");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // { totalQty, groups: [{ productId, productName, productNumber, qty, unitPrice, items: [{ sn }] }] }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function checkSellService(qr: string) {
  try {
    const res = await APIBEARER.get("/sell/check", { params: { qr } });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // { success, message, item: { sn, productId, productName, productNumber, unitPrice } }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function getCustomersService(params?: {
  q?: string;
  status?: string;
}) {
  try {
    const res = await APIBEARER.get("/customers", {
      params: {
        q: params?.q || undefined,
        status: params?.status || undefined,
      },
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // [{ id, customerName, customerCode, status, phone, address1, regency, hasPendingApproval }]
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function getPendingRegistrationsService() {
  try {
    const res = await APIBEARER.get("/registrations/pending");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // [{ id, customerName, customerCode, phone, status, approvalNotes }]
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function getCustomerDetailService(id: string | number) {
  try {
    const res = await APIBEARER.get(`/customers/${id}`);
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // { customerName, customerCode, status, contactPerson, phone, email, address1, city, regency, pending: { newStatus, reason } | null }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function requestCustomerStatusService(
  id: string | number,
  data: { newStatus: string; reason: string }
) {
  try {
    const res = await APIBEARER.post(`/customers/${id}/status-request`, data);
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes;
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal mengirim request"));
  }
}

export async function getSalesWarehousesService() {
  try {
    const res = await APIBEARER.get("/warehouses");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // [{ id, name, code }]
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function checkCustomerCodeService(code: string) {
  try {
    const res = await APIBEARER.get("/customers/check-code", {
      params: { code },
    });
    if (res.status === 200) {
      return res.data; // { available: boolean, message?: string }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function checkCustomerPhoneService(phone: string) {
  try {
    const res = await APIBEARER.get("/customers/check-phone", {
      params: { phone },
    });
    if (res.status === 200) {
      return res.data; // { available: boolean, message?: string }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}

export async function createCustomerService(payload: any) {
  try {
    const res = await APIBEARER.post("/customers", payload);
    const status = res.status;
    const dataRes = res.data;
    if (status === 200 || status === 201) {
      return dataRes; // { message?: string }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal mendaftar customer"));
  }
}

export async function getSellHistoryService(params?: {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const res = await APIBEARER.get("/sell/history", {
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
        search: params?.search || undefined,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
    });
    if (res.status === 200) {
      return res.data; // { data: [{ saleNumber, soldAt, itemCount, total }], totalPages, totalRecords }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal memuat penjualan"));
  }
}

export async function getSellHistoryDetailService(ref: string) {
  try {
    const res = await APIBEARER.get(
      `/sell/history/${encodeURIComponent(ref)}`
    );
    if (res.status === 200) {
      return res.data; // { items: [{ valueId, productName, productNumber, sn, unitPrice }] }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal memuat detail"));
  }
}

export async function getReturnHistoryService(params?: {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const res = await APIBEARER.get("/returns/history", {
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
        search: params?.search || undefined,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
    });
    if (res.status === 200) {
      return res.data; // { data: [{ returnNumber, returnedAt, itemCount, total }], totalPages, totalRecords }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal memuat pengembalian"));
  }
}

export async function getReturnHistoryDetailService(ref: string) {
  try {
    const res = await APIBEARER.get(
      `/returns/history/${encodeURIComponent(ref)}`
    );
    if (res.status === 200) {
      return res.data; // { items: [{ valueId, productName, productNumber, sn, unitPrice }] }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal memuat detail"));
  }
}

export async function getSalesManualService() {
  try {
    const res = await APIBEARER.get("/manual");
    if (res.status === 200) {
      return res.data; // { base64, contentType, fileName, title?, snippet? }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err, "Gagal memuat manual"));
  }
}

export async function submitSellService(data: any) {
  try {
    const res = await APIBEARER.post("/sell", data); // { items: [{ qr, unitPrice }], buyerName, buyerPhone }
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes; // { success, message, totalAmount }
    }
  } catch (err: any) {
    if (__DEV__) {
      console.log(err);
    }
    throw new Error(getApiErrorMessage(err));
  }
}
