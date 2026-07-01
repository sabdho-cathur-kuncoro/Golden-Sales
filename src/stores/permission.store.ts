import { create } from "zustand";
import {
  ensureNotificationFlow,
  ensureScanFlow,
} from "../../utils/permissions";

type PermissionState = {
  cameraGranted: boolean;
  notificationGranted: boolean;

  requestCamera: () => Promise<boolean>;
  requestNotification: () => Promise<boolean>;

  requestAll: () => Promise<boolean>;
};

export const usePermissionStore = create<PermissionState>((set) => ({
  cameraGranted: false,
  notificationGranted: false,

  requestCamera: async () => {
    const granted = await ensureScanFlow();
    set({ cameraGranted: granted });
    return granted;
  },

  requestNotification: async () => {
    const granted = await ensureNotificationFlow();
    set({ notificationGranted: granted });
    return granted;
  },

  requestAll: async () => {
    const camera = await ensureScanFlow();
    const notif = await ensureNotificationFlow();

    set({
      cameraGranted: camera,
      notificationGranted: notif,
    });

    return camera && notif;
  },
}));
