import {
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  orangeTextStyle,
  primaryTextStyle,
  redColor,
  SPACE_16,
  SPACE_4,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { Image } from "expo-image";
import { Flame } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { currencyFormat } from "../../../utils/currencyFormat";
import Gap from "./Gap";

const FlashSaleCard = ({ data }: any) => {
  return (
    <View key={data.id} style={styles.tileContainer}>
      <View
        style={{
          width: "25%",
          height: 100,
          borderRadius: 10,
        }}
      >
        <Image
          source={data?.image}
          style={{ width: "100%", height: "100%" }}
          contentFit="fill"
        />
      </View>
      <View style={{ width: "45%" }}>
        <View style={styles.discountContainer}>
          <Text
            style={[
              whiteTextStyle,
              {
                fontSize: 12,
                fontFamily: FontFamily.satoshiMedium,
              },
            ]}
          >
            -{data?.discount_percentage}%
          </Text>
        </View>
        <Gap height={10} />
        <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          {data.name}
        </Text>
        <Gap height={SPACE_4} />
        <Text style={[blackTextStyle]}>{data.category}</Text>
        <Gap height={SPACE_16} />
        <Text style={[primaryTextStyle, { fontSize: 12 }]}>S&K Berlaku</Text>
      </View>
      <View
        style={{
          width: "25%",
        }}
      >
        <Text
          style={[
            greyTextStyle,
            { textDecorationLine: "line-through", fontSize: 12 },
          ]}
        >
          {currencyFormat(data.normal_price)}
        </Text>
        <Text style={[orangeTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
          {currencyFormat(data.discount_price)}
        </Text>
      </View>
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
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.emptyContainer, { width: width - 32 }]}>
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
  tileContainer: {
    width: "100%",
    maxWidth: 340,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginRight: SPACE_16,
  },
  discountContainer: {
    maxWidth: "35%",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 33,
    backgroundColor: redColor,
    alignItems: "center",
    justifyContent: "center",
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
    maxHeight: 300,
    flex: 1,
    backgroundColor: whiteColor,
    padding: SPACE_16,
    borderRadius: 10,
    marginRight: SPACE_16,
    alignItems: "center",
    justifyContent: "center",
  },
});
