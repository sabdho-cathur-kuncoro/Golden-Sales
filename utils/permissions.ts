import { Platform } from "react-native";
import {
  checkNotifications,
  openSettings,
  requestNotifications,
} from "react-native-permissions";
import { Camera } from "react-native-vision-camera";

type RetryOptions = {
  requestFn: () => Promise<boolean>;
  isBlocked?: () => Promise<boolean>;
};

const isAndroidBelow13 = () =>
  Platform.OS === "android" && Platform.Version < 33;

// ===== Notification =====
// check-only → dipakai sebagai pre-check sebelum pre-permission modal,
// jangan trigger system prompt di sini.
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (isAndroidBelow13()) return true;

  const { status } = await checkNotifications();
  return status === "granted";
};

// blocked = sudah ditolak permanen, OS tidak akan munculkan prompt lagi
export const isNotificationBlocked = async (): Promise<boolean> => {
  if (isAndroidBelow13()) return false;

  const { status } = await checkNotifications();
  return status === "blocked";
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  // Android < 13 → tidak perlu runtime permission (POST_NOTIFICATIONS)
  if (isAndroidBelow13()) return true;

  const { status } = await checkNotifications();
  if (status === "granted") return true;

  // blocked → tidak bisa di-prompt lagi, biar caller yang arahkan ke settings
  if (status === "blocked") return false;

  const { status: newStatus } = await requestNotifications(["alert", "sound"]);
  return newStatus === "granted";
};

// ===== Camera =====
export const checkCameraPermission = async (): Promise<boolean> => {
  const status = await Camera.getCameraPermissionStatus();
  return status === "granted";
};

// denied/restricted = terminal, vision-camera tidak akan munculkan prompt lagi
export const isCameraBlocked = async (): Promise<boolean> => {
  const status = await Camera.getCameraPermissionStatus();
  return status === "denied" || status === "restricted";
};

export const ensureCameraPermission = async (): Promise<boolean> => {
  const status = await Camera.getCameraPermissionStatus();
  if (status === "granted") return true;

  // hanya not-determined yang masih bisa memunculkan system prompt
  if (status === "not-determined") {
    const newStatus = await Camera.requestCameraPermission();
    return newStatus === "granted";
  }

  // denied / restricted → blocked, biar caller yang arahkan ke settings
  return false;
};

// ===== Feature flows =====
export const ensureScanFlow = async () => {
  return await ensureCameraPermission();
};

export const ensureNotificationFlow = async () => {
  return await ensureNotificationPermission();
};

// Satu-satunya tempat redirect ke Settings: hanya kalau permission benar-benar
// blocked (tidak ada lagi kesempatan prompt), bukan saat penolakan pertama yang
// masih bisa di-prompt ulang.
export const smartPermissionRequest = async ({
  requestFn,
  isBlocked,
}: RetryOptions): Promise<boolean> => {
  const granted = await requestFn();
  if (granted) return true;

  if (isBlocked && (await isBlocked())) {
    await openSettings();
  }

  return false;
};
