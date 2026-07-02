import { APIBEARER } from "@/constants/API";
import { getApiErrorMessage } from "@/utils/apiError";
import { getApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";

// Lazy accessor: mirror the old namespaced `messaging()` (resolved per-call,
// after native init) rather than a module-scope instance.
const fcm = () => getMessaging(getApp());

/**
 * FCM transport wrappers. Display/channels/badge live in the notifee layer
 * (see src/notifications/*). These only deal with permission, token, topics,
 * and backend registration.
 */

/** Ask the OS for push permission. Returns true if authorized/provisional. */
export async function requestPushPermission(): Promise<boolean> {
  try {
    const status = await requestPermission(fcm());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (err: any) {
    if (__DEV__) console.log("requestPushPermission", err);
    return false;
  }
}

/** Current FCM registration token for this device (null on failure). */
export async function getFcmToken(): Promise<string | null> {
  try {
    return await getToken(fcm());
  } catch (err: any) {
    if (__DEV__) console.log("getFcmToken", err);
    return null;
  }
}

export async function subscribeTopic(topic: string): Promise<void> {
  try {
    await subscribeToTopic(fcm(), topic);
  } catch (err: any) {
    if (__DEV__) console.log("subscribeTopic", topic, err);
  }
}

export async function unsubscribeTopic(topic: string): Promise<void> {
  try {
    await unsubscribeFromTopic(fcm(), topic);
  } catch (err: any) {
    if (__DEV__) console.log("unsubscribeTopic", topic, err);
  }
}

/**
 * Register the FCM token with the backend so the server can target this device.
 * TODO: confirm endpoint + payload shape with backend team.
 */
export async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    await APIBEARER.post("/notifications/device-token", {
      token,
      platform: "expo",
    });
  } catch (err: any) {
    if (__DEV__) console.log("registerTokenWithBackend", err);
    throw new Error(getApiErrorMessage(err));
  }
}
