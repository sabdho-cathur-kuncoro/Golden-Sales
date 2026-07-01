import { usePermissionStore } from "@/stores/permission.store";
import { usePrePermissionModal } from "@/stores/prePermission.store";
import {
  checkCameraPermission,
  isCameraBlocked,
  smartPermissionRequest,
} from "../../utils/permissions";

export const useCameraAccess = () => {
  const { show } = usePrePermissionModal();
  const { requestCamera } = usePermissionStore();

  const request = async () => {
    // 1. silent check → skip modal kalau sudah granted
    const alreadyGranted = await checkCameraPermission();
    if (alreadyGranted) return true;

    // 2. tampilkan pre-permission modal
    return new Promise<boolean>((resolve) => {
      show({
        title: "Izin akses kamera",
        description: "Kamera digunakan untuk pindai kode QR/Barcode.",
        confirmText: "Izinkan",

        onConfirm: async () => {
          const result = await smartPermissionRequest({
            requestFn: requestCamera,
            isBlocked: isCameraBlocked,
          });
          resolve(result);
        },

        onCancel: () => resolve(false),
      });
    });
  };

  return { request };
};
