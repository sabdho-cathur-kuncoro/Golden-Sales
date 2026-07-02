import { useNotificationAccess } from "@/hooks/useNotificationAccess";
import {
  getFcmToken,
  registerTokenWithBackend,
  subscribeTopic,
} from "@/services/push.services";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import notifee, { EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect, useRef } from "react";
import { ensureChannels } from "./channels";
import { displayFcmMessage } from "./display";
import { handleNotificationOpen } from "./navigation";

/** Topics every authenticated sales user gets. TODO: confirm taxonomy + add
 *  role/region topics from the user object once backend defines them. */
const DEFAULT_TOPICS = ["sales"];

/**
 * Foreground push wiring (req #1 fg, #2 tap, #3 display, #4 clear-on-open).
 * Background/killed *receipt* is registered separately at the entry module
 * (see index.js) — must be top-level, outside the React tree.
 *
 * Gated on auth: token registration + topic subscribe need a logged-in user.
 * Re-runs on login/logout.
 */
export function usePushNotifications(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { request } = useNotificationAccess();

  // request() is re-created every render → keep latest in a ref so the effect
  // only re-runs on auth changes, not on every render.
  const requestRef = useRef(request);
  requestRef.current = request;

  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubMessage: (() => void) | undefined;
    let unsubOpened: (() => void) | undefined;
    let unsubForeground: (() => void) | undefined;
    let unsubTokenRefresh: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      await ensureChannels();

      const granted = await requestRef.current();
      if (!granted || cancelled) return;

      const token = await getFcmToken();
      if (token) await registerTokenWithBackend(token).catch(() => {});
      await Promise.all(DEFAULT_TOPICS.map(subscribeTopic));

      // killed-state cold start: app launched by tapping a notification.
      // notifee path covers data messages it displayed; messaging path covers
      // FCM "notification" messages the OS displayed directly.
      const notifeeInitial = await notifee.getInitialNotification();
      if (notifeeInitial) {
        await handleNotificationOpen(
          notifeeInitial.notification.data as any
        );
      } else {
        const fcmInitial = await messaging().getInitialNotification();
        if (fcmInitial) await handleNotificationOpen(fcmInitial.data as any);
      }

      if (cancelled) return;

      // foreground FCM → display via notifee + refresh bell
      unsubMessage = messaging().onMessage(async (m) => {
        await displayFcmMessage(m);
        useNotificationStore.getState().refetch();
      });

      // background → tapped to foreground
      unsubOpened = messaging().onNotificationOpenedApp((m) =>
        handleNotificationOpen(m.data as any)
      );

      // tap on a notifee-displayed notification while app is foregrounded
      unsubForeground = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
          handleNotificationOpen(detail.notification?.data as any);
        }
      });

      // token rotates → re-register
      unsubTokenRefresh = messaging().onTokenRefresh((t) =>
        registerTokenWithBackend(t).catch(() => {})
      );
    })();

    return () => {
      cancelled = true;
      unsubMessage?.();
      unsubOpened?.();
      unsubForeground?.();
      unsubTokenRefresh?.();
    };
  }, [isAuthenticated]);
}
