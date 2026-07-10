import { Button, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgSecondaryColor,
  blackColor,
  darkPrimaryColor,
  FontFamily,
  greyTextStyle,
  primaryColor,
  screen,
  shadow,
  whiteColor,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { ArrowUpCircle } from "lucide-react-native";
import React, { useCallback } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { openAppStore } from "../../../utils/version";

const UpdateScreen = () => {
  // Hard block: swallow the Android hardware back button while focused.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => sub.remove();
    }, [])
  );

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen, { alignItems: "center", justifyContent: "center" }]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.container, shadow]}>
        <View style={styles.iconWrap}>
          <ArrowUpCircle size={72} color={primaryColor} />
        </View>
        <Gap height={20} />
        <Text style={styles.title}>Perbarui Aplikasi</Text>
        <Gap height={8} />
        <Text style={[greyTextStyle, styles.subtitle]}>
          Versi aplikasi Anda sudah usang. Perbarui ke versi terbaru untuk
          melanjutkan.
        </Text>
        <Gap height={32} />
        <View style={styles.buttonWrap}>
          <Button title="Perbarui Sekarang" onPress={openAppStore} />
        </View>
      </View>
    </LinearGradient>
  );
};

export default UpdateScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 20,
    width: "85%",
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    backgroundColor: bgSecondaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 20,
    color: blackColor,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonWrap: {
    alignSelf: "stretch",
  },
});
