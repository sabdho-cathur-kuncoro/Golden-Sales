import {
  FontFamily,
  greyColor,
  greySecondaryColor,
  primaryColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Gap from "./Gap";

const AnimatedBtnPressable = Animated.createAnimatedComponent(Pressable);

const GradientButton = ({
  title,
  height = 48,
  radius = 48,
  fontSize = 16,
  icon = null,
  disabled = false,
  loading = false,
  onPress,
}: any) => {
  const scale = useSharedValue(1);
  const isBlocked = disabled || loading;

  const btnStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (isBlocked) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    if (isBlocked) return;
    scale.value = withTiming(1, { duration: 100 });
  };
  return (
    <AnimatedBtnPressable
      onPress={isBlocked ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isBlocked}
      style={[btnStyle, { opacity: isBlocked ? 0.6 : 1 }]}
    >
      <LinearGradient
        style={[
          styles.btnContainer,
          {
            borderRadius: radius,
            height,
            flexDirection: icon ? "row" : "column",
          },
        ]}
        colors={[
          disabled ? greySecondaryColor : "#FE9F9F",
          disabled ? greyColor : primaryColor,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color={whiteColor} />
        ) : (
          <>
            {icon && (typeof icon === "function" ? icon() : icon)}
            {icon && <Gap width={10} />}
            <Text
              style={[
                whiteTextStyle,
                {
                  fontSize,
                  fontFamily: FontFamily.satoshiMedium,
                  textAlign: "center",
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedBtnPressable>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  btnContainer: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
