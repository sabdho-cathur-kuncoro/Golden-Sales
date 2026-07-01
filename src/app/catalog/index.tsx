import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgBrownColor,
  bgColor,
  blackColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  paddingScroll,
  pinkSecondaryColor,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useProductListController from "@/hooks/useProductListController";
import useWarehouse from "@/hooks/useWarehouse";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  LockKeyhole,
  Warehouse,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { imgSrc } from "../../../utils/helper";

const Catalog = () => {
  const { filtered, refreshing, onRefresh } = useProductListController();
  const { warehouse } = useWarehouse();
  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Katalog
        </Text>
      </View>
      <View
        style={{
          backgroundColor: bgColor,
          borderTopStartRadius: 20,
          borderTopEndRadius: 20,
        }}
      >
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
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[paddingScroll]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filtered.map((item: any) => {
          const id = item.id;
          const name = item.productName;
          const img = item.imageList[0];
          const slug = item.category;
          const uri = imgSrc(img);
          return (
            <Pressable
              key={id}
              onPress={() =>
                router.push({
                  pathname: "/catalog/[id]",
                  params: { id: item.uid },
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
                        style={styles.imgPlaceholder}
                        contentFit="contain"
                      />
                    ) : (
                      <View style={styles.imgPlaceholder}>
                        <ImageIcon size={32} color={whiteColor} />
                      </View>
                    )}
                  </View>
                  <View style={{ width: "75%" }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                      ]}
                    >
                      {name}
                    </Text>
                    {slug ? (
                      <>
                        <Gap height={SPACE_8} />
                        <Text style={[blackTextStyle, { fontSize: 12 }]}>
                          {slug}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <View style={{ width: "15%", alignItems: "flex-end" }}>
                  <ChevronRight size={28} color={blackColor} />
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

export default Catalog;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
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
    width: 64,
    height: 64,
    backgroundColor: bgBrownColor,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
  iconWrapperContainer: {
    padding: SPACE_8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: pinkSecondaryColor,
  },
});
