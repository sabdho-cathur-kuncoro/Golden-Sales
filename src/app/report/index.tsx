import { Gap, Header, TileOrder } from "@/components/ui";
import { CategoryReportData, Order } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { router } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Report = () => {
  const [orderData, setOrderData] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    getOrderList();
  }, []);

  async function getOrderList() {
    try {
      const dataView = Order.filter((d) => d.status_order > 4);
      setOrderData(dataView);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }

  const keyExtractor = useCallback(
    (item: any, i: any) => `${i}-${item.id}`,
    []
  );
  const renderItemFlatlist = ({ item }: any) => {
    return (
      <TileOrder
        item={item}
        isReport={true}
        onPress={() =>
          router.push({
            pathname: "/report/[id]",
            params: { id: item.id, statusOrder: item?.status_order },
          })
        }
      />
    );
  };
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Laporan"}
        isIconVisible
        isNotifVisible
        onBack={() => router.back()}
      />
      <View style={[styles.header]}>
        {/* CATEGORY */}
        <ScrollView
          horizontal
          contentContainerStyle={{ paddingLeft: SPACE_16 }}
        >
          {CategoryReportData.map((data: any) => {
            const isSelected = data?.is_selected;
            return (
              <View
                key={data.id}
                style={[
                  styles.categoryContainer,
                  {
                    backgroundColor: isSelected
                      ? primaryColor
                      : greyTertiaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    isSelected ? whiteTextStyle : blackTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {data?.name}
                </Text>
              </View>
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
          <View style={styles.filterContainer}>
            <Filter size={18} color={blackColor} />
            <Gap width={8} />
            <Text style={[blackTextStyle]}>Filter</Text>
          </View>
        </View>
        <FlatList
          data={orderData}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          contentContainerStyle={styles.flatlistContent}
        />
      </View>
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    minHeight: 40,
    backgroundColor: whiteColor,
    paddingVertical: SPACE_16,
  },
  topContent: {
    width: "100%",
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
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
  categoryContainer: {
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
});
