import CartIcon from "@/assets/icons/ic-cart.svg";
import { AnimatedPressable, FilterSheet, Gap, TileOrder } from "@/components/ui";
import type { FilterValue } from "@/components/ui";
import { CategoryTransaksi, Order } from "@/constants/dummy";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  dot,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  primaryColor,
  screen,
  SPACE_16,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { router } from "expo-router";
import { Bell, Filter, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Transaksi = () => {
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);

  const [categories, setCategories] = useState(CategoryTransaksi);
  const [filter, setFilter] = useState<FilterValue>({
    payment: null,
    start: null,
    end: null,
  });

  const selectedStatus = categories.find((c) => c.isSelected)?.status;
  const isFilterActive = !!(filter.payment || filter.start || filter.end);

  const keyExtractor = useCallback(
    (item: any, i: any) => `${i}-${item.id}`,
    []
  );
  const renderItemFlatlist = ({ item }: any) => {
    return (
      <TileOrder
        item={item}
        onPress={() =>
          router.push({
            pathname: "/transaksi-detail",
            params: { id: item.id },
          })
        }
      />
    );
  };

  const onHandleCategory = (item: any) => {
    setCategories((prev) =>
      prev.map((c) => ({ ...c, isSelected: c.id === item.id }))
    );
  };

  const transaksiData = Order.filter(
    (d) =>
      d.status_order === selectedStatus &&
      (!filter.payment || d.payment_method === filter.payment) &&
      (!filter.start || d.order_date >= filter.start) &&
      (!filter.end || d.order_date <= filter.end)
  );

  const onOpenFilter = () => {
    openSheet(
      <FilterSheet
        current={filter}
        onApply={(value) => {
          setFilter(value);
          closeSheet();
        }}
        onReset={() => setFilter({ payment: null, start: null, end: null })}
      />,
      ["90%"],
      <>
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          Filter Transaksi
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
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <StatusBar barStyle={"dark-content"} />
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
                blackTextStyle,
                { fontFamily: FontFamily.satoshiBold, fontSize: 20 },
              ]}
            >
              Transaksi
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
              <View style={styles.iconContainer}>
                <Bell size={22} color={primaryColor} />
                <View
                  style={[dot, { position: "absolute", top: 4, right: 6 }]}
                />
              </View>
            </AnimatedPressable>
            <Gap width={20} />
            <AnimatedPressable onPress={() => router.push("/cart")}>
              <View style={styles.iconContainer}>
                <CartIcon width={22} height={22} color={primaryColor} />
              </View>
            </AnimatedPressable>
          </View>
        </View>
        {/* CATEGORY */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            alignItems: "center",
          }}
        >
          {categories.map((item) => {
            return (
              <Pressable
                onPress={() => onHandleCategory(item)}
                key={item?.id}
                style={[
                  styles.categoryContainer,
                  {
                    backgroundColor: item?.isSelected
                      ? primaryColor
                      : greyTertiaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    item.isSelected ? whiteTextStyle : blackTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {item?.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        {/* TOP CONTENT */}
        <View style={styles.topContent}>
          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <View style={{ width: "10%" }}>
              <Search size={18} color={blackColor} />
            </View>
            <TextInput
              placeholder="Cari customer"
              placeholderTextColor={greyColor}
              style={[blackTextStyle, { width: "88%" }]}
            />
          </View>
          {/* FILTER */}
          <Pressable style={styles.filterContainer} onPress={onOpenFilter}>
            <Filter size={18} color={blackColor} />
            <Gap width={8} />
            <Text style={[blackTextStyle]}>Filter</Text>
            {isFilterActive ? <View style={[dot, { marginLeft: 6 }]} /> : null}
          </Pressable>
        </View>
        <FlatList
          data={transaksiData}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          contentContainerStyle={styles.flatlistContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[greyTextStyle, { fontSize: 13 }]}>
                Belum ada transaksi
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Transaksi;

const styles = StyleSheet.create({
  header: {
    flex: 0.15,
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingVertical: 12,
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
    marginBottom: SPACE_8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    width: "75%",
    height: 40,
    backgroundColor: whiteColor,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    width: "22%",
    backgroundColor: whiteColor,
    borderRadius: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flatlistContent: {
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
});
