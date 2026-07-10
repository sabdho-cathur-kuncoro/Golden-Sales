import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgColor,
  blackColor,
  blueColor,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greenColor,
  mainContent,
  orangeColor,
  primaryColor,
  redColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useConfirmStore } from "@/stores/confirm.store";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import NetworkLogger, {
  clearRequests,
} from "react-native-network-logger";
import { handleBack } from "../../../utils/helper";

// Map the logger's color slots onto the app palette so its default list/detail
// UI reads as part of the app (see notifikasi/transaksi shell).
const loggerTheme = {
  colors: {
    background: bgColor,
    card: whiteColor,
    text: blackColor,
    link: blueColor,
    statusGood: greenColor,
    statusWarning: orangeColor,
    statusBad: redColor,
    secondary: primaryColor,
    onSecondary: whiteColor,
    muted: greyColor,
  },
};

const NetworkLogs = () => {
  // Remount the logger after a clear so it reflects the emptied store.
  const [reloadKey, setReloadKey] = useState(0);

  const onClear = useCallback(() => {
    useConfirmStore.getState().show({
      title: "Hapus Log",
      message: "Kosongkan semua network log?",
      type: "danger",
      onConfirm: () => {
        clearRequests();
        setReloadKey((k) => k + 1);
      },
    });
  }, []);

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={styles.header}>
        <AnimatedPressable onPress={() => handleBack("/(tabs)/profil")}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Network Logs
        </Text>
        <View style={styles.spacer} />
        <AnimatedPressable onPress={onClear} hitSlop={10}>
          <Trash2 size={22} color={whiteColor} />
        </AnimatedPressable>
      </View>
      <View style={[mainContent, styles.sheet]}>
        <NetworkLogger key={reloadKey} theme={loggerTheme} sort="desc" />
      </View>
    </LinearGradient>
  );
};

export default NetworkLogs;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    overflow: "hidden",
  },
});
