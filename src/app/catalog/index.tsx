import { Gap, Header } from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  paddingScroll,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import useCatalog from "@/hooks/useCatalog";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const Catalog = () => {
  const { catalogItem, fetchCatalog } = useCatalog();

  useEffect(() => {
    fetchCatalog();
  }, []);
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Katalog"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[paddingScroll]}
      >
        {catalogItem.map((item: any) => {
          const id = item.id;
          const name = item.name;
          const img = item.img;
          const slug = item.slug;
          return (
            <Pressable
              key={id}
              style={styles.cardContainer}
              onPress={() =>
                router.push({
                  pathname: "/catalog/[id]",
                  params: {
                    id,
                    name,
                    slug,
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
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Catalog;

const styles = StyleSheet.create({
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
