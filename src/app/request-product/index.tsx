import { AnimatedPressable, Gap, Header } from "@/components/ui";
import { CategoryData, ProductData } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  paddingH,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const RequestProduct = () => {
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Minta Barang"}
        isIconVisible
        onBack={() => router.back()}
      />
      {/* Category */}
      <View
        style={{
          width: "100%",
          minHeight: 36,
          backgroundColor: bgColor,
        }}
      >
        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingLeft: SPACE_16,
            paddingVertical: SPACE_16,
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
                  pathname: "/request-product/[id]",
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

export default RequestProduct;

const styles = StyleSheet.create({
  categoryContainer: {
    minWidth: 72,
    minHeight: 36,
    marginRight: 10,
    padding: 10,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
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
});
