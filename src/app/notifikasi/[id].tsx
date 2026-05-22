import { AnimatedPressable, ChatBubble, Gap, Header } from "@/components/ui";
import { ChatMessage } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  blueColor,
  footerStyle,
  greyColor,
  lineColor,
  mainContent,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_24,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import IoniconsIC from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Info } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import {
  KeyboardControllerView,
  useKeyboardHandler,
} from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { generateChat, wait } from "../../../utils/helper";

const DetailSection = () => {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);

  const listRef = useRef<any>(null);
  const isAtBottomRef = useRef(true);
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  });
  const listStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value + 100,
  }));
  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboardHeight.value }],
  }));

  useEffect(() => {
    getMessages();
  }, []);

  async function getMessages() {
    try {
      const temp = generateChat(ChatMessage);
      setMessages(temp);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    wait(1000).then(() => {
      setRefreshing(false);
    });
  }, []);

  const keyExtractor = useCallback(
    (item: any) => `${item.name}-${item.id}`,
    []
  );

  const renderItemFlatlist = useCallback(({ item }: any) => {
    return <ChatBubble data={item} />;
  }, []);

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={{ alignSelf: "center" }}>
          <Info size={72} color={blueColor} />
        </View>
        <Gap height={SPACE_8} />
        <Text style={[blackTextStyle, { fontSize: 18, textAlign: "center" }]}>
          Pesan masih kosong
        </Text>
      </View>
    );
  };
  return (
    <KeyboardControllerView style={{ flex: 1 }}>
      <View style={[screen, { backgroundColor: whiteColor }]}>
        <Header title={id} onBack={() => router.back()} />
        <View style={[mainContent]}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItemFlatlist}
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={<Animated.View style={listStyle} />}
            onRefresh={onRefresh}
            refreshing={refreshing}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            onScroll={(e) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                e.nativeEvent;

              const isAtBottom =
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 20;

              isAtBottomRef.current = isAtBottom;
            }}
            onContentSizeChange={() => {
              if (isAtBottomRef.current) {
                listRef.current?.scrollToEnd({ animated: true });
              }
            }}
            contentContainerStyle={[
              {
                paddingHorizontal: SPACE_16,
                paddingTop: SPACE_16,
              },
            ]}
          />
          <Animated.View
            style={[
              footerStyle,
              rowCenter,
              inputStyle,
              {
                backgroundColor: whiteColor,
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Ketik pesan..."
                placeholderTextColor={greyColor}
                style={[blackTextStyle, { height: 50 }]}
              />
            </View>
            <View style={styles.btnWrapper}>
              <AnimatedPressable>
                <View style={[styles.btnContainer]}>
                  <IoniconsIC name="paper-plane" size={24} color={whiteColor} />
                </View>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </KeyboardControllerView>
  );
};

export default DetailSection;

const styles = StyleSheet.create({
  header: {
    flex: 0.1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: SPACE_16,
    paddingTop: SPACE_8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    borderWidth: 0.1,
    borderColor: whiteColor,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingTop: SPACE_24,
  },
  btnWrapper: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: "hidden",
  },
  btnContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: primaryColor,
    borderRadius: 50,
  },
  inputContainer: {
    width: "83%",
    paddingHorizontal: SPACE_16,
    backgroundColor: bgColor,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 999,
  },
});
