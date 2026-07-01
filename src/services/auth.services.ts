import { APIBASIC, APIBEARER } from "@/constants/API";
import { useAuthStore } from "@/stores/auth.store";
import { getApiErrorMessage } from "@/utils/apiError";

export async function getProfileService() {
  try {
    const res = await APIBEARER.get("/me");
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      const user = dataRes?.data ?? dataRes;

      useAuthStore.getState().setUser(user);
      return status;
    }
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onUpdateProfileService(form: any, controller?: any) {
  try {
    // form: { phone, email, username }
    const res = await APIBEARER.post("/me/profile", form, {
      signal: controller?.signal,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes?.data ?? dataRes;
    }
    return status;
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onLoginService(form: any, controller: any) {
  try {
    const res = await APIBASIC.post("/login", form, {
      signal: controller.signal,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      const token = dataRes?.token;
      const user = dataRes;
      const dataLogin = {
        token,
        user,
      };

      await useAuthStore.getState().login(dataLogin);
      return status;
    }
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onSignupService(form: any, controller: any) {
  try {
    const res = await APIBASIC.post("/register", form, {
      signal: controller.signal,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes.code;
    }
    return status;
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onForgotPasswordVerifyService(
  form: any,
  controller: any
) {
  try {
    // form: { phone, email }
    const res = await APIBASIC.post("/forgot-password/verify", form, {
      signal: controller.signal,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return {
        resetToken: dataRes.resetToken,
        customerName: dataRes.customerName ?? "",
      };
    }
    return status;
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onForgotPasswordResetService(
  resetToken: string,
  newPassword: string,
  controller: any
) {
  try {
    const form = { resetToken, newPassword };
    const res = await APIBASIC.post("/forgot-password/reset", form, {
      signal: controller.signal,
    });
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes.code;
    }
    return status;
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function onChangePasswordService(form: any, controller: any) {
  try {
    const res = await APIBASIC.post("/me/password", form, {
      signal: controller.signal,
    }); // currentPassword, newPassword
    const status = res.status;
    const dataRes = res.data;
    if (status === 200) {
      return dataRes.code;
    }
    return status;
  } catch (err: any) {
    throw new Error(getApiErrorMessage(err));
  }
}
