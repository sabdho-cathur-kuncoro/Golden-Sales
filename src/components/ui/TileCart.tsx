import EditIcon from "@/assets/icons/ic-edit.svg";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  orangeTextStyle,
  pinkSecondaryColor,
  rowCenter,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

function TileCart({ data, onSelect, onTapNote, onPressDelete, onPress }: any) {
  const isItemSelected = data?.isProductSelected;
  const [qty, setQty] = useState(String(data?.qty) ?? "0");

  // useEffect(() => {
  //   setQty(data.qty ?? "0");
  // }, [data.qty]);

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <View style={{ width: "9%" }}>
        <AnimatedPressable onPress={onSelect}>
          <View style={styles.radioContainer}>
            {isItemSelected ? (
              <View style={[styles.radioFillContainer]} />
            ) : (
              <></>
            )}
          </View>
        </AnimatedPressable>
      </View>
      <View style={{ width: "90%" }}>
        {/* PRODUCT NAME & DELETE */}
        <View style={[rowCenter]}>
          <View style={{ width: "85%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {data?.name ?? "-"}
            </Text>
          </View>
          <View
            style={{
              width: "14%",
              alignItems: "flex-end",
            }}
          >
            <AnimatedPressable onPress={onPressDelete}>
              <Trash2 size={20} color={greyColor} />
            </AnimatedPressable>
          </View>
        </View>
        <Gap height={SPACE_4} />
        {/* PRRICE & QTY */}
        <View style={[rowCenter]}>
          <View style={{ width: "55%" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={[
                  orangeTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(data?.discountPrice ?? data?.normalPrice ?? 0)}
              </Text>
              {data?.discountPrice ? (
                <>
                  <Gap width={SPACE_4} />
                  <Text
                    style={[
                      blackTextStyle,
                      {
                        fontSize: 10,
                        textDecorationLine: "line-through",
                      },
                    ]}
                  >
                    {currencyFormat(data?.normalPrice ?? 0)}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
          <View
            style={{
              width: "44%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <AnimatedPressable>
              <View style={styles.btn}>
                <Text
                  style={[
                    greyTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  -
                </Text>
              </View>
            </AnimatedPressable>
            <Gap width={SPACE_8} />
            <TextInput
              value={qty}
              onChangeText={(text) => setQty(text)}
              style={[
                blackTextStyle,
                {
                  minWidth: "10%",
                  fontFamily: FontFamily.satoshiBold,
                },
              ]}
            />
            <Gap width={SPACE_8} />
            <AnimatedPressable>
              <View style={styles.btn}>
                <Text
                  style={[
                    greyTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  +
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </View>
        <Gap height={10} />
        {/* NOTE */}
        <AnimatedPressable onPress={onTapNote}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <EditIcon width={16} height={16} color={greyColor} />
            <Gap width={4} />
            <Text
              style={[
                greyTextStyle,
                { fontSize: 10, fontFamily: FontFamily.satoshiMedium },
              ]}
            >
              Catatan Produk
            </Text>
          </View>
        </AnimatedPressable>
        {/* <Gap height={10} /> */}
        {/* VOUCHER */}
        {/* <AnimatedPressable>
            <View style={styles.rowVoc}>
              <VocIcon width={20} height={20} color={blueSecondaryColor} />
              <Gap width={10} />
              <View
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    width: "auto",
                    maxWidth: "85%",
                  },
                ]}
              >
                {data?.voucher.length > 0 ? (
                  data?.voucher.map((voc: any, index: any) => {
                    const lengthVoc = data?.voucher.length;
                    const vocMoreThanOne = data?.voucher.length > 1;
                    const isLastVoc = index === lengthVoc - 1;
                    return (
                      <View key={index} style={{ flexDirection: "row" }}>
                        <Text
                          style={[
                            greyTextStyle,
                            { fontSize: 12, marginRight: 2 },
                          ]}
                        >
                          {voc ?? "-"}
                        </Text>
                        {vocMoreThanOne && (
                          <Text
                            style={[
                              greyTextStyle,
                              { fontSize: 12, marginRight: 2 },
                            ]}
                          >
                            {!isLastVoc ? "," : ""}
                          </Text>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Tambahkan kode voucher item
                  </Text>
                )}
              </View>
            </View>
          </AnimatedPressable> */}
      </View>
    </Pressable>
  );
}

export default React.memo(TileCart);

const styles = StyleSheet.create({
  radioContainer: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: greyColor,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  radioFillContainer: {
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: orangeColor,
  },
  cardContainer: {
    backgroundColor: whiteColor,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACE_16,
    marginBottom: SPACE_16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },
  iconBinContainer: {
    width: 36,
    height: 36,
    padding: 8,
    borderRadius: 10,
    backgroundColor: pinkSecondaryColor,
  },
  infoContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: bgColor,
    flexDirection: "row",
    alignItems: "center",
  },
  btn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: greyTertiaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  rowVoc: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: lineColor,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: SPACE_8,
    paddingVertical: SPACE_4,
  },
});
