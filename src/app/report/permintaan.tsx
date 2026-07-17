import CartIcon from "@/assets/icons/ic-cart.svg";
import type { FilterValue } from "@/components/ui";
import {
  AnimatedPressable,
  FilterSheet,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  borderInputColor,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greyColor,
  greySecondaryColor,
  greyTertiaryColor,
  greyTextStyle,
  lineColor,
  pinkColor,
  primaryColor,
  redColor,
  redRGBAColor,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useMyOrders, { REQUEST_STATUS_OPTIONS } from "@/hooks/useMyOrders";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  CheckCircle,
  ChevronLeft,
  ListFilter,
  Search,
  XCircle,
} from "lucide-react-native";
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
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDateTime } from "../../../utils/days";

// Card detail row — label kiri (grey), value kanan (dark).
const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.cardRow}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

// Permintaan (Sales) — order final: Selesai + Dibatalkan. Pasangan dgn
// Transaksi (yg menyembunyikan status final). Reuse /orders/mine dgn
// status="Selesai,Dibatalkan", tanpa excludeStatus.
const Permintaan = () => {
  const cartCount = useCartStore(selectCartCount);
  const notifCount = useNotificationStore(selectNotifUnread);
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);

  const {
    STATUS_OPTIONS,
    status,
    setStatus,
    setSearch,
    from,
    to,
    setDateRange,
    orders,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
  } = useMyOrders({
    initialStatus: "Selesai,Dibatalkan",
    excludeStatus: "",
    statusOptions: REQUEST_STATUS_OPTIONS,
  });

  const [filter, setFilter] = useState<FilterValue>({
    payment: null,
    start: from,
    end: to,
  });
  const isFilterActive = !!(filter.payment || filter.start || filter.end);

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

  const requestData = orders.filter(
    (o: any) => !filter.payment || o.paymentMethod === filter.payment
  );

  const renderItemFlatlist = useCallback(({ item: o }: any) => {
    const isDone = o.status === "Selesai";
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/transaksi-detail",
            params: { id: o.id },
          })
        }
      >
        {/* HEADER: no. order + tanggal | status chip */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.orderNumber} numberOfLines={1}>
              {o.orderNumber}
            </Text>
            <Gap height={2} />
            <Text style={styles.cardDate}>{formatDateTime(o.createdAt)}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isDone ? greenRGBAColor : redRGBAColor },
            ]}
          >
            {isDone ? (
              <CheckCircle size={12} color={greenColor} />
            ) : (
              <XCircle size={12} color={redColor} />
            )}
            <Gap width={4} />
            <Text
              style={[
                styles.statusPillText,
                { color: isDone ? greenColor : redColor },
              ]}
            >
              {o.status}
            </Text>
          </View>
        </View>

        {/* BODY */}
        <Row label="Jumlah Produk" value={`${o.itemCount ?? 0} produk`} />
        <Gap height={SPACE_8} />
        <Row label="Total Item" value={`${o.totalQuantity ?? 0} pcs`} />
        <Gap height={SPACE_8} />
        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text
            style={[
              styles.totalValue,
              isDone
                ? { color: primaryColor }
                : {
                    color: greySecondaryColor,
                    textDecorationLine: "line-through",
                  },
            ]}
          >
            {currencyFormat(o.total)}
          </Text>
        </View>
      </Pressable>
    );
  }, []);

  const onOpenFilter = () => {
    openSheet(
      <FilterSheet
        current={filter}
        onApply={(value) => {
          setFilter(value);
          setDateRange(value.start, value.end);
          closeSheet();
        }}
        onReset={() => {
          setFilter({ payment: null, start: null, end: null });
          setDateRange(null, null);
        }}
      />,
      ["90%"],
      <>
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          Filter Permintaan
        </Text>
        <Gap height={6} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          Saring berdasarkan pembayaran dan rentang tanggal
        </Text>
        <Gap height={8} />
      </>
    );
  };

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
        <View style={styles.headerLeft}>
          <AnimatedPressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={whiteColor} />
          </AnimatedPressable>
          <Gap width={SPACE_16} />
          <Text
            style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Permintaan Saya
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

      <View style={{ flex: 1, backgroundColor: bgColor }}>
        {/* TOP CONTENT */}
        <View style={[styles.topContent]}>
          {/* SEARCH + FILTER */}
          <View style={[styles.paddingH, styles.searchRow]}>
            <View style={[styles.searchContainer, { flex: 1 }]}>
              <View style={{ width: "10%", alignItems: "center" }}>
                <Search size={18} color={blackColor} />
              </View>
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari nomor order..."
                placeholderTextColor={greyColor}
                style={[blackTextStyle, { width: "88%" }]}
              />
            </View>
            <Gap width={10} />
            <AnimatedPressable onPress={onOpenFilter}>
              <LinearGradient
                colors={[pinkColor, primaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterContainer}
              >
                <ListFilter size={18} color={whiteColor} />
                {isFilterActive ? <View style={styles.dotFilter} /> : null}
              </LinearGradient>
            </AnimatedPressable>
          </View>
          <Gap height={SPACE_16} />
          {/* STATUS CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.paddingH, { alignItems: "center" }]}
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = opt.value === status;
              return (
                <Pressable
                  onPress={() => setStatus(opt.value)}
                  key={opt.value}
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
        </View>
        {!loading && !error ? (
          <Text
            style={[
              greyTextStyle,
              { fontSize: 11, paddingHorizontal: SPACE_16 },
            ]}
          >
            {totalRecords} permintaan
          </Text>
        ) : null}
        <FlatList
          data={requestData}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
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
                  Memuat permintaan...
                </Text>
              ) : error ? (
                <Text
                  style={[greyTextStyle, { fontSize: 13, color: redColor }]}
                >
                  {error}
                </Text>
              ) : (
                <Text style={[greyTextStyle, { fontSize: 13 }]}>
                  Belum ada permintaan
                </Text>
              )}
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
};

export default Permintaan;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
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
  paddingH: {
    paddingHorizontal: SPACE_16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
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
    marginBottom: SPACE_8,
  },
  searchContainer: {
    height: 40,
    backgroundColor: whiteColor,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterContainer: {
    width: 44,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  flatlistContent: {
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: 40,
  },
  footerLoading: {
    paddingVertical: SPACE_16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  card: {
    width: "100%",
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderInputColor,
    padding: SPACE_16,
    marginBottom: 12,
  },
  cardHeader: {
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
  cardDate: {
    color: greySecondaryColor,
    fontSize: 11,
    fontFamily: FontFamily.satoshiMedium,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: FontFamily.satoshiBold,
  },
  cardRow: {
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
    fontSize: 15,
    fontFamily: FontFamily.satoshiBold,
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
  dotFilter: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: whiteColor,
  },
});
