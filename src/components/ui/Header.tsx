import CartIcon from "@/assets/icons/ic-cart.svg";
import {
  blackColor,
  blackTextStyle,
  dot,
  primaryColor,
  SPACE_16,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
import { router } from "expo-router";
import { Bell, ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

const Header = ({
  title,
  isIconVisible = false,
  isNotifVisible = false,
  onBack,
}: any) => {
  return (
    <View style={styles.headerContainer}>
      <View
        style={{
          width: isNotifVisible ? "72%" : "86%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <AnimatedPressable onPress={onBack} hitSlop={8}>
          <ChevronLeft size={22} color={blackColor} />
        </AnimatedPressable>
        <Gap width={10} />
        <Text style={[blackTextStyle, { fontSize: 16 }]}>{title}</Text>
      </View>
      {isNotifVisible ? (
        <View
          style={{
            width: "14%",
            alignItems: "flex-end",
          }}
        >
          <AnimatedPressable onPress={() => router.push("/notifikasi")}>
            <View style={styles.iconContainer}>
              <Bell size={22} color={primaryColor} />
              <View style={[dot, { position: "absolute", top: 4, right: 6 }]} />
            </View>
          </AnimatedPressable>
        </View>
      ) : null}
      {isIconVisible ? (
        <View style={{ width: "14%", alignItems: "flex-end" }}>
          <AnimatedPressable onPress={() => router.push("/cart")}>
            <View style={styles.iconContainer}>
              <CartIcon width={22} color={primaryColor} />
            </View>
          </AnimatedPressable>
        </View>
      ) : null}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingBottom: 10,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderColor: strokeColor,
    borderWidth: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
