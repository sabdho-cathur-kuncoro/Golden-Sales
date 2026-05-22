import {
  blackTextStyle,
  blueSecondaryColor,
  FontFamily,
  greenColor,
  greyTextStyle,
  inactiveColor,
  inactiveTextStyle,
  lightBlueColor,
  redColor,
  SPACE_16,
  SPACE_4,
  SPACE_8,
} from "@/constants/theme";
import { Circle, CircleCheck, CircleX } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Gap from "./Gap";

const StatusRow = ({ data, isLast }: any) => {
  return (
    <View
      key={data?.id}
      style={[
        {
          flexDirection: "row",
          marginBottom: SPACE_8,
        },
      ]}
    >
      <View
        style={{
          width: "10%",
          alignItems: "center",
        }}
      >
        {data?.is_reject ? (
          <CircleX size={24} color={redColor} />
        ) : data?.step_done ? (
          <CircleCheck size={24} color={greenColor} />
        ) : data?.current_step ? (
          <View
            style={[
              styles.statusCircle,
              {
                backgroundColor: blueSecondaryColor,
                borderColor: lightBlueColor,
              },
            ]}
          />
        ) : (
          <Circle size={24} color={inactiveColor} />
        )}
        <Gap height={SPACE_4} />
        {!isLast ? (
          <View
            style={[
              styles.verticalLine,
              { backgroundColor: data?.step_done ? greenColor : inactiveColor },
            ]}
          />
        ) : null}
      </View>
      <Gap width={SPACE_16} />
      <View style={{ width: "85%" }}>
        {data?.step_done ? (
          <>
            <Text
              style={[
                blackTextStyle,
                {
                  fontFamily: isLast
                    ? FontFamily.satoshiBold
                    : FontFamily.satoshiMedium,
                },
              ]}
            >
              {data?.status_name}
            </Text>
            <Text style={[greyTextStyle, { fontSize: 12 }]}>
              {data?.created_at}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                data?.current_step ? blackTextStyle : inactiveTextStyle,
                {
                  fontFamily: FontFamily.satoshiMedium,
                },
              ]}
            >
              {data?.status_name}
            </Text>
            {data?.current_step ? (
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {data?.created_at}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
};

export default StatusRow;

const styles = StyleSheet.create({
  verticalLine: {
    width: 1,
    minHeight: 24,
    flex: 1,
  },
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
    borderWidth: 3,
  },
});
