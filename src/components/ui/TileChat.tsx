import {
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  lineColor,
  pinkColor,
  pinkSecondaryColor,
  primaryColor,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import MaterialIC from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

const TileChat = React.memo(({ data, onPress }: any) => {
  if (data?.type === "day") {
    return (
      <View style={styles.dayContainer}>
        <View style={[styles.lineDay]} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>{data?.date}</Text>
        <View style={[styles.lineDay]} />
      </View>
    );
  }
  return (
    <AnimatedPressable onPress={onPress}>
      <View style={styles.cardContainer}>
        <View
          style={{
            width: "85%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={styles.iconContainer}>
            <MaterialIC name="message-text" size={24} color={pinkColor} />
          </View>
          <Gap width={12} />
          <View style={{ width: "80%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {data?.order_id ?? "-"}
            </Text>
            <Gap height={10} />
            <Text
              style={[greyTextStyle, { fontSize: 12 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {data?.message}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: "15%",
            alignItems: "flex-end",
          }}
        >
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            {data?.time ?? "-"}
          </Text>
          {data?.unread_message > 0 ? (
            <>
              <Gap height={12} />
              <View style={styles.dot}>
                <Text style={[whiteTextStyle, { fontSize: 12 }]}>
                  {data?.unread_message}
                </Text>
              </View>
            </>
          ) : (
            <></>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
});

export default React.memo(TileChat);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: pinkSecondaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  dayContainer: {
    width: "100%",
    marginBottom: SPACE_16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lineDay: {
    width: "auto",
    minWidth: "30%",
    height: 1,
    backgroundColor: lineColor,
  },
});
