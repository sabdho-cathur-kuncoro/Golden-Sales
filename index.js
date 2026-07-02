// Custom entry: register FCM/notifee background handlers at MODULE SCOPE
// (outside the React tree) so background & killed-state delivery works.
// Must run before the app mounts — hence require("expo-router/entry") last.
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { displayFcmMessage } from "./src/notifications/display";

// Background/killed FCM data message → render via notifee (req #1)
setBackgroundMessageHandler(getMessaging(getApp()), async (message) => {
  await displayFcmMessage(message);
});

// Tap handling while app is in background/killed: clear the tray entry.
// Cold-start navigation is resolved by notifee.getInitialNotification()
// in usePushNotifications once the app is up (req #2, #4).
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification?.id) {
    await notifee.cancelNotification(detail.notification.id);
  }
});

require("expo-router/entry");
