import CartIcon from "@/assets/icons/ic-cart.svg";
import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  orangeTextStyle,
  paddingH,
  pinkSecondaryColor,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useProductListController from "@/hooks/useProductListController";
import useWarehouse from "@/hooks/useWarehouse";
import { selectCartCount, useCartStore } from "@/stores/cart.store";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronRight,
  ImageIcon,
  LockKeyhole,
  Search,
  Warehouse,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { imgSrc } from "../../../utils/helper";

const Request = () => {
  const cartCount = useCartStore(selectCartCount);
  // Warehouse locked to the login user (see `useWarehouse`) — no picker.
  const { warehouse } = useWarehouse();
  const { filtered, loading, search, setSearch, refreshing, onRefresh } =
    useProductListController({ scopeToWarehouse: true });

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              width: "75%",
            },
          ]}
        >
          <Text
            style={[
              whiteTextStyle,
              { fontFamily: FontFamily.satoshiBold, fontSize: 18 },
            ]}
          >
            Permintaan Barang
          </Text>
        </View>
        <View
          style={{
            width: "24%",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
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
      </View>
      <View style={[styles.topContent]}>
        {/* WAREHOUSE — locked to the sales user's warehouse */}
        <View style={styles.tileWarehouseContainer}>
          <View style={[rowCenter, { width: "75%" }]}>
            <View style={{ width: "14%" }}>
              <View style={styles.iconWrapperContainer}>
                <Warehouse size={20} color={primaryColor} />
              </View>
            </View>
            <View style={{ width: "80%" }}>
              <Text style={[greyTextStyle, { fontSize: 11 }]}>Gudang</Text>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
                numberOfLines={1}
              >
                {warehouse?.name ?? "Memuat..."}
              </Text>
            </View>
          </View>
          {/* Locked to login warehouse. To re-enable a picker: render a
                Pressable here that opens a warehouse bottom sheet. */}
          <View style={{ width: "25%", alignItems: "flex-end" }}>
            <LockKeyhole size={20} color={greyColor} />
          </View>
        </View>

        {/* SEARCH */}
        <Gap height={SPACE_16} />
        <View style={[paddingH]}>
          <View style={[styles.searchInputContainer]}>
            <View style={{ width: "10%" }}>
              <View style={[styles.iconWrapperContainer]}>
                <Search size={18} color={primaryColor} />
              </View>
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari produk"
              placeholderTextColor={greyColor}
              numberOfLines={1}
              style={[blackTextStyle, { width: "75%" }]}
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={8}
                style={{ width: "10%", alignItems: "flex-end" }}
              >
                <X size={18} color={greyColor} />
              </Pressable>
            ) : null}
          </View>
          <Gap height={SPACE_16} />
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Daftar Produk
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[
          paddingH,
          { paddingTop: SPACE_8, paddingBottom: 100 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && filtered.length === 0 ? (
          <Text style={[greyTextStyle, styles.stateText]}>Memuat...</Text>
        ) : filtered.length === 0 ? (
          <Text style={[greyTextStyle, styles.stateText]}>
            Tidak ada produk
          </Text>
        ) : (
          filtered.map((item: any) => {
            const uri = imgSrc(item?.imageList[0]);
            return (
              <Pressable
                key={item.uid ?? item.id}
                onPress={() =>
                  router.push({
                    pathname: "/order/productDetail",
                    params: { uid: item.uid },
                  })
                }
              >
                <LinearGradient
                  colors={[whiteColor, pinkSecondaryColor]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardContainer}
                >
                  <View style={[rowCenter, { width: "84%" }]}>
                    <View
                      style={{
                        width: "20%",
                        height: 56,
                      }}
                    >
                      {uri ? (
                        <Image
                          source={{ uri }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={styles.imgPlaceholder}>
                          <ImageIcon size={24} color={greyColor} />
                        </View>
                      )}
                    </View>
                    <View style={{ width: "75%" }}>
                      <Text
                        style={[
                          blackTextStyle,
                          { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                        ]}
                        numberOfLines={1}
                      >
                        {item.productName}
                      </Text>
                      {item.category ? (
                        <>
                          <Gap height={SPACE_8} />
                          <Text style={[greyTextStyle, { fontSize: 12 }]}>
                            {item.category}
                          </Text>
                        </>
                      ) : null}
                      <Gap height={4} />
                      <Text
                        style={[
                          orangeTextStyle,
                          { fontSize: 14, fontFamily: FontFamily.satoshiBold },
                        ]}
                      >
                        {currencyFormat(item.price)}
                      </Text>
                      {item.stock != null ? (
                        <Text style={[greyTextStyle, { fontSize: 10 }]}>
                          Stok: {item.stock}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ width: "15%", alignItems: "flex-end" }}>
                    <ChevronRight size={28} color={greyColor} />
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default Request;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  topContent: {
    width: "100%",
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  tileWarehouseContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    borderWidth: 0.5,
    borderColor: lineColor,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: whiteColor,
    borderRadius: SPACE_16,
    paddingHorizontal: 10,
    paddingVertical: SPACE_4,
    minHeight: 40,
    borderWidth: 0.5,
    borderColor: lineColor,
  },
  cardContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 48,
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
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  iconWrapperContainer: {
    padding: SPACE_8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: pinkSecondaryColor,
  },
});
