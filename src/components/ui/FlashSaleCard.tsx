import {
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  orangeTextStyle,
  primaryColor,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import { Flame } from "lucide-react-native";
import React, { useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Gap from "./Gap";

type TypeFlashSale = {
  discount: string;
  productName: string;
  category: string;
  normalPrice: string;
  discountPrice: string;
  onPress: () => void;
};

const FlashSaleCard = ({
  discount,
  productName,
  category,
  normalPrice,
  discountPrice,
  onPress,
}: TypeFlashSale) => {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.cardContainer, { width: width * 0.4 }]}>
      {/* <View style={styles.discountbannerContainer}>
        <Text
          style={[
            whiteTextStyle,
            {
              fontSize: 12,
              fontFamily: FontFamily.satoshiMedium,
            },
          ]}
        >
          {discount}%
        </Text>
      </View>
      <Gap height={10} /> */}
      <View>
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          {productName}
        </Text>
        <Gap height={2} />
        <Text style={[greyTextStyle, { fontSize: 12 }]}>{category}</Text>
      </View>
      <Gap height={10} />
      <View>
        <Text
          style={[
            greyTextStyle,
            { fontSize: 12, textDecorationLine: "line-through" },
          ]}
        >
          {normalPrice}
        </Text>
        <Gap height={2} />
        <Text style={[orangeTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          {discountPrice}
        </Text>
      </View>
      {/* <Gap height={20} />
      <AnimatedPressable onPress={onPress}>
        <LinearGradient
          style={styles.btnContainer}
          colors={primaryGradientColor}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 0.7 }}
        >
          <Text
            style={[
              whiteTextStyle,
              {
                fontSize: 12,
                fontFamily: FontFamily.satoshiBold,
              },
            ]}
          >
            Beli Sekarang
          </Text>
        </LinearGradient>
      </AnimatedPressable> */}
    </View>
  );
};

export default FlashSaleCard;

export const FlashSaleCardSkeleton = () => {
  const { width } = useWindowDimensions();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.cardContainer, { width: width * 0.4 }]}>
      <Gap height={10} />
      <Animated.View style={[styles.bone, { width: "80%" }, animatedStyle]} />
      <Gap height={6} />
      <Animated.View style={[styles.bone, { width: "50%" }, animatedStyle]} />
      <Gap height={16} />
      <Animated.View style={[styles.bone, { width: "60%" }, animatedStyle]} />
      <Gap height={6} />
      <Animated.View style={[styles.bone, { width: "70%" }, animatedStyle]} />
      <Gap height={20} />
      <Animated.View style={[styles.bone, styles.boneBtn, animatedStyle]} />
    </View>
  );
};

export const FlashSaleCardEmpty = () => {
  return (
    <View style={styles.emptyContainer}>
      <Flame size={32} color={greyTextStyle.color as string} />
      <Gap height={8} />
      <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
        Belum ada flash sale
      </Text>
      <Gap height={2} />
      <Text style={[greyTextStyle, { fontSize: 12, textAlign: "center" }]}>
        Nantikan flash sale dengan harga spesial, ya!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    maxHeight: 200,
    justifyContent: "space-between",
    backgroundColor: whiteColor,
    padding: 10,
    borderRadius: 10,
    marginRight: SPACE_16,
  },
  discountbannerContainer: {
    position: "absolute",
    alignSelf: "center",
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 33,
    backgroundColor: primaryColor,
  },
  btnContainer: {
    width: "100%",
    padding: 10,
    borderRadius: 41,
    alignItems: "center",
  },
  bone: {
    height: 14,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  boneBtn: {
    width: "100%",
    height: 38,
    borderRadius: 41,
  },
  emptyContainer: {
    maxHeight: 200,
    alignSelf: "flex-start",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    borderRadius: 10,
    marginRight: SPACE_16,
    alignItems: "center",
    justifyContent: "center",
  },
});
