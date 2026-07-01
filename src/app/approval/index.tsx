import CartIcon from "@/assets/icons/ic-cart.svg";
import {
  AnimatedPressable,
  FocusAwareStatusBar,
  Gap,
  TileOrder,
} from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  darkPrimaryColor,
  dot,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  primaryColor,
  redColor,
  screen,
  SPACE_16,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useApprovalOrders from "@/hooks/useApprovalOrders";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Bell, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { formatDateTime } from "../../../utils/days";

// Map the API status string → TileOrder's numeric code (drives badge color).
const statusToCode = (status: string) => {
  switch (status) {
    case "Menunggu Konfirmasi":
      return 1; // orange
    case "Diproses Sales":
      return 4; // blue
    case "Selesai":
      return 5; // green
    case "Dibatalkan":
      return 6; // red
    default:
      return 0; // black
  }
};

const Approval = () => {
  const cartCount = useCartStore(selectCartCount);
  const notifCount = useNotificationStore(selectNotifUnread);
  const {
    STATUS_OPTIONS,
    status,
    setStatus,
    setSearch,
    orders,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
  } = useApprovalOrders();

  // Debounced search input → controller.
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const keyExtractor = useCallback(
    (item: any, i: number) => `${i}-${item.id}`,
    []
  );

  const renderItem = useCallback(({ item: o }: any) => {
    return (
      <TileOrder
        isReport
        item={{
          id: o.orderNumber,
          created_at: formatDateTime(o.createdAt),
          customer_name: o.customerName,
          customer_phone: o.customerPhone,
          status_order_name: o.status,
          status_order: statusToCode(o.status),
          qty: o.totalQuantity,
          subtotal: o.total,
        }}
        onPress={() =>
          router.push({ pathname: "/approval-detail", params: { id: o.id } })
        }
      />
    );
  }, []);

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      {/* HEADER */}
      <View style={styles.header}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
          }}
        >
          <View style={{ width: "39%" }}>
            <Text
              style={[
                whiteTextStyle,
                { fontFamily: FontFamily.satoshiBold, fontSize: 20 },
              ]}
            >
              Approval
            </Text>
          </View>
          <View
            style={{
              width: "60%",
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
      </View>
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        {/* SEARCH */}
        <View style={styles.topContent}>
          <View style={styles.searchContainer}>
            <View style={{ width: "8%" }}>
              <Search size={18} color={blackColor} />
            </View>
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari nomor order..."
              placeholderTextColor={greyColor}
              style={[blackTextStyle, { width: "90%" }]}
            />
          </View>
          <Gap height={SPACE_16} />
          {/* STATUS CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
            }}
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = opt.value === status;
              return (
                <Pressable
                  onPress={() => setStatus(opt.value)}
                  key={opt.value || "all"}
                  style={[
                    styles.categoryContainer,
                    {
                      backgroundColor: active
                        ? primaryColor
                        : greyTertiaryColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      active ? whiteTextStyle : blackTextStyle,
                      { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {!loading && !error ? (
            <Text style={[greyTextStyle, { fontSize: 11, marginTop: 10 }]}>
              {totalRecords} pesanan{status ? ` · ${status}` : ""}
            </Text>
          ) : null}
        </View>
        <FlatList
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.flatlistContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={primaryColor} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <Text style={[greyTextStyle, { fontSize: 13 }]}>
                  Memuat pesanan...
                </Text>
              ) : error ? (
                <Text
                  style={[greyTextStyle, { fontSize: 13, color: redColor }]}
                >
                  {error}
                </Text>
              ) : (
                <Text style={[greyTextStyle, { fontSize: 13 }]}>
                  Tidak ada pesanan dengan filter ini
                </Text>
              )}
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
};

export default Approval;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: strokeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 10,
  },
  topContent: {
    width: "100%",
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
  },
  searchContainer: {
    width: "100%",
    height: 40,
    backgroundColor: whiteColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  flatlistContent: {
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
  },
  footerLoading: {
    paddingVertical: SPACE_16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
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
  },
});
