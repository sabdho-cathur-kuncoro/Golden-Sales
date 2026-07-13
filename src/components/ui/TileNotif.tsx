import {
  bgSecondaryColor,
  blackTextStyle,
  darkBlueColor,
  darkBlueRGBAColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greyColor,
  greyTextStyle,
  lineColor,
  redColor,
  redStrokeColor,
  SPACE_4,
  SPACE_8,
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
          isUnread && styles.cardUnread,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDelivery ? darkBlueRGBAColor : greenRGBAColor,
            },
          ]}
        >
          {isDelivery ? (
            <FontAwesome6 name={"truck-fast"} size={20} color={darkBlueColor} />
          ) : (
            <BadgeCheck size={22} color={greenColor} />
          )}
        </View>
        <Gap width={SPACE_8} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[
                blackTextStyle,
                styles.title,
                isUnread && { fontFamily: FontFamily.satoshiBold },
              ]}
              numberOfLines={1}
            >
              {data?.title ?? "-"}
            </Text>
            {isUnread ? <View style={styles.unreadDot} /> : null}
          </View>
          <Gap height={SPACE_4} />
          {body ? (
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>
          ) : isDelivery ? (
            <Text style={styles.body} numberOfLines={2}>
              Pesanan{" "}
              <Text style={styles.bodyStrong}>{data?.order_id ?? "-"}</Text>{" "}
              sedang dalam perjalanan ke lokasi.
            </Text>
          ) : (
            <Text style={styles.body} numberOfLines={2}>
              Sales <Text style={styles.bodyStrong}>{data?.sales_name ?? "-"}</Text>{" "}
              telah menyetujui pesanan{" "}
              <Text style={styles.bodyStrong}>{data?.order_id ?? "-"}</Text>.
              Silakan pantau status di Menu Transaksi.
            </Text>
          )}
          <Gap height={SPACE_8} />
          <Text style={styles.timestamp}>
            {formatDateTime(created, "DD MMM YYYY HH:mm")}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(TileNotif);

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACE_16,
    borderRadius: 12,
    backgroundColor: whiteColor,
    marginBottom: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
  },
  cardUnread: {
    backgroundColor: bgSecondaryColor,
    borderColor: redStrokeColor,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.satoshiMedium,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: redColor,
    marginLeft: SPACE_8,
  },
  body: {
    ...greyTextStyle,
    fontSize: 12,
    lineHeight: 17,
  },
  bodyStrong: {
    color: blackTextStyle.color,
    fontFamily: FontFamily.satoshiBold,
  },
  timestamp: {
    color: greyColor,
    fontFamily: FontFamily.satoshiRegular,
    fontSize: 10,
  },
});
