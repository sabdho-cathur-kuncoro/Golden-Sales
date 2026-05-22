import OrderIcon from "@/assets/icons/ic-order.svg";
import { AnimatedPressable, Button, Gap, Header } from "@/components/ui";
import { ProductItemData } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  lineColor,
  primaryColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_48,
  SPACE_8,
  whiteColor,
  yellowColor,
} from "@/constants/theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus, Star } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";

const ProductDetail = () => {
  const { id, name, category } = useLocalSearchParams();
  const [qty, setQty] = useState("0");
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={name} isIconVisible onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      >
        <View style={styles.cardContainer}>
          <View style={styles.imgContainer}>
            <Image
              source={require("@/assets/images/img3.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          </View>
          <View style={[rowCenter, { width: "100%" }]}>
            <View style={{ width: "80%" }}>
              <Text
                style={[
                  blackTextStyle,
                  { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {name}
              </Text>
              <Gap height={SPACE_8} />
              <Text style={[greyTextStyle, { fontSize: 12 }]}>{category}</Text>
            </View>
            <View style={{ width: "20%", alignItems: "flex-end" }}>
              <Star size={20} color={yellowColor} />
            </View>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Pilih Produk
          </Text>
          <Gap height={SPACE_16} />
          {ProductItemData.map((item: any, index: any) => {
            const isLast = index === ProductItemData.length - 1;
            return (
              <View
                key={item?.id}
                style={[
                  styles.productTileContainer,
                  { marginBottom: isLast ? 0 : SPACE_16 },
                ]}
              >
                <View style={{ width: "60%" }}>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {item?.name}
                  </Text>
                  <Gap height={10} />
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    {currencyFormat(item?.price)} / {item?.unit}
                  </Text>
                </View>
                <View style={styles.qtyContainer}>
                  <View style={{ width: "20%" }}>
                    <AnimatedPressable>
                      <Minus size={22} color={primaryColor} />
                    </AnimatedPressable>
                  </View>
                  <View
                    style={{
                      width: "55%",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      value={qty}
                      onChangeText={(text) => setQty(text)}
                      style={[blackTextStyle, { height: 42 }]}
                    />
                  </View>
                  <View style={{ width: "20%" }}>
                    <AnimatedPressable>
                      <Plus size={22} color={primaryColor} />
                    </AnimatedPressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        <View style={{ width: "20%" }}>
          <AnimatedPressable>
            <View style={styles.orderBtnContainer}>
              <OrderIcon width={26} color={primaryColor} />
            </View>
          </AnimatedPressable>
        </View>
        <View style={{ width: "75%" }}>
          <Button
            title="Buat Pesanan"
            onPress={() =>
              router.push({
                pathname: "/order/rincian",
                params: { id, name },
              })
            }
          />
        </View>
      </View>
    </View>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  imgContainer: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: bgColor,
    marginBottom: 20,
  },
  productTileContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
  },
  qtyContainer: {
    width: "38%",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: whiteColor,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderBtnContainer: {
    width: 66,
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: lineColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
