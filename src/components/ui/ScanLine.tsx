import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ScanLine = () => {
  const translateY = useSharedValue(-50);
  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // NOTE: ANIMATED
  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(200, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        reanimatedStyle,
        {
          width: "100%",
          height: 30,
        },
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(77, 189, 241, 0.05)",
          "rgba(77, 189, 241, 0.5)",
          "rgba(77, 189, 241, 0.05)",
        ]}
        style={{ width: "100%", height: 30 }}
      />
    </Animated.View>
  );
};

export default ScanLine;
