import {
  blackTextStyle,
  FontFamily,
  primaryColor,
  primaryTextStyle,
  SPACE_16,
  SPACE_24,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useInputModalStore } from "@/stores/input.store";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function GlobalInputModal() {
  const { visible, options, hideInput } = useInputModalStore();

  const [loading, setLoading] = useState(false);
  const [textNote, setTextNote] = useState("");

  const handleClose = () => {
    if (loading) return;
    setTextNote("");
    hideInput();
  };

  const handleConfirm = async () => {
    if (!textNote.trim()) return;

    try {
      setLoading(true);
      await options.onConfirm?.(textNote);
      handleClose();
    } catch (err) {
      // optional: handle error UI
      console.error("Input modal error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={[blackTextStyle, styles.title]}>
            {options.title ?? "-"}
          </Text>

          <TextInput
            style={styles.input}
            value={textNote}
            placeholder={options.placeholder ?? "Masukkan teks"}
            onChangeText={setTextNote}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={handleClose}
              style={[
                styles.confirmBtn,
                { borderWidth: 1, borderColor: primaryColor },
              ]}
              disabled={loading}
            >
              <Text style={primaryTextStyle}>Batal</Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: primaryColor,
                  opacity: !textNote.trim() ? 0.5 : 1,
                },
              ]}
              onPress={handleConfirm}
              disabled={loading || !textNote.trim()}
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
                  Simpan
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: SPACE_16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACE_24,
  },
  confirmBtn: {
    width: "46%",
    alignItems: "center",
    padding: SPACE_16,
    borderRadius: SPACE_8,
  },
});
