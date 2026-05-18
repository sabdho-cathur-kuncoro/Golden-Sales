import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";

export default function TabLayout() {
  const [loaded] = useFonts({
    satoshiRegular: require("../../assets/fonts/Satoshi-Regular.otf"),
    satoshiLight: require("../../assets/fonts/Satoshi-Light.otf"),
    satoshiMedium: require("../../assets/fonts/Satoshi-Medium.otf"),
    satoshiBold: require("../../assets/fonts/Satoshi-Bold.otf"),
  });

  const [showSplash, setShowSplash] = useState(true);
  const colorScheme = useColorScheme();

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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
