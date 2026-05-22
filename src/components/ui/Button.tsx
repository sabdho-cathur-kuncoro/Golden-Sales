// components/ui/Button.tsx

import { FontFamily, primaryColor, whiteColor } from "@/constants/theme";
import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Gap from "./Gap";

type Props = {
  title: string;
  titleColor?: any;
  bgColor?: any;
  borderColor?: any;
  border?: number;
  isIconVisible?: boolean;
  radius?: number;
  onPress?: () => void;
};
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  title,
  isIconVisible = false,
  radius = 10,
  titleColor = whiteColor,
  bgColor = primaryColor,
  borderColor = primaryColor,
  border = 0,
  onPress,
}: Props) {
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
    <AnimatedPressable
      style={[
        styles.button,
        btnStyle,
        {
          borderRadius: radius,
          backgroundColor: bgColor,
          borderWidth: border,
          borderColor,
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={[styles.text, { color: titleColor }]}>{title}</Text>
      {isIconVisible && (
        <>
          <Gap width={10} />
          <ArrowRight size={18} color={whiteColor} />
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: FontFamily.satoshiRegular,
  },
});
