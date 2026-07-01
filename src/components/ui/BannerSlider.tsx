import {
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  redColor,
} from "@/constants/theme";
import { Image } from "expo-image";
import { ImageOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type BannerItem = {
  id: string;
  image: string;
};

type Props = {
  data: BannerItem[];
  autoPlay?: boolean;
  interval?: number;
  loading?: boolean;
};

const BannerSkeleton = () => {
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
    <View>
      <Animated.View style={[styles.skeleton, animatedStyle]} />
      <View style={styles.dotContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[styles.dot, animatedStyle]} />
        ))}
      </View>
    </View>
  );
};

const BannerEmpty = () => (
  <View>
    <View style={styles.empty}>
      <ImageOff size={32} color={greyColor} />
      <Text
        style={[
          blackTextStyle,
          { fontFamily: FontFamily.satoshiBold, marginTop: 8 },
        ]}
      >
        Belum ada banner
      </Text>
      <Text style={[greyTextStyle, styles.emptyText]}>
        Informasi terbaru akan segera hadir di sini.
      </Text>
    </View>
  </View>
);

const BannerSlider: React.FC<Props> = ({
  data,
  autoPlay = true,
  interval = 5000,
  loading = false,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, data.length, autoPlay, interval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const renderItem = ({ item }: { item: BannerItem }) => (
    <Image
      source={{ uri: `data:image/jpeg;base64,${item?.image}` }}
      style={styles.image}
      contentFit="fill"
    />
  );

  if (loading) {
    return <BannerSkeleton />;
  }

  if (!data || data.length === 0) {
    return <BannerEmpty />;
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onMomentumScrollEnd={handleScroll}
      />

      {/* Dot Indicator */}
      <View style={styles.dotContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerSlider;

const styles = StyleSheet.create({
  image: {
    width: width - 32,
    minHeight: height * 0.2,
    marginRight: 10,
    borderRadius: 10,
  },
  skeleton: {
    width: width - 32,
    height: height * 0.2,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  empty: {
    width: width - 32,
    height: height * 0.2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
    borderStyle: "dashed",
    backgroundColor: "rgba(0,0,0,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: FontFamily.satoshiMedium,
    textAlign: "center",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 33,
    backgroundColor: "rgba(0,0,0,0.14)",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: redColor,
    width: 16,
    height: 6,
  },
});
