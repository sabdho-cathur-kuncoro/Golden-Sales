import {
  blackTextStyle,
  darkBlueColor,
  darkBlueRGBAColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greyTextStyle,
  lineColor,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BadgeCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../../utils/days";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

const TileNotif = React.memo(({ data, onPress }: any) => {
  return (
    <AnimatedPressable onPress={onPress}>
      <View style={styles.cardContainer}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                data?.type === "delivery" ? darkBlueRGBAColor : greenRGBAColor,
            },
          ]}
        >
          {data?.type === "delivery" ? (
            <FontAwesome6 name={"truck-fast"} size={24} color={darkBlueColor} />
          ) : (
            <BadgeCheck size={28} color={greenColor} />
          )}
        </View>
        <Gap height={SPACE_16} />
        <Text
          style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          {data?.title ?? "-"}
        </Text>
        <Gap height={SPACE_16} />
        {data?.type === "delivery" ? (
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Pesanan{" "}
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {data?.order_id ?? "-"}
            </Text>{" "}
            sedang dalam perjalanan ke lokasi.
          </Text>
        ) : (
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Sales{" "}
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {data?.sales_name ?? "-"}
            </Text>{" "}
            telah menyetujui pesanan{" "}
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {data?.order_id ?? "-"}.
            </Text>{" "}
            Silakan pantau status selanjutnya di Menu Transaksi.
          </Text>
        )}
        <Gap height={SPACE_16} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          {formatDate(new Date())}
        </Text>
      </View>
    </AnimatedPressable>
  );
});

export default React.memo(TileNotif);

const styles = StyleSheet.create({
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
