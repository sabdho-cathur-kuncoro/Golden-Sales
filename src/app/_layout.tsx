import {
  GlobalConfirmModal,
  GlobalInputModal,
  GlobalPrePermissionModal,
} from "@/components/modal";
import NotificationPoller from "@/components/NotificationPoller";
import PushNotifications from "@/components/PushNotifications";
import { AppBottomSheet, GlobalLoading, Toast } from "@/components/ui";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function TabLayout() {
  const [loaded] = useFonts({
    satoshiRegular: require("../../assets/fonts/Satoshi-Regular.otf"),
    satoshiLight: require("../../assets/fonts/Satoshi-Light.otf"),
    satoshiMedium: require("../../assets/fonts/Satoshi-Medium.otf"),
    satoshiBold: require("../../assets/fonts/Satoshi-Bold.otf"),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: "#fff" }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar barStyle={"dark-content"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scan" options={{ presentation: "modal" }} />
          </Stack>
          <AppBottomSheet />
          <Toast />
          <GlobalConfirmModal />
          <GlobalInputModal />
          <GlobalPrePermissionModal />
          <GlobalLoading />
          <NotificationPoller />
          <PushNotifications />
        </KeyboardProvider>
      </View>
    </GestureHandlerRootView>
  );
}
