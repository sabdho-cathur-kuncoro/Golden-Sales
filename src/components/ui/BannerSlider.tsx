import { blackColor } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type BannerItem = {
  id: string;
  image: string;
};

type Props = {
  data: BannerItem[];
  autoPlay?: boolean;
  interval?: number;
};

const BannerSlider: React.FC<Props> = ({
  data,
  autoPlay = true,
  interval = 5000,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const renderItem = ({ item }: { item: BannerItem }) => (
    <Image source={item.image} style={styles.image} contentFit="fill" />
  );

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
    backgroundColor: blackColor,
    width: 16,
    height: 6,
  },
});
