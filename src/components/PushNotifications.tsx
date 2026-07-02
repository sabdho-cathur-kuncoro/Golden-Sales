import { usePushNotifications } from "@/notifications/usePushNotifications";

/** Headless mount for foreground push wiring. Sits next to NotificationPoller. */
export default function PushNotifications() {
  usePushNotifications();
  return null;
}
