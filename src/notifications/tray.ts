import notifee from "@notifee/react-native";
import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";

/**
 * Notification tray lifecycle — the single place that clears OS tray entries
 * and the app-icon badge. Kept dependency-light (notifee only) so it can be
 * imported at module scope from the entry file (index.js) as well as the app.
 */

/**
 * Deterministic tray id for a message. Prefers the backend `notifId`, falls
 * back to the FCM `messageId` so a displayed notification ALWAYS has a stable,
 * targetable id (even when the backend sends none). Returns undefined only when
 * neither exists — notifee then auto-generates a random id.
 */
export function resolveTrayId(
  message: FirebaseMessagingTypes.RemoteMessage
): string | undefined {
  const notifId = (message.data?.notifId as string | undefined) || undefined;
  return notifId || message.messageId || undefined;
}

/**
 * Clear a tray entry + reset the badge. With an id → targeted cancel; without →
 * clear the whole tray. Never throws: display cleanup must not block callers
 * (navigation, mark-all).
 */
export async function dismissTray(id?: string): Promise<void> {
  try {
    if (id) {
      await notifee.cancelNotification(id);
    } else {
      await notifee.cancelAllNotifications();
    }
    await notifee.setBadgeCount(0);
  } catch {
    // best-effort cleanup
  }
}

const orderIdFromRoute = (route?: string): string | undefined => {
  if (!route) return undefined;
  // matches "...?id=123" or a trailing "/123" segment
  const q = route.match(/[?&]id=([^&]+)/);
  if (q) return q[1];
  const seg = route.match(/\/(\d+)(?:[/?#]|$)/);
  return seg ? seg[1] : undefined;
};

/**
 * Targeted cancel from the in-app notification list. The API row carries no
 * `notifId`, so we reconcile against what's actually displayed: each tray entry
 * keeps its original FCM `data`, so match the row to a displayed notification by
 * any shared field and cancel that exact entry. No match → no-op (the row is
 * still marked read by the caller).
 */
export async function dismissTrayForItem(item: any): Promise<void> {
  try {
    const displayed = await notifee.getDisplayedNotifications();
    if (!displayed.length) return;

    const rowId = item?.notifId ?? item?.messageId ?? item?.message_id;
    const rowOrderId = item?.orderId ?? item?.order_id;
    const rowLink = item?.link;

    const match = displayed.find((d) => {
      const data = (d.notification?.data ?? {}) as Record<string, any>;
      if (rowId != null && String(data.notifId) === String(rowId)) return true;
      if (rowLink && data.route === rowLink) return true;
      if (rowOrderId != null) {
        const trayOrderId = data.orderId ?? orderIdFromRoute(data.route);
        if (trayOrderId != null && String(trayOrderId) === String(rowOrderId)) {
          return true;
        }
      }
      return false;
    });

    if (match?.notification?.id) {
      await notifee.cancelDisplayedNotification(match.notification.id);
      await notifee.setBadgeCount(0);
    }
  } catch {
    // best-effort cleanup
  }
}
