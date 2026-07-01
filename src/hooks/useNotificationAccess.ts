import { usePermissionStore } from "@/stores/permission.store";
import { usePrePermissionModal } from "@/stores/prePermission.store";
import {
  checkNotificationPermission,
  isNotificationBlocked,
  smartPermissionRequest,
} from "../../utils/permissions";

export const useNotificationAccess = () => {
  const { show } = usePrePermissionModal();
  const { requestNotification } = usePermissionStore();

  const request = async () => {
    // pre-check (check-only → jangan trigger system prompt sebelum modal)
    const alreadyGranted = await checkNotificationPermission();
    if (alreadyGranted) return true;

    return new Promise<boolean>((resolve) => {
      show({
        title: "Hidupkan Notifikasi",
        description: "Pastikan Anda tidak tertinggal informasi terbaru.",
        confirmText: "Hidupkan",

        onConfirm: async () => {
          const result = await smartPermissionRequest({
            requestFn: requestNotification,
            isBlocked: isNotificationBlocked,
          });

          resolve(result);
        },

        onCancel: () => resolve(false),
      });
    });
  };

  return { request };
};
