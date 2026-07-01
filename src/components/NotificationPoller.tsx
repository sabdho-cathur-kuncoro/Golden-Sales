import {
  startNotifPolling,
  stopNotifPolling,
  useNotificationStore,
} from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";
import { AppState } from "react-native";

/**
 * Headless: drives the notification unread-count poll lifecycle.
 * Polls while authenticated, refetches on app foreground (RN equivalent of
 * the web `visibilitychange`), and stops + clears on logout.
 */
function NotificationPoller() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      stopNotifPolling();
      useNotificationStore.setState({ unread: 0 });
      return;
    }
    startNotifPolling();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        useNotificationStore.getState().refetch();
      }
    });
    return () => {
      sub.remove();
      stopNotifPolling();
    };
  }, [token]);

  return null;
}

export default NotificationPoller;
