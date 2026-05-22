import { Button, Gap } from "@/components/ui";
import {
  blackTextStyle,
  FontFamily,
  primaryColor,
  screen,
  SPACE_16,
  SPACE_32,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StatusType = "success" | "error" | "warning" | "info" | "empty";

type ActionProps = {
  title: string;
  onPress: () => void;
};

type SuccessScreenProps = {
  type?: StatusType;
  title: string;
  message: string;
  primaryAction: ActionProps;
  secondaryAction?: ActionProps;
};

const StatusScreen = ({
  title,
  message,
  primaryAction,
  secondaryAction,
}: SuccessScreenProps) => {
  return (
    <View style={[screen, styles.container]}>
      <View style={styles.imgContainer}>
        <Image
          source={require("@/assets/images/img4.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </View>
      <Gap height={SPACE_32} />
      <Text
        style={[
          blackTextStyle,
          styles.textCenter,
          { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
        ]}
      >
        {title}
      </Text>
      <Gap height={SPACE_8} />
      <Text style={[blackTextStyle, styles.textCenter]}>{message}</Text>
      <Gap height={SPACE_32} />
      <View style={{ width: "80%", alignSelf: "center" }}>
        <Button title={primaryAction?.title} onPress={primaryAction?.onPress} />
      </View>
      {secondaryAction ? (
        <View style={{ width: "80%", alignSelf: "center" }}>
          <Gap height={SPACE_16} />
          <Button
            title={secondaryAction?.title}
            onPress={secondaryAction?.onPress}
            titleColor={primaryColor}
            borderColor={primaryColor}
            border={1}
            bgColor={"transparent"}
          />
        </View>
      ) : null}
    </View>
  );
};

export default StatusScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    alignItems: "center",
    justifyContent: "center",
  },
  imgContainer: { width: "70%", height: 150 },
  textCenter: {
    textAlign: "center",
  },
});
