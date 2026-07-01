import {
  blackColor,
  blackRGBAColor,
  blackTextStyle,
  blueColor,
  blueRGBAColor,
  blueTextStyle,
  FontFamily,
  greenColor,
  greenSecondaryColor,
  greenSecondaryRGBAColor,
  greenSecTextStyle,
  greySecondaryColor,
  line,
  orangeColor,
  orangeRGBAColor,
  orangeTextStyle,
  primaryTextStyle,
  purpleColor,
  purpleRGBAColor,
  purpleTextStyle,
  redColor,
  redRGBAColor,
  redTextStyle,
  rowCenter,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import Gap from "./Gap";

const TileOrder = ({
  item,
  isReport = false,
  onPress,
  showComplete = false,
  completeLoading = false,
  onComplete,
}: any) => {
  const id = item?.id;
  const customerName = item?.customer_name;
  const customerPhone = item?.customer_phone;
  const date = item?.created_at;
  const statusOrder = item?.status_order_name;
  const qty = item?.qty;
  const subtotal = item?.subtotal;
  const paymentMethod = item?.payment_method;
  const disprosesSales = item?.status_order === 1;
  const disprosesSO = item?.status_order === 2;
  const disiapkanGudang = item?.status_order === 3;
  const dikirim = item?.status_order === 4;
  const selesai = item?.status_order === 5;
  const reject = item?.status_order === 6;
  return (
    <Pressable onPress={onPress} style={styles.tileContainer}>
      <View style={rowCenter}>
        <View style={{ width: "55%" }}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            {id}
          </Text>
        </View>
        <View style={{ width: "44%", alignItems: "flex-end" }}>
          <Text style={[styles.textDate]}>{date}</Text>
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
            {customerName}
          </Text>
          <Gap height={SPACE_4} />
          <Text style={[blackTextStyle]}>{customerPhone}</Text>
        </View>
        <View style={{ width: "49%", alignItems: "flex-end" }}>
          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor:
                  disprosesSales || disprosesSO
                    ? orangeRGBAColor
                    : disiapkanGudang
                    ? purpleRGBAColor
                    : dikirim
                    ? blueRGBAColor
                    : selesai
                    ? greenSecondaryRGBAColor
                    : reject
                    ? redRGBAColor
                    : blackRGBAColor,
                borderColor:
                  disprosesSales || disprosesSO
                    ? orangeColor
                    : disiapkanGudang
                    ? purpleColor
                    : dikirim
                    ? blueColor
                    : selesai
                    ? greenSecondaryColor
                    : reject
                    ? redColor
                    : blackColor,
              },
            ]}
          >
            <Text
              style={[
                disprosesSales || disprosesSO
                  ? orangeTextStyle
                  : disiapkanGudang
                  ? purpleTextStyle
                  : dikirim
                  ? blueTextStyle
                  : selesai
                  ? greenSecTextStyle
                  : reject
                  ? redTextStyle
                  : blackTextStyle,
                { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
              ]}
            >
              {statusOrder}
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
            style={[orangeTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            {qty} Item
          </Text>
        </View>
        <View style={{ width: "49%", alignItems: "flex-end" }}>
          <Text style={[blackTextStyle]}>
            {isReport ? "Subtotal" : "Metode Pembayaran"}
          </Text>
          <Gap height={SPACE_4} />
          <Text
            style={[
              isReport ? primaryTextStyle : blackTextStyle,
              {
                fontFamily: isReport
                  ? FontFamily.satoshiBold
                  : FontFamily.satoshiMedium,
              },
            ]}
          >
            {isReport ? currencyFormat(subtotal) : paymentMethod}
          </Text>
        </View>
      </View>
      {showComplete ? (
        <>
          <Gap height={SPACE_16} />
          <Pressable
            onPress={onComplete}
            disabled={completeLoading}
            style={[
              styles.completeBtn,
              completeLoading && { opacity: 0.6 },
            ]}
          >
            <CheckCircle size={16} color={whiteColor} />
            <Gap width={SPACE_8} />
            <Text
              style={[
                blackTextStyle,
                {
                  color: whiteColor,
                  fontSize: 13,
                  fontFamily: FontFamily.satoshiMedium,
                },
              ]}
            >
              {completeLoading
                ? "Memproses..."
                : "Selesai — Masukkan ke Stock"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </Pressable>
  );
};

export default TileOrder;

const styles = StyleSheet.create({
  tileContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  statusContainer: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 57,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: greenColor,
    borderRadius: 10,
    paddingVertical: 10,
  },
  textDate: {
    fontFamily: FontFamily.satoshiMedium,
    fontSize: 12,
    color: greySecondaryColor,
  },
});
