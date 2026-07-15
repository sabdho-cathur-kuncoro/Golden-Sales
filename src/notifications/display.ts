import notifee from "@notifee/react-native";
import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { DEFAULT_CHANNEL_ID } from "./channels";
import { resolveTrayId } from "./tray";

/**
 * Render an incoming FCM message via notifee. Used in every state:
 * foreground (onMessage) and background/killed (setBackgroundMessageHandler),
 * so display looks identical regardless of app state (req #1, #3).
 *
 * Backend sends FCM **data** messages: { title, body, route, notifId, channelId }.
 * Using data-only messages lets notifee own display consistently.
 */
export async function displayFcmMessage(
  message: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  const data = (message.data ?? {}) as Record<string, string>;
  const title = data.title ?? message.notification?.title ?? "";
  const body = data.body ?? message.notification?.body ?? "";
  const channelId = data.channelId ?? DEFAULT_CHANNEL_ID;

  // Deterministic id: backend notifId, else FCM messageId. Mirror it back into
  // data so tap handlers and the in-app matcher all target the same id.
  const trayId = resolveTrayId(message);
  if (trayId) data.notifId = trayId;

  await notifee.displayNotification({
    // stable id → dedupe + targeted cancel on open (req #4). Omit when neither
    // notifId nor messageId exists: notifee rejects "" / undefined.
    ...(trayId ? { id: trayId } : {}),
    title,
    body,
    data,
    android: {
      channelId,
      pressAction: { id: "default", launchActivity: "default" },
      smallIcon: "ic_notification", // falls back to app icon if absent
      color: "#B20605",
    },
    ios: {
      // let iOS manage the badge from the server-side aps.badge if present
    },
  });
}
