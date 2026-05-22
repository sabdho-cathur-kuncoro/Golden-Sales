import BinIcon from "@/assets/icons/ic-bin.svg";
import EditIcon from "@/assets/icons/ic-edit.svg";
import { AnimatedPressable, Button, Gap, Header } from "@/components/ui";
import { ProductItemData } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineDash,
  orangeTextStyle,
  primaryColor,
  primaryTextStyle,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_48,
  whiteColor,
} from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";

const RincianRequestProduct = () => {
  const { id, name } = useLocalSearchParams();
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Rincian Permintaan"}
        isIconVisible
        onBack={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[{ paddingTop: SPACE_16, paddingBottom: 100 }]}
      >
        {/* PRODUK */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Produk Order
          </Text>
          <Gap height={SPACE_16} />
          <Text
            style={[orangeTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            {name}
          </Text>
          <Gap height={10} />
          {ProductItemData.map((item: any, index: any) => {
            const isLast = index === ProductItemData.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.productTileContainer,
                  { marginBottom: isLast ? 0 : SPACE_16 },
                ]}
              >
                <View style={[rowCenter]}>
                  <View style={{ width: "78%" }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontFamily: FontFamily.satoshiMedium },
                      ]}
                    >
                      {item?.name}
                    </Text>
                    <Gap height={10} />
                    <Text style={[greyTextStyle, { fontSize: 12 }]}>
                      {currencyFormat(item?.price)} / 20
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <AnimatedPressable>
                      <EditIcon width={24} color={primaryColor} />
                    </AnimatedPressable>
                    <Gap width={SPACE_16} />
                    <AnimatedPressable>
                      <BinIcon width={24} color={primaryColor} />
                    </AnimatedPressable>
                  </View>
                </View>
                <Gap height={20} />
                <View style={[rowCenter]}>
                  <View style={[{ width: "60%" }]}>
                    <Text
                      style={[
                        orangeTextStyle,
                        { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                      ]}
                    >
                      {currencyFormat(item?.sub_total_price)}
                    </Text>
                  </View>
                  <View style={[styles.qtyContainer]}>
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
                        value={String(20)}
                        // onChangeText={(text) => setQty(text)}
                        style={[
                          blackTextStyle,
                          {
                            height: 42,
                            fontFamily: FontFamily.satoshiBold,
                            fontSize: 16,
                          },
                        ]}
                      />
                    </View>
                    <View style={{ width: "20%" }}>
                      <AnimatedPressable>
                        <Plus size={22} color={primaryColor} />
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {/* NOTE */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Catatan Permintaan Barang{" "}
            <Text style={[greyTextStyle]}>(Opsional)</Text>
          </Text>
          <Gap height={SPACE_16} />
          <TextInput
            placeholder="Tulis Catatan"
            placeholderTextColor={greyColor}
            style={[blackTextStyle, styles.noteInputContainer]}
            multiline
            textAlignVertical="top"
          />
        </View>
        {/* RINCIAN */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Rincian Permintaan
          </Text>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Total Jenis Produk</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                5 Produk
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Total Unit Keseluruhan</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                40 Item
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={lineDash} />
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                Total Harga Muat
              </Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(1_800_000)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        <View style={[styles.half]}>
          <Text style={[greyTextStyle]}>Total Harga Muat</Text>
          <Text
            style={[
              primaryTextStyle,
              { fontSize: 16, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            {currencyFormat(1_800_000)}
          </Text>
        </View>
        <View style={[styles.half]}>
          <Button title="Submit Permintaan" />
        </View>
      </View>
    </View>
  );
};

export default RincianRequestProduct;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  productTileContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: bgColor,
    borderRadius: 10,
    padding: 10,
  },
  qtyContainer: {
    width: "38%",
    borderWidth: 1,
    borderColor: bgColor,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteInputContainer: {
    width: "100%",
    height: 64,
    borderWidth: 1,
    borderColor: bgColor,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  half: {
    width: "49%",
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
});
