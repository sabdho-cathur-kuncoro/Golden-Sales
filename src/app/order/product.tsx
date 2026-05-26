import { AnimatedPressable, Button, Gap, Header } from "@/components/ui";
import { CategoryData, ProductData } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  paddingH,
  primaryColor,
  primaryTextStyle,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";
import { useGlobalStore } from "@/stores/global.store";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight, MapPin } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const Product = () => {
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);
  const { selectedAddress, setAddress } = useGlobalStore();

  const handleOpen = (outlet: any) => {
    const address = outlet?.list_address;
    const snapPoints = address?.length <= 2 ? ["55%"] : ["80%"];

    openSheet(
      <BottomSheetFlatList
        style={{ flex: 1 }}
        data={address}
        keyExtractor={(item: any) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
        renderItem={({ item }: any) => (
          <Pressable
            onPress={() => {
              setAddress(item);
              closeSheet();
            }}
            style={[rowCenter, styles.cardAddressContainer]}
          >
            <View
              style={{
                width: "15%",
                alignItems: "center",
              }}
            >
              <MapPin size={24} color={primaryColor} />
            </View>

            <View style={{ width: "83%" }}>
              <Text
                style={[
                  primaryTextStyle,
                  {
                    fontSize: 18,
                    fontFamily: FontFamily.satoshiMedium,
                  },
                ]}
              >
                {item?.name}
              </Text>

              <Gap height={4} />

              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {item?.address}
              </Text>
            </View>
          </Pressable>
        )}
      />,
      snapPoints,
      // header
      <>
        <Text
          style={[
            blackTextStyle,
            {
              fontFamily: FontFamily.satoshiMedium,
            },
          ]}
        >
          Pilih Alamat Tujuan
        </Text>

        <Gap height={10} />

        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          Silakan tentukan alamat pengiriman untuk {outlet?.name}
        </Text>

        <Gap height={16} />
      </>,
      // footer
      <Button
        title="Batalkan"
        titleColor={greyTextStyle}
        border={1}
        borderColor={greyColor}
        bgColor={"transparent"}
        onPress={closeSheet}
      />
    );
  };

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Order Barang"}
        isIconVisible
        onBack={() => router.back()}
      />
      <View style={[styles.header]}>
        {/* ADDRESS */}
        <View style={[paddingH]}>
          <View style={styles.tileAddressContainer}>
            <View style={[rowCenter, { width: "75%" }]}>
              <View style={{ width: "10%" }}>
                <MapPin size={20} color={blackColor} />
              </View>
              <View style={{ width: "88%" }}>
                <Text style={[blackTextStyle]}>{selectedAddress?.name}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleOpen}
              style={{ width: "25%", alignItems: "flex-end" }}
            >
              <Text style={[primaryTextStyle, { fontSize: 12 }]}>
                Ubah Alamat
              </Text>
            </Pressable>
          </View>
        </View>
        {/* CATEGORY */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingLeft: SPACE_16,
            paddingTop: SPACE_16,
          }}
        >
          {CategoryData.map((cat: any) => {
            return (
              <AnimatedPressable key={cat.id}>
                <View
                  style={[
                    styles.categoryContainer,
                    {
                      backgroundColor: cat?.isSelected
                        ? primaryColor
                        : whiteColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      cat?.isSelected ? whiteTextStyle : blackTextStyle,
                      { fontSize: 12 },
                    ]}
                  >
                    {cat?.category_name}
                  </Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[paddingH, { paddingBottom: 100 }]}
      >
        {ProductData.map((item: any) => {
          const id = item.id;
          const name = item.name;
          const img = item.img;
          const category = item.category;
          return (
            <Pressable
              key={id}
              style={styles.cardContainer}
              onPress={() =>
                router.push({
                  pathname: "/order/[id]",
                  params: {
                    id,
                    name,
                    category,
                  },
                })
              }
            >
              <View style={[rowCenter, { width: "84%" }]}>
                <View
                  style={{
                    width: "20%",
                    height: 56,
                  }}
                >
                  <Image
                    source={img}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="fill"
                  />
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
                  <Gap height={SPACE_8} />
                  <Text style={[blackTextStyle, { fontSize: 12 }]}>
                    {category}
                  </Text>
                </View>
              </View>
              <View style={{ width: "15%", alignItems: "flex-end" }}>
                <ChevronRight size={28} color={blackColor} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Product;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    minHeight: 100,
    backgroundColor: bgColor,
    paddingVertical: SPACE_16,
  },
  tileAddressContainer: {
    width: "100%",
    maxHeight: 40,
    backgroundColor: whiteColor,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 10,
  },
  cardContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: whiteColor,
    borderRadius: 10,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  cardAddressContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
});
