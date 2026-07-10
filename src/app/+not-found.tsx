import { Screen } from "@/components/layout";
import { Gap, GradientButton } from "@/components/ui";
import {
  primaryColor,
  SPACE_16,
  SPACE_24,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/auth.store";
import { router } from "expo-router";
import { Compass } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const NotFound = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const goHome = () => router.replace(isAuthenticated ? "/home" : "/login");

  return (
    <Screen>
      <View style={styles.container}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 96 / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: whiteColor,
          }}
        >
          <Compass size={80} color={primaryColor} />
        </View>
        <Gap height={SPACE_24} />
        <Text style={[whiteTextStyle, styles.title]}>
          Halaman tidak ditemukan
        </Text>
        <Gap height={SPACE_8} />
        <Text style={[whiteTextStyle, styles.subtitle]}>
          Sepertinya halaman yang kamu cari tidak tersedia atau sudah
          dipindahkan.
        </Text>
        <Gap height={SPACE_24} />
        <View style={styles.buttonWrap}>
          <GradientButton
            title={isAuthenticated ? "Kembali ke Beranda" : "Masuk"}
            onPress={goHome}
          />
        </View>
      </View>
    </Screen>
  );
};

export default NotFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE_24,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonWrap: {
    alignSelf: "stretch",
    paddingHorizontal: SPACE_16,
  },
});
