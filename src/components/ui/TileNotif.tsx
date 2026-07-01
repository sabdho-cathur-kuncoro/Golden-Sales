import {
  bgSecondaryColor,
  blackTextStyle,
  darkBlueColor,
  darkBlueRGBAColor,
  dot,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greyTextStyle,
  lineColor,
  redStrokeColor,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BadgeCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatDateTime } from "../../../utils/days";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

function TileNotif({ data, onPress }: any) {
  const isUnread = data?.status
    ? data.status === "unread"
    : data?.isRead === false;
  const body = data?.body ?? data?.snipet;
  const created = data?.createdAt ?? data?.created_at;
  const isDelivery = data?.type === "delivery";

  return (
    <AnimatedPressable onPress={onPress}>
      <View
        style={[
          styles.cardContainer,
          isUnread && {
            backgroundColor: bgSecondaryColor,
            borderColor: redStrokeColor,
          },
        ]}
      >
        {isUnread ? <View style={styles.unreadDot} /> : null}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDelivery ? darkBlueRGBAColor : greenRGBAColor,
            },
          ]}
        >
          {isDelivery ? (
            <FontAwesome6 name={"truck-fast"} size={24} color={darkBlueColor} />
          ) : (
            <BadgeCheck size={28} color={greenColor} />
          )}
        </View>
        <Gap height={SPACE_16} />
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}>
          {data?.title ?? "-"}
        </Text>
        <Gap height={SPACE_16} />
        {body ? (
          <Text style={[greyTextStyle, { fontSize: 12 }]}>{body}</Text>
        ) : isDelivery ? (
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Pesanan{" "}
            <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
              {data?.order_id ?? "-"}
            </Text>{" "}
            sedang dalam perjalanan ke lokasi.
          </Text>
        ) : (
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Sales{" "}
            <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
              {data?.sales_name ?? "-"}
            </Text>{" "}
            telah menyetujui pesanan{" "}
            <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
              {data?.order_id ?? "-"}.
            </Text>{" "}
            Silakan pantau status selanjutnya di Menu Transaksi.
          </Text>
        )}
        <Gap height={SPACE_16} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          {formatDateTime(created, "DD MMM YYYY HH:mm")}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

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
  unreadDot: {
    ...dot,
    width: 8,
    height: 8,
    borderRadius: 8,
    position: "absolute",
    top: SPACE_16,
    right: SPACE_16,
  },
});
