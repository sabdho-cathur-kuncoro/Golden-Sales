import CartIcon from "@/assets/icons/ic-cart.svg";
import {
  blackColor,
  blackTextStyle,
  redColor,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
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
  const cartCount = useCartStore(selectCartCount);
  const notifUnread = useNotificationStore(selectNotifUnread);
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
            {notifUnread > 0 ? (
              <View style={styles.dot}>
                <Text style={[whiteTextStyle, { fontSize: 8 }]}>
                  {notifUnread > 99 ? "99+" : notifUnread}
                </Text>
              </View>
            ) : null}
            <View style={styles.iconContainer}>
              <Bell size={22} color={whiteColor} />
            </View>
          </AnimatedPressable>
        </View>
      ) : null}
      {isIconVisible ? (
        <View style={{ width: "14%", alignItems: "flex-end" }}>
          <AnimatedPressable onPress={() => router.push("/cart")}>
            {cartCount > 0 ? (
              <View style={styles.dot}>
                <Text style={[whiteTextStyle, { fontSize: 8 }]}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            ) : null}
            <View style={styles.iconContainer}>
              <CartIcon width={22} color={whiteColor} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: redColor,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
});
