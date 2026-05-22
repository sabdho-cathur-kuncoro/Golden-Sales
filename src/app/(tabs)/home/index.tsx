import ApprovalIcon from "@/assets/icons/ic-approval.svg";
import CartIcon from "@/assets/icons/ic-cart.svg";
import KatalogIcon from "@/assets/icons/ic-katalog.svg";
import LaporanIcon from "@/assets/icons/ic-laporan.svg";
import OrderIcon from "@/assets/icons/ic-order.svg";
import ReqItemIcon from "@/assets/icons/ic-request-item.svg";
import TransaksiIcon from "@/assets/icons/ic-transaksi.svg";
import FireIcon from "@/assets/images/fire.svg";
import { AnimatedPressable, BannerSlider, Gap } from "@/components/ui";
import { banners, FlashSaleData } from "@/constants/dummy";
import {
  bgSecondaryColor,
  blackColor,
  blackTextStyle,
  blueColor,
  blueTextStyle,
  dot,
  FontFamily,
  greyTextStyle,
  orangeTextStyle,
  paddingH,
  primaryColor,
  primaryTextStyle,
  redColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
  yellowColor,
  yellowTextStyle,
} from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bell, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { currencyFormat } from "../../../../utils/currencyFormat";

const Home = () => {
  return (
    <View style={[screen]}>
      <StatusBar barStyle={"dark-content"} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* WELCOME */}
        <View style={[rowCenter, paddingH]}>
          <View style={{ width: "49%" }}>
            <Text style={[blackTextStyle]}>Selamat Datang,</Text>
            <Gap height={SPACE_4} />
            <Text
              style={[
                blackTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Dudung Sadudung
            </Text>
          </View>
          <View
            style={{
              width: "49%",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <AnimatedPressable onPress={() => router.push("/notifikasi")}>
              <View style={styles.iconContainer}>
                <Bell size={22} color={primaryColor} />
                <View
                  style={[dot, { position: "absolute", top: 4, right: 6 }]}
                />
              </View>
            </AnimatedPressable>
            <Gap width={20} />
            <AnimatedPressable>
              <View style={styles.iconContainer}>
                <CartIcon width={22} height={22} color={primaryColor} />
              </View>
            </AnimatedPressable>
          </View>
        </View>
        <Gap height={SPACE_16} />
        {/* INFO */}
        <View style={[paddingH]}>
          <View style={[styles.container]}>
            <View
              style={[
                styles.infoContentContainer,
                rowCenter,
                { borderColor: yellowColor },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  width: "50%",
                  alignItems: "center",
                }}
              >
                <ApprovalIcon width={20} height={20} color={yellowColor} />
                <Gap width={10} />
                <Text
                  style={[
                    yellowTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  Approval
                </Text>
              </View>
              <View style={{ width: "45%", alignItems: "flex-end" }}>
                <Text
                  style={[
                    yellowTextStyle,
                    { fontSize: 20, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  2
                </Text>
              </View>
            </View>
            <Gap height={SPACE_16} />
            <View
              style={[
                styles.infoContentContainer,
                rowCenter,
                { borderColor: blueColor },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  width: "50%",
                  alignItems: "center",
                }}
              >
                <TransaksiIcon width={20} height={20} color={blueColor} />
                <Gap width={10} />
                <Text
                  style={[
                    blueTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  Transaksi Berjalan
                </Text>
              </View>
              <View style={{ width: "45%", alignItems: "flex-end" }}>
                <Text
                  style={[
                    blueTextStyle,
                    { fontSize: 20, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  3
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Gap height={20} />
        {/* MENU */}
        <View style={[paddingH]}>
          <View
            style={[
              styles.container,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
          >
            <Pressable
              onPress={() => router.push("/request-product")}
              style={{ minWidth: 74, alignItems: "center" }}
            >
              <View style={styles.iconMenuContainer}>
                <ReqItemIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Minta Barang
              </Text>
            </Pressable>
            <Pressable
              style={{ minWidth: 74, alignItems: "center" }}
              onPress={() => router.push("/order")}
            >
              <View style={styles.iconMenuContainer}>
                <OrderIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Order
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/report")}
              style={{ minWidth: 74, alignItems: "center" }}
            >
              <View style={styles.iconMenuContainer}>
                <LaporanIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Laporan
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/catalog")}
              style={{ minWidth: 74, alignItems: "center" }}
            >
              <View style={styles.iconMenuContainer}>
                <KatalogIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Katalog
              </Text>
            </Pressable>
          </View>
        </View>
        <Gap height={20} />
        {/* BANNER */}
        <View style={[paddingH]}>
          <BannerSlider data={banners} />
        </View>
        <Gap height={20} />
        {/* FLASH SALE */}
        <View style={[rowCenter, paddingH]}>
          <View
            style={{ width: "80%", flexDirection: "row", alignItems: "center" }}
          >
            <FireIcon width={20} height={20} />
            <Gap width={10} />
            <Text
              style={[
                blackTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Flash Sale
            </Text>
          </View>
          <View
            style={{
              width: "19%",
              alignItems: "flex-end",
            }}
          >
            <ChevronRight size={20} color={blackColor} />
          </View>
        </View>
        <Gap height={SPACE_16} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACE_16,
          }}
        >
          {FlashSaleData.map((data) => {
            return (
              <View key={data.id} style={styles.tileContainer}>
                <View
                  style={{
                    width: "25%",
                    height: 100,
                    borderRadius: 10,
                  }}
                >
                  <Image
                    source={data?.image}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="fill"
                  />
                </View>
                <View style={{ width: "45%" }}>
                  <View style={styles.discountContainer}>
                    <Text
                      style={[
                        whiteTextStyle,
                        { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                      ]}
                    >
                      -{data?.discount_percentage}%
                    </Text>
                  </View>
                  <Gap height={10} />
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {data.name}
                  </Text>
                  <Gap height={SPACE_4} />
                  <Text style={[blackTextStyle]}>{data.category}</Text>
                  <Gap height={SPACE_16} />
                  <Text style={[primaryTextStyle, { fontSize: 12 }]}>
                    S&K Berlaku
                  </Text>
                </View>
                <View
                  style={{
                    width: "25%",
                  }}
                >
                  <Text
                    style={[
                      greyTextStyle,
                      { textDecorationLine: "line-through", fontSize: 12 },
                    ]}
                  >
                    {currencyFormat(data.normal_price)}
                  </Text>
                  <Text
                    style={[
                      orangeTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {currencyFormat(data.discount_price)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: strokeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: whiteColor,
  },
  infoContentContainer: {
    padding: SPACE_16,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconMenuContainer: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: bgSecondaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  tileContainer: {
    width: "100%",
    maxWidth: 340,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginRight: SPACE_16,
  },
  discountContainer: {
    maxWidth: "35%",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 33,
    backgroundColor: redColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
