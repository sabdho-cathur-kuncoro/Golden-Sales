import { getNotifCountService } from "@/services/notification.services";
import { useAuthStore } from "@/stores/auth.store";
import { create } from "zustand";

type NotifState = {
  unread: number;
  refetch: () => Promise<void>;
};

let pollTimer: ReturnType<typeof setInterval> | null = null;
export const POLL_INTERVAL = 20000; // 20s — matches web NotificationContext

export const useNotificationStore = create<NotifState>((set) => ({
  unread: 0,
  refetch: async () => {
    // gate on auth (mirrors cart.store customerId guard)
    if (!useAuthStore.getState().token) return;
    try {
      const res: any = await getNotifCountService();
      set({ unread: res?.unread ?? res?.data?.unread ?? 0 });
    } catch {
      // silent — a background badge poll must never toast
    }
  },
}));

/** Unread count — use as a zustand selector for the bell badge. */
export const selectNotifUnread = (s: NotifState): number => s.unread;

export function startNotifPolling() {
  if (pollTimer) return;
  useNotificationStore.getState().refetch();
  pollTimer = setInterval(
    () => useNotificationStore.getState().refetch(),
    POLL_INTERVAL
  );
}

export function stopNotifPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
