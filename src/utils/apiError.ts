/**
 * Maps a raw axios/network error into a user-friendly Bahasa Indonesia message.
 * Use inside service catch blocks: `throw new Error(getApiErrorMessage(err))`.
 *
 * Resolution order: no-connection > timeout > backend message > status map > fallback.
 * A message supplied by the backend (`response.data.message`) is always kept as-is.
 */

const DEFAULT_MESSAGE = "Terjadi Kesalahan";

export const STATUS_MESSAGES: Record<number, string> = {
  400: "Permintaan tidak valid.",
  401: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  403: "Anda tidak memiliki akses untuk tindakan ini.",
  404: "Data tidak ditemukan.",
  422: "Data yang dikirim tidak valid.",
  429: "Terlalu banyak permintaan. Coba lagi sebentar.",
  500: "Server sedang bermasalah. Silakan coba lagi nanti.",
  502: "Server sedang bermasalah. Silakan coba lagi nanti.",
  503: "Server sedang bermasalah. Silakan coba lagi nanti.",
  504: "Server sedang bermasalah. Silakan coba lagi nanti.",
};

const NETWORK_MESSAGE =
  "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
const TIMEOUT_MESSAGE = "Koneksi ke server timeout. Silakan coba lagi.";

export function getApiErrorMessage(
  err: any,
  fallback: string = DEFAULT_MESSAGE
): string {
  const code: string | undefined = err?.code;
  const rawMessage: string =
    typeof err?.message === "string" ? err.message : "";

  // 1. No connection — request sent but no response, or axios network error.
  if (
    code === "ERR_NETWORK" ||
    (err?.request && !err?.response) ||
    /network error/i.test(rawMessage)
  ) {
    return NETWORK_MESSAGE;
  }

  // 2. Timeout.
  if (code === "ECONNABORTED" || /timeout/i.test(rawMessage)) {
    return TIMEOUT_MESSAGE;
  }

  // 3. Backend-provided message — trust it, it's already user-facing.
  const backendMessage = err?.response?.data?.message;
  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage;
  }

  // 4. Known HTTP status.
  const status: number | undefined = err?.response?.status;
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  // 5. Fallback (caller-supplied, defaults to DEFAULT_MESSAGE).
  return fallback;
}
