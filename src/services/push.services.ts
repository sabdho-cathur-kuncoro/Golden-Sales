import { Config } from "@/constants/API";
import { useAuthStore } from "@/stores/auth.store";
import { getApiErrorMessage } from "@/utils/apiError";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  getToken,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";
import axios from "axios";

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
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
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
export async function subscribeTokenWithBackend(topic: string): Promise<void> {
  const token = useAuthStore.getState().token;
  try {
    await axios.post(`${Config.URL}/dev/fcm/subscribe`, {
      token,
      topic,
    });
  } catch (err: any) {
    if (__DEV__) console.log("registerTokenWithBackend", err);
    throw new Error(getApiErrorMessage(err));
  }
}

export async function unsubscribeTokenWithBackend(
  topic: string
): Promise<void> {
  const token = useAuthStore.getState().token;
  try {
    await axios.post(`${Config.URL}/dev/fcm/unsubscribe`, {
      token,
      topic,
    });
  } catch (err: any) {
    if (__DEV__) console.log("registerTokenWithBackend", err);
    throw new Error(getApiErrorMessage(err));
  }
}
