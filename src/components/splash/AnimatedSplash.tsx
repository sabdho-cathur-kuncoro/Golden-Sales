import Shadow from "@/assets/images/splash-shadow.svg";
import { FontFamily, primaryColor, whiteTextStyle } from "@/constants/theme";
import React, { useEffect } from "react";
import { Dimensions, Image, StatusBar, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onFinish?: () => void;
};

const { width, height } = Dimensions.get("window");

export default function AnimatedSplash({ onFinish }: Props) {
  const delay = 350;

  const logoY = useSharedValue(120);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoX = useSharedValue(0);

  const shadowScaleX = useSharedValue(1);
  const shadowScaleY = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.5);

  const line1X = useSharedValue(-250);
  const line2X = useSharedValue(-250);

  useEffect(() => {
    logoY.value = withDelay(
      delay,
      withSequence(
        withTiming(-10, { duration: 650, easing: Easing.out(Easing.cubic) }),
        withSpring(0, { damping: 50, stiffness: 100 })
      )
    );

    logoScale.value = withDelay(
      delay,
      withSequence(withTiming(1.15, { duration: 600 }), withSpring(1))
    );

    logoOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));

    // SHADOW STRETCH EFFECT
    shadowScaleX.value = withDelay(
      delay,
      withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(0.35, { duration: 700 })
      )
    );

    shadowScaleY.value = withDelay(
      delay,
      withSequence(
        withTiming(0.9, { duration: 300 }),
        withTiming(0.35, { duration: 700 })
      )
    );
    shadowOpacity.value = withDelay(delay, withTiming(0, { duration: 650 }));

    const phase2Delay = delay + 900;

    // LOGO SLIDE + MICRO SETTLE
    logoX.value = withDelay(
      phase2Delay,
      withSequence(
        withTiming(-120, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withSpring(-120, { damping: 120, stiffness: 200 })
      )
    );

    // TEXT REVEAL
    line1X.value = withDelay(
      phase2Delay + 120,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    line2X.value = withDelay(
      phase2Delay + 240,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // on finish
    const totalDuration = 4000;

    const timer = setTimeout(() => {
      onFinish?.();
    }, totalDuration);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoY.value },
      { translateX: logoX.value },
      { scale: logoScale.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
    transform: [{ scaleX: shadowScaleX.value }, { scaleY: shadowScaleY.value }],
  }));

  const line1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: line1X.value }],
  }));

  const line2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: line2X.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <Animated.View style={[styles.shadow, shadowStyle]}>
        <Shadow width={width / 2.2} height={100} />
      </Animated.View>

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require("../../../assets/images/logo-golden.png")}
          style={styles.logo}
        />
      </Animated.View>

      <View style={styles.textContainer}>
        <View style={styles.mask}>
          <Animated.Text style={[whiteTextStyle, styles.title, line1Style]}>
            Golden
          </Animated.Text>
        </View>

        <View style={styles.mask}>
          <Animated.Text
            style={[whiteTextStyle, styles.title, line2Style, { marginTop: 2 }]}
          >
            Communication
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: primaryColor,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  shadow: {
    position: "absolute",
    bottom: height * 0.3,
    opacity: 0.3,
  },

  logoContainer: {
    position: "absolute",
    bottom: height * 0.45,
  },

  logo: {
    width: 90,
    height: 90,
  },

  textContainer: {
    position: "absolute",
    bottom: height * 0.45 + 20,
    left: width / 3.2 + 16,
  },

  mask: {
    overflow: "hidden",
    width: 250,
  },

  title: {
    fontSize: 20,
    fontFamily: FontFamily.satoshiBold,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});
