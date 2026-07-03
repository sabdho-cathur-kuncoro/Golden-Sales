import CartIcon from "@/assets/icons/ic-cart.svg";
import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgColor,
  bgSecondaryColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyTextStyle,
  lineColor,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  LucideIcon,
  Receipt,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  onPress: () => void;
};

const MENU: MenuItem[] = [
  {
    key: "penjualan",
    title: "Penjualan",
    subtitle: "Riwayat penjualan stok saya",
    Icon: Receipt,
    onPress: () => router.push("/report/penjualan"),
  },
  {
    key: "permintaan",
    title: "Permintaan",
    subtitle: "Order selesai & dibatalkan",
    Icon: ClipboardList,
    onPress: () => router.push("/report/permintaan"),
  },
];

const Report = () => {
  const cartCount = useCartStore(selectCartCount);
  const notifCount = useNotificationStore(selectNotifUnread);
  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              whiteTextStyle,
              { fontSize: 18, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            Laporan
          </Text>
        </View>
        <View style={styles.headerRight}>
          <AnimatedPressable onPress={() => router.push("/notifikasi")}>
            {notifCount > 0 ? (
              <View style={styles.cartDot}>
                <Text style={[whiteTextStyle, { fontSize: 8 }]}>
                  {notifCount > 99 ? "99+" : notifCount}
                </Text>
              </View>
            ) : null}
            <View style={styles.iconContainer}>
              <Bell size={22} color={whiteColor} />
            </View>
          </AnimatedPressable>
          <Gap width={20} />
          <AnimatedPressable onPress={() => router.push("/cart")}>
            {cartCount > 0 ? (
              <View style={styles.cartDot}>
                <Text style={[whiteTextStyle, { fontSize: 8 }]}>
                  {cartCount > 99 ? "99+" : cartCount}
                </Text>
              </View>
            ) : null}
            <View style={styles.iconContainer}>
              <CartIcon width={22} height={22} color={whiteColor} />
            </View>
          </AnimatedPressable>
        </View>
      </View>
      <View style={styles.mainContent}>
        {MENU.map((item) => (
          <AnimatedPressable key={item.key} onPress={item.onPress}>
            <View style={styles.card}>
              <View style={styles.iconCardContainer}>
                <item.Icon size={24} color={primaryColor} />
              </View>
              <Gap width={SPACE_16} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 15, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {item.title}
                </Text>
                <Gap height={2} />
                <Text style={[greyTextStyle, { fontSize: 12 }]}>
                  {item.subtitle}
                </Text>
              </View>
              <ChevronRight size={20} color={greyTextStyle.color as string} />
            </View>
          </AnimatedPressable>
        ))}
      </View>
    </LinearGradient>
  );
};

export default Report;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    minHeight: 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  mainContent: {
    flex: 1,
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    paddingHorizontal: SPACE_16,
    paddingTop: SPACE_16,
    paddingBottom: 120,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: whiteColor,
    borderRadius: 16,
    padding: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCardContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: bgSecondaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  cartDot: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
});
