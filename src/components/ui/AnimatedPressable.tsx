import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

const AnimatedPressable = ({ children, onPress }: any) => {
  const scale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };
  return (
    <AnimatedPressableComponent
      style={[styles.button, btnStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={6}
    >
      {children}
    </AnimatedPressableComponent>
  );
};

export default AnimatedPressable;

const styles = StyleSheet.create({
  button: {
    width: "auto",
    height: "auto",
  },
});
