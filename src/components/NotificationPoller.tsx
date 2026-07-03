import {
  refetchNotifCount,
  useNotificationStore,
} from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";
import { AppState } from "react-native";

/**
 * Headless: drives the notification unread-count badge.
 * Refetches on login and on app foreground (RN equivalent of the web
 * `visibilitychange`); push (FCM) covers live updates. Clears on logout.
 */
function NotificationPoller() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      useNotificationStore.setState({ unread: 0 });
      return;
    }
    refetchNotifCount();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refetchNotifCount();
      }
    });
    return () => {
      sub.remove();
    };
  }, [token]);

  return null;
}

export default NotificationPoller;
