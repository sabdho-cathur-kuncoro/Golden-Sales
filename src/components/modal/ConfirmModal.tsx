// components/modal/ConfirmModal.tsx

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>

          <Pressable onPress={onConfirm}>
            <Text>Confirm</Text>
          </Pressable>

          <Pressable onPress={onCancel}>
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {},
  overlay: {},
  box: {},
  title: {},
});
