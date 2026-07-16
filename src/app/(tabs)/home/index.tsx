import CartIcon from "@/assets/icons/ic-cart.svg";
import KatalogIcon from "@/assets/icons/ic-katalog.svg";
import ReqItemIcon from "@/assets/icons/ic-request-item.svg";
import FireImg from "@/assets/images/fire.svg";
import { AnimatedPressable, BannerSlider, Gap } from "@/components/ui";
import FlashSaleCard, {
  FlashSaleCardEmpty,
  FlashSaleCardSkeleton,
} from "@/components/ui/FlashSaleCard";
import {
  bgColor,
  bgSecondaryColor,
  blackColor,
  blackTextStyle,
  borderInputColor,
  darkPrimaryColor,
  FontFamily,
  greySecondaryColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  orangeRGBAColor,
  paddingH,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useNotificationAccess } from "@/hooks/useNotificationAccess";
import {
  getFlashSaleService,
  getSlidersService,
} from "@/services/global.services";
import { getMyOrdersService } from "@/services/orders.services";
import { useAuthStore } from "@/stores/auth.store";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused } from "expo-router";
import { Bell, ChevronRight, RotateCcw, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { currencyFormat } from "../../../../utils/currencyFormat";
import { formatDate } from "../../../../utils/days";

const Home = () => {
  const { user } = useAuthStore();
  const { request } = useNotificationAccess();
  const { height } = useWindowDimensions();
  const flashSaleHeight = Math.max(200, Math.min(height * 0.22, 240));
  const cartCount = useCartStore(selectCartCount);
  const notifCount = useNotificationStore(selectNotifUnread);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [flashSalesLoading, setFlashSalesLoading] = useState(true);
  const [sliders, setSliders] = useState<any[]>([]);
  const [slidersLoading, setSlidersLoading] = useState(true);
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [latestLoading, setLatestLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    useCartStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    handleNotif();
    onGetSliders();
    onGetFlashSales();
    onGetLatestOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([handleNotif(), onGetSliders(), onGetLatestOrder()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleNotif() {
    const granted = await request();
    if (!granted) return;
  }

  async function onGetSliders() {
    try {
      const res = await getSlidersService();
      setSliders(res ?? []);
    } catch (e) {
      if (__DEV__) console.log(e);
    } finally {
      setSlidersLoading(false);
    }
  }

  async function onGetFlashSales() {
    try {
      const res = await getFlashSaleService();
      setFlashSales(res ?? []);
    } catch (e) {
      if (__DEV__) console.log(e);
    } finally {
      setFlashSalesLoading(false);
    }
  }

  async function onGetLatestOrder() {
    try {
      const res = await getMyOrdersService({ page: 1, pageSize: 1 });
      setLatestOrder(res?.data?.[0] ?? null);
    } catch (e) {
      if (__DEV__) console.log(e);
    } finally {
      setLatestLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <StatusBar barStyle={"light-content"} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {/* WELCOME */}
        <View style={[rowCenter, paddingH, { minHeight: height * 0.08 }]}>
          <View style={{ width: "49%" }}>
            <Text style={[whiteTextStyle]}>Selamat Datang,</Text>
            <Gap height={SPACE_4} />
            <Text
              style={[
                whiteTextStyle,
                { fontSize: 18, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {user?.fullName ?? "-"}
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
              {notifCount > 0 ? (
                <View style={styles.dot}>
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
                <View style={styles.dot}>
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
        <Gap height={SPACE_16} />
        <View style={styles.mainContent}>
          {/* MENU */}
          <View
            style={[styles.container, rowCenter, { alignItems: "flex-start" }]}
          >
            <Pressable
              onPress={() => router.push("/request-product")}
              style={styles.menuWrapper}
            >
              <View style={styles.iconMenuContainer}>
                <ReqItemIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text style={[blackTextStyle, styles.menuLabel]}>
                Minta Barang
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuWrapper}
              onPress={() => router.push("/return")}
            >
              <View style={styles.iconMenuContainer}>
                <RotateCcw size={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text style={[blackTextStyle, styles.menuLabel]}>
                Pengembalian
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/customer")}
              style={styles.menuWrapper}
            >
              <View style={styles.iconMenuContainer}>
                <Users width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text style={[blackTextStyle, styles.menuLabel]}>Customer</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/catalog")}
              style={styles.menuWrapper}
            >
              <View style={styles.iconMenuContainer}>
                <KatalogIcon width={28} height={28} color={primaryColor} />
              </View>
              <Gap height={SPACE_8} />
              <Text style={[blackTextStyle, styles.menuLabel]}>Katalog</Text>
            </Pressable>
          </View>
          <Gap height={20} />
          {/* BANNER */}
          <View style={[paddingH]}>
            <BannerSlider data={sliders} loading={slidersLoading} />
          </View>
          <Gap height={20} />
          {/* FLASH SALE */}
          <View
            style={{
              width: "100%",
              height: flashSaleHeight,
              paddingHorizontal: SPACE_16,
              borderRadius: 12,
            }}
          >
            <LinearGradient
              colors={[darkPrimaryColor, primaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={{ flex: 1, paddingTop: 0, borderRadius: 12 }}
            >
              <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
                <View style={styles.topSaleContent}>
                  <View
                    style={{
                      width: "89%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <FireImg width={20} height={20} />
                    <Gap width={10} />
                    <Text
                      style={[
                        whiteTextStyle,
                        { fontFamily: FontFamily.satoshiBold },
                      ]}
                    >
                      Flash Sale
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.bottomSaleContent,
                  { height: flashSaleHeight - 50 },
                ]}
              >
                <View
                  style={{
                    width: "30%",
                    justifyContent: "flex-end",
                  }}
                >
                  <Image
                    source={require("../../../../assets/images/character-by.png")}
                    style={{
                      width: 96,
                      height: 96,
                    }}
                    contentFit="cover"
                  />
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={{
                    alignItems: "flex-end",
                    paddingBottom: 20,
                  }}
                >
                  {flashSalesLoading ? (
                    [0, 1, 2].map((i) => <FlashSaleCardSkeleton key={i} />)
                  ) : flashSales.length === 0 ? (
                    <FlashSaleCardEmpty />
                  ) : (
                    flashSales.map((data) => {
                      return (
                        <FlashSaleCard
                          key={data.id}
                          discount={data.discountPercent ?? 0}
                          productName={data.productName ?? "-"}
                          category={data.categoryName ?? "-"}
                          normalPrice={currencyFormat(data.originalPrice ?? 0)}
                          discountPrice={currencyFormat(data.salePrice ?? 0)}
                          onPress={() => {}}
                        />
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </LinearGradient>
          </View>
          <Gap height={20} />
          {/* ORDER TERAKHIR SAYA */}
          <View style={[rowCenter, paddingH]}>
            <Text
              style={[
                blackTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Order Terakhir Saya
            </Text>
            <AnimatedPressable onPress={() => router.push("/transaksi")}>
              <ChevronRight size={20} color={blackColor} />
            </AnimatedPressable>
          </View>
          <Gap height={SPACE_16} />
          <View style={[paddingH]}>
            {latestLoading ? (
              <View style={styles.orderCard}>
                <Text style={styles.orderMuted}>Memuat...</Text>
              </View>
            ) : latestOrder ? (
              <Pressable
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: "/transaksi-detail",
                    params: { id: latestOrder.id },
                  })
                }
              >
                {/* HEADER: no. order + tanggal | status chip */}
                <View style={styles.orderHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.orderNumber} numberOfLines={1}>
                      {latestOrder.orderNumber}
                    </Text>
                    <Gap height={2} />
                    <Text style={styles.orderDate}>
                      {formatDate(latestOrder.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>
                      {latestOrder.status}
                    </Text>
                  </View>
                </View>

                {/* BODY */}
                <View style={styles.orderRow}>
                  <Text style={styles.rowLabel}>Produk</Text>
                  <Text style={styles.rowValue}>
                    {latestOrder.itemCount ?? 0} item
                  </Text>
                </View>
                <Gap height={SPACE_8} />
                <View style={styles.orderRow}>
                  <Text style={styles.rowLabel}>Total Qty</Text>
                  <Text style={styles.rowValue}>
                    {latestOrder.totalQuantity ?? 0} pcs
                  </Text>
                </View>
                <Gap height={SPACE_8} />
                <View style={styles.orderRow}>
                  <Text style={styles.rowLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {currencyFormat(latestOrder.total)}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.orderCard}>
                <Text style={styles.orderMuted}>Belum ada order</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    padding: SPACE_16,
    borderRadius: 20,
    backgroundColor: whiteColor,
    borderWidth: 0.5,
    borderColor: lineColor,
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: bgColor,
    paddingBottom: 120,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
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
  menuWrapper: {
    minWidth: 74,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menuLabel: {
    fontSize: 12,
    fontFamily: FontFamily.satoshiMedium,
    textAlign: "center",
  },
  dot: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  orderCard: {
    width: "100%",
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderInputColor,
    padding: SPACE_16,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: lineColor,
  },
  orderNumber: {
    color: blackColor,
    fontSize: 15,
    fontFamily: FontFamily.satoshiBold,
  },
  orderDate: {
    color: greySecondaryColor,
    fontSize: 11,
    fontFamily: FontFamily.satoshiMedium,
  },
  statusPill: {
    backgroundColor: orangeRGBAColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    color: orangeColor,
    fontSize: 11,
    fontFamily: FontFamily.satoshiBold,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    color: greySecondaryColor,
    fontSize: 13,
    fontFamily: FontFamily.satoshiMedium,
  },
  rowValue: {
    color: blackColor,
    fontSize: 13,
    fontFamily: FontFamily.satoshiBold,
  },
  totalValue: {
    color: primaryColor,
    fontSize: 15,
    fontFamily: FontFamily.satoshiBold,
  },
  orderMuted: {
    color: greyTextStyle.color,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  topSaleContent: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  bottomSaleContent: {
    width: "100%",
    paddingLeft: 10,
    flexDirection: "row",
  },
});
