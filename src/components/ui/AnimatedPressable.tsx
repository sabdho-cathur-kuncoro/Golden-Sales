import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = ({
  children,
  onPress,
  disabled = false,
  hitSlop = 8,
  fireOnPressIn = false,
  ...rest
}: any) => {
  const scale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.95, { duration: 100 });
    // Fire on press-down so a ScrollView can't cancel the tap between
    // press-in and press-out (the qty +/- multiple-press bug on Android).
    if (fireOnPressIn) onPress?.();
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withTiming(1, { duration: 100 });
  };
  // Touch responder stays on the static Pressable; the scale animation lives on
  // an inner Animated.View. Animating the transform on the touch node itself made
  // Android (esp. Samsung) read the press-in shrink as a move-out and cancel the
  // tap inside a ScrollView — the qty +/- buttons then needed multiple presses.
  return (
    <Pressable
      onPress={disabled || fireOnPressIn ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      {...rest}
    >
      <Animated.View style={[styles.button, btnStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedPressable;

const styles = StyleSheet.create({
  button: {
    width: "auto",
    height: "auto",
  },
});
