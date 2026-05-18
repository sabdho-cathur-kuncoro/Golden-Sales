import CartIcon from "@/assets/icons/ic-cart.svg";
import { AnimatedPressable, Gap } from "@/components/ui";
import { CategoryApproval, Order } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  dot,
  FontFamily,
  greyColor,
  greySecondaryColor,
  greyTertiaryColor,
  line,
  orangeRGBAColor,
  orangeStrokeColor,
  orangeTextStyle,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { Bell, Filter, Search } from "lucide-react-native";
import React, { useCallback } from "react";
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

const Approval = () => {
  const keyExtractor = useCallback(
    (item: any, i: any) => `${i}-${item.id}`,
    []
  );
  const renderItemFlatlist = ({ item }: any) => {
    return (
      <View style={styles.tileContainer}>
        <View style={rowCenter}>
          <View style={{ width: "49%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {item?.id}
            </Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[styles.textDate]}>{item?.created_at}</Text>
          </View>
        </View>
        <Gap height={SPACE_16} />
        <View style={line} />
        <Gap height={SPACE_16} />
        <View style={rowCenter}>
          <View style={{ width: "49%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {item?.customer_name}
            </Text>
            <Gap height={SPACE_4} />
            <Text style={[blackTextStyle]}>(Cabang {item?.branch})</Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  orangeTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {item?.status_order_name}
              </Text>
            </View>
          </View>
        </View>
        <Gap height={SPACE_16} />
        <View style={line} />
        <Gap height={SPACE_16} />
        <View style={rowCenter}>
          <View style={{ width: "49%" }}>
            <Text style={[blackTextStyle]}>Total Item</Text>
            <Gap height={SPACE_4} />
            <Text
              style={[
                orangeTextStyle,
                { fontFamily: FontFamily.satoshiMedium },
              ]}
            >
              {item?.qty} Item
            </Text>
          </View>
          <View style={{ width: "49%", alignItems: "flex-end" }}>
            <Text style={[blackTextStyle]}>Metode Pembayaran</Text>
            <Gap height={SPACE_4} />
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {item?.payment_method}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const onHandleCategory = (item: any) => {};
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
            <AnimatedPressable>
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
        {/* CATEGORY */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            alignItems: "center",
          }}
        >
          {CategoryApproval.map((item) => {
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
          <View style={styles.filterContainer}>
            <Filter size={18} color={blackColor} />
            <Gap width={8} />
            <Text style={[blackTextStyle]}>Filter</Text>
          </View>
        </View>
        <FlatList
          data={Order.filter((d) => d.status_order === 4)}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          contentContainerStyle={styles.flatlistContent}
        />
      </View>
    </View>
  );
};

export default Approval;

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
  tileContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: orangeRGBAColor,
    borderWidth: 1,
    borderColor: orangeStrokeColor,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 57,
  },
  textDate: {
    fontFamily: FontFamily.satoshiMedium,
    fontSize: 12,
    color: greySecondaryColor,
  },
});
