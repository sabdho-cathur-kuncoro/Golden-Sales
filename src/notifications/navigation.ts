import { useNotificationStore } from "@/stores/notification.store";
import notifee from "@notifee/react-native";
import { router } from "expo-router";

/**
 * Runs when the user opens the app by tapping a notification (req #2, #4).
 * Body-tap only — no in-tray action buttons.
 *
 * - clears the tapped notification (or all) from the tray
 * - resets the app icon badge
 * - refreshes the in-app unread count so the header bell stays in sync
 * - navigates to the deep-link route the backend put in `data.route`
 */
export async function handleNotificationOpen(
  data: Record<string, string> | undefined
): Promise<void> {
  try {
    if (data?.notifId) {
      await notifee.cancelNotification(data.notifId);
    } else {
      await notifee.cancelAllNotifications();
    }
    await notifee.setBadgeCount(0);
  } catch {
    // display cleanup must never block navigation
  }

  // keep header bell badge honest
  useNotificationStore.getState().refetch();

  const route = data?.route;
  if (route) {
    // e.g. "/approval-detail?id=123"
    router.push(route as any);
  }
}
