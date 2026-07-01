import CartIcon from "@/assets/icons/ic-cart.svg";
import {
  AnimatedPressable,
  DateRangeSheet,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  darkPrimaryColor,
  dot,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  pinkColor,
  primaryColor,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useReturnHistory from "@/hooks/useReturnHistory";
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
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ListFilter,
  Package,
  RotateCcw,
  Search,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDateTime } from "../../../utils/days";

const ReturnScreen = () => {
  const cartCount = useCartStore(selectCartCount);
  const notifCount = useNotificationStore(selectNotifUnread);
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);

  const {
    search,
    setSearch,
    from,
    to,
    setDateRange,
    isFilterActive,
    returns,
    summary,
    totalRecords,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    onRefresh,
    expanded,
    detailCache,
    detailLoading,
    toggleExpand,
  } = useReturnHistory();

  const [searchInput, setSearchInput] = useState("");

  const onOpenFilter = () => {
    openSheet(
      <DateRangeSheet
        current={{ start: from || null, end: to || null }}
        onApply={(value) => {
          setDateRange(value.start, value.end);
          closeSheet();
        }}
        onReset={() => setDateRange(null, null)}
      />,
      ["90%"],
      <>
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          Filter Pengembalian
        </Text>
        <Gap height={6} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          Saring berdasarkan rentang tanggal
        </Text>
        <Gap height={8} />
      </>
    );
  };

  const renderItem = ({ item: r }: any) => {
    const open = expanded === r.returnNumber;
    const detail = detailCache[r.returnNumber];
    return (
      <View style={styles.card}>
        <AnimatedPressable onPress={() => toggleExpand(r.returnNumber)}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 15, fontFamily: FontFamily.satoshiBold },
                ]}
                numberOfLines={1}
              >
                {r.returnNumber}
              </Text>
              <Gap height={2} />
              <Text style={[greyTextStyle, { fontSize: 11 }]}>
                {r.returnedAt ? formatDateTime(r.returnedAt) : "-"}
              </Text>
            </View>
            <View style={styles.returnBadge}>
              <RotateCcw size={12} color={primaryColor} />
              <Gap width={4} />
              <Text style={styles.returnText}>Return</Text>
              <Gap width={4} />
              {open ? (
                <ChevronUp size={14} color={primaryColor} />
              ) : (
                <ChevronDown size={14} color={primaryColor} />
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={[greyTextStyle, { fontSize: 13 }]}>Total Item</Text>
            <Text
              style={[
                blackTextStyle,
                { fontSize: 13, fontFamily: FontFamily.satoshiMedium },
              ]}
            >
              {r.itemCount} pcs
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={styles.row}>
            <Text style={[greyTextStyle, { fontSize: 13 }]}>Total</Text>
            <Text
              style={{
                color: primaryColor,
                fontSize: 15,
                fontFamily: FontFamily.satoshiBold,
              }}
            >
              {currencyFormat(r.total)}
            </Text>
          </View>
        </AnimatedPressable>

        {open ? (
          <View style={styles.detailBox}>
            {detailLoading && !detail ? (
              <Text style={styles.detailMuted}>Memuat detail...</Text>
            ) : detail?.error ? (
              <Text style={[styles.detailMuted, { color: primaryColor }]}>
                {detail.error}
              </Text>
            ) : detail?.items ? (
              detail.items.map((it: any) => (
                <View key={it.valueId ?? it.sn} style={styles.detailItem}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                      ]}
                      numberOfLines={1}
                    >
                      {it.productName || it.productNumber || "-"}
                    </Text>
                    <Text style={[greyTextStyle, { fontSize: 10 }]}>
                      SN: {it.sn || "-"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: primaryColor,
                      fontSize: 12,
                      fontFamily: FontFamily.satoshiBold,
                    }}
                  >
                    {currencyFormat(it.unitPrice)}
                  </Text>
                </View>
              ))
            ) : null}
          </View>
        ) : null}
      </View>
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
            Pengembalian Saya
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
        <FlatList
          data={returns}
          keyExtractor={(item, i) => `${i}-${item.returnNumber}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
          ListHeaderComponent={
            <>
              {/* SUMMARY */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryLabelRow}>
                    <RotateCcw size={14} color={primaryColor} />
                    <Gap width={6} />
                    <Text style={[greyTextStyle, { fontSize: 11 }]}>
                      Pengembalian
                    </Text>
                  </View>
                  <Text style={styles.summaryValueDark}>{totalRecords}</Text>
                  <Text style={[greyTextStyle, { fontSize: 11 }]}>
                    {summary.itemCount} item (page ini)
                  </Text>
                </View>
                <Gap width={12} />
                <View style={styles.summaryCard}>
                  <View style={styles.summaryLabelRow}>
                    <Package size={14} color={primaryColor} />
                    <Gap width={6} />
                    <Text style={[greyTextStyle, { fontSize: 11 }]}>
                      Total (page)
                    </Text>
                  </View>
                  <Text style={styles.summaryValueRed} numberOfLines={1}>
                    {currencyFormat(summary.totalNominal)}
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 11 }]}>
                    Harga saat ini
                  </Text>
                </View>
              </View>

              {/* SEARCH + FILTER */}
              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <Search size={18} color={blackColor} />
                  <Gap width={8} />
                  <TextInput
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onSubmitEditing={() => setSearch(searchInput.trim())}
                    onBlur={() => setSearch(searchInput.trim())}
                    placeholder="Cari nomor return..."
                    placeholderTextColor={greyColor}
                    style={[blackTextStyle, { flex: 1 }]}
                    returnKeyType="search"
                  />
                </View>
                <Gap width={10} />
                <AnimatedPressable onPress={onOpenFilter}>
                  <LinearGradient
                    colors={[pinkColor, primaryColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                    style={styles.filterBtn}
                  >
                    <ListFilter size={18} color={whiteColor} />
                    {isFilterActive ? <View style={styles.filterDot} /> : null}
                  </LinearGradient>
                </AnimatedPressable>
              </View>

              {!loading && !error ? (
                <Text style={[greyTextStyle, { fontSize: 11, marginTop: 12 }]}>
                  {totalRecords} pengembalian{search ? ` · "${search}"` : ""}
                </Text>
              ) : null}
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={primaryColor} />
              </View>
            ) : error ? (
              <Text style={[styles.center, { color: primaryColor }]}>
                {error}
              </Text>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={[greyTextStyle, { fontSize: 13 }]}>
                  Belum ada pengembalian pada periode ini
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={primaryColor} />
              </View>
            ) : null
          }
        />
      </View>
    </LinearGradient>
  );
};

export default ReturnScreen;

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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
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
  mainContent: {
    flex: 1,
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  listContent: {
    paddingHorizontal: SPACE_16,
    paddingTop: SPACE_16,
    paddingBottom: 120,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: lineColor,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryValueDark: {
    color: "#1A0000",
    fontSize: 18,
    fontFamily: FontFamily.satoshiBold,
    marginBottom: 2,
  },
  summaryValueRed: {
    color: primaryColor,
    fontSize: 18,
    fontFamily: FontFamily.satoshiBold,
    marginBottom: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    height: 48,
    backgroundColor: whiteColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: whiteColor,
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    padding: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
    marginTop: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  returnBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE6E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  returnText: {
    color: primaryColor,
    fontSize: 11,
    fontFamily: FontFamily.satoshiBold,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
    borderStyle: "dashed",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lineColor,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: bgColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  detailMuted: {
    color: greyColor,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
  },
  center: {
    textAlign: "center",
    paddingVertical: 40,
  },
  emptyCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: lineColor,
    padding: 32,
    alignItems: "center",
    marginTop: 12,
  },
  footerLoading: {
    paddingVertical: 16,
  },
});
