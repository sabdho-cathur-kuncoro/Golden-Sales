import { Button, Gap } from "@/components/ui";
import {
  blackColor,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greyTextStyle,
  primaryColor,
  screen,
  whiteColor,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ForgotPasswordSuccess = () => {
  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen, { alignItems: "center", justifyContent: "center" }]}
    >
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <CheckCircle2 size={72} color={greenColor} />
        </View>
        <Gap height={20} />
        <Text style={styles.title}>Password Berhasil Direset</Text>
        <Gap height={8} />
        <Text style={[greyTextStyle, styles.subtitle]}>
          Silakan masuk dengan password baru Anda.
        </Text>
        <Gap height={32} />
        <View style={styles.buttonWrap}>
          <Button
            title="Masuk Sekarang"
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default ForgotPasswordSuccess;

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 20,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    backgroundColor: greenRGBAColor,
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
  },
  buttonWrap: {
    alignSelf: "stretch",
  },
});
