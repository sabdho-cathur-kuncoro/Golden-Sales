import { useAuthStore } from "@/stores/auth.store";
import { reportLatencySample, SLOW_REQUEST_MS } from "@/stores/network.store";
import { useToastStore } from "@/stores/toast.store";
import { create } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";
import { startNetworkLogging } from "react-native-network-logger";
import { ENABLE_DEV_TOOLS } from "./flags";
import { redColor } from "./theme";

// Patch XHR before any axios instance/request so all API traffic is captured.
if (ENABLE_DEV_TOOLS) {
  startNetworkLogging({ maxRequests: 200 });
}

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const bearerUat = Constants.expoConfig!.extra!.BEARER_UAT;
const bearerPrd = Constants.expoConfig!.extra!.BEARER_PRD;

export const Config = {
  URL: API_URL,
  BASE_URL: API_URL + "/sales",
  API_TIMEOUT: 60 * 1000,
  BEARER: bearerPrd,
};

export const APIBASIC = create({
  baseURL: Config.BASE_URL,
  timeout: Config.API_TIMEOUT,
});

export const APIBEARER = create({
  baseURL: Config.BASE_URL,
  timeout: Config.API_TIMEOUT,
});

// --- Connection-quality monitor ---------------------------------------------
// Time every request; a slow response or a timeout feeds a "bad" sample to the
// network store (drives the "Koneksi tidak stabil" banner). A plain offline
// error is NOT sampled here — NetInfo already owns the offline state.
const isTimeout = (err: any): boolean =>
  err?.code === "ECONNABORTED" || /timeout/i.test(err?.message ?? "");
const isOfflineError = (err: any): boolean =>
  err?.code === "ERR_NETWORK" || (err?.request && !err?.response);

function attachLatencyMonitor(instance: ReturnType<typeof create>) {
  instance.interceptors.request.use((config: any) => {
    config.metadata = { start: Date.now() };
    return config;
  });
  instance.interceptors.response.use(
    (response: any) => {
      const start = response.config?.metadata?.start;
      if (start) reportLatencySample(Date.now() - start > SLOW_REQUEST_MS);
      return response;
    },
    (error: any) => {
      if (isTimeout(error)) {
        reportLatencySample(true);
      } else if (!isOfflineError(error)) {
        const start = error.config?.metadata?.start;
        if (start) reportLatencySample(Date.now() - start > SLOW_REQUEST_MS);
      }
      return Promise.reject(error);
    }
  );
}

attachLatencyMonitor(APIBASIC);
attachLatencyMonitor(APIBEARER);

APIBEARER.interceptors.request.use(
  async (config: any) => {
    const token = useAuthStore.getState().token;
    if (token) {
      // Ensure headers exists
      if (!config.headers) {
        config.headers = {};
      }

      const headers: any = config.headers;

      if (typeof headers.set === "function") {
        headers.set("Authorization", `${Config.BEARER} ${token}`);
      } else {
        // Fallback for plain object headers
        headers["Authorization"] = `${Config.BEARER} ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    new Promise((resolve, reject) => {
      reject(error);
    });
  }
);

// 401 auto-refresh. Single-flight: the first 401 runs POST /refresh; any other
// requests that 401 while a refresh is in flight queue up and replay once the
// new token lands (avoids a refresh stampede). If refresh itself fails, we log
// out and bounce to /login.
let isRefreshing = false;
let pending: ((newToken: string) => void)[] = [];

function setAuthHeader(config: any, token: string) {
  if (!config.headers) config.headers = {};
  const headers: any = config.headers;
  if (typeof headers.set === "function") {
    headers.set("Authorization", `${Config.BEARER} ${token}`);
  } else {
    headers["Authorization"] = `${Config.BEARER} ${token}`;
  }
}

APIBEARER.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    // Only attempt a refresh for a real 401 we haven't already retried, and
    // only when we actually hold a refresh token.
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshToken
    ) {
      return Promise.reject(error);
    }

    // A refresh is already running — wait for it, then replay this request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push((newToken: string) => {
          originalRequest._retry = true;
          setAuthHeader(originalRequest, newToken);
          APIBEARER(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // APIBASIC (no auth interceptor) → no recursive 401 loop.
      const res = await APIBASIC.post("/refresh", { refreshToken });
      const newToken = res.data?.token;
      const newRefreshToken = res.data?.refreshToken;

      if (!newToken) {
        throw new Error("Refresh response missing token");
      }

      await useAuthStore.getState().updateTokens(newToken, newRefreshToken);

      // Release queued requests, then replay the original.
      pending.forEach((cb) => cb(newToken));
      pending = [];

      setAuthHeader(originalRequest, newToken);
      return APIBEARER(originalRequest);
    } catch (refreshError) {
      pending = [];
      await useAuthStore.getState().logout();
      useToastStore.getState().showToast({
        title: "Sesi Berakhir",
        message: "Sesi Anda telah berakhir. Silakan masuk kembali.",
        icon: "error",
        color: redColor as string,
        borderColor: "rgba(248,113,113,0.18)",
        fromBGColor: "#7F1D1D",
        toBGColor: "#450A0A",
      });
      router.replace("/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
