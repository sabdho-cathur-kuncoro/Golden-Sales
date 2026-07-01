// components/GlobalPrePermissionModal.tsx
import {
  blackTextStyle,
  blueColor,
  FontFamily,
  greyTextStyle,
  SPACE_16,
  SPACE_24,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { usePrePermissionModal } from "@/stores/prePermission.store";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GlobalPrePermissionModal() {
  const { visible, options, hide } = usePrePermissionModal();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await options?.onConfirm?.();
    } finally {
      setLoading(false);
      hide();
    }
  };

  const handleCancel = () => {
    options?.onCancel?.();
    hide();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={[blackTextStyle, styles.title]}>
            {options?.title || "Izin akses"}
          </Text>

          <Text style={[blackTextStyle, styles.message]}>
            {options?.description}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={handleCancel} disabled={loading}>
              <Text style={[greyTextStyle]}>
                {options?.cancelText ?? "Batal"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.confirmBtn, { backgroundColor: blueColor }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={whiteColor} />
              ) : (
                <Text
                  style={[
                    whiteTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {options?.confirmText ?? "Izinkan"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: whiteColor,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: SPACE_16,
    fontFamily: FontFamily.satoshiBold,
    marginBottom: SPACE_8,
  },
  message: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACE_24,
  },
  confirmBtn: {
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_8,
    borderRadius: SPACE_8,
  },
});
