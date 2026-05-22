import {
  blackTextStyle,
  greyTextStyle,
  lineColor,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Gap from "./Gap";

const current = "SLS-001";

const ChatBubble = React.memo(({ data }: any) => {
  const account = data?.sender_id === current;
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
    <View style={[account ? styles.sender : styles.recipient, styles.bubble]}>
      <Text style={[account ? whiteTextStyle : blackTextStyle]}>
        {data?.message ?? "-"}
      </Text>
      <Gap height={10} />
      <Text
        style={[
          account ? styles.textSender : styles.textRecipient,
          { fontSize: 10 },
        ]}
      >
        {data?.time ?? "-"}
      </Text>
    </View>
  );
});

export default React.memo(ChatBubble);

const styles = StyleSheet.create({
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
  bubble: {
    minWidth: "49%",
    maxWidth: "65%",
    padding: 10,
    marginBottom: SPACE_16,
  },
  sender: {
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    alignSelf: "flex-end",
    backgroundColor: "#324971",
  },
  recipient: {
    alignSelf: "flex-start",
    borderTopEndRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
    backgroundColor: whiteColor,
  },
  textSender: {
    ...whiteTextStyle,
    textAlign: "right",
  },
  textRecipient: {
    ...blackTextStyle,
    textAlign: "left",
  },
});
