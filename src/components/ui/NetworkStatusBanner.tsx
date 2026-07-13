import {
  FontFamily,
  greenColor,
  orangeColor,
  redColor,
  softShadow,
  SPACE_16,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { resetLatencySamples, useNetworkStore } from "@/stores/network.store";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { SignalLow, Wifi, WifiOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Only a hard `false` reachability counts as offline; `null` (still resolving)
// is treated as online to avoid a false-offline flicker.
const isOnline = (s: NetInfoState): boolean =>
  s.isConnected === true && s.isInternetReachable !== false;

const RECONNECT_MS = 2000;

type Mode = "hidden" | "offline" | "unstable" | "reconnected";

const STYLE_BY_MODE = {
  offline: { bg: redColor, label: "Tidak ada koneksi internet" },
  unstable: { bg: orangeColor, label: "Koneksi tidak stabil" },
  reconnected: { bg: greenColor, label: "Kembali online" },
} as const;

function NetworkStatusBanner() {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isSlow = useNetworkStore((s) => s.isSlow);
  const setConnected = useNetworkStore((s) => s.setConnected);

  const [mode, setMode] = useState<Mode>("hidden");
  const wasOffline = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  // subscribe to connectivity (headless watcher) → drive the store
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setConnected(isOnline(s)));
    return () => unsub();
  }, [setConnected]);

  // map store transitions → view state machine (priority: offline > unstable >
  // reconnected flash > hidden)
  useEffect(() => {
    const clearTimer = () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    if (!isConnected) {
      clearTimer();
      wasOffline.current = true;
      resetLatencySamples(); // stale latency data is meaningless while offline
      setMode("offline");
      return;
    }

    // connected but slow → persistent unstable strip (skips the green flash)
    if (isSlow) {
      clearTimer();
      wasOffline.current = false;
      setMode("unstable");
      return;
    }

    // connected + healthy again, right after an offline stretch → brief flash
    if (wasOffline.current) {
      wasOffline.current = false;
      setMode("reconnected");
      clearTimer();
      reconnectTimer.current = setTimeout(
        () => setMode("hidden"),
        RECONNECT_MS
      );
      return clearTimer;
    }

    // steady healthy connection
    setMode("hidden");
    return clearTimer;
  }, [isConnected, isSlow]);

  // animate on visibility change
  const visible = mode !== "hidden";
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18 });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(-120, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (mode === "hidden") return null;

  const { bg, label } = STYLE_BY_MODE[mode];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        softShadow,
        animatedStyle,
        { paddingTop: insets.top + SPACE_8, backgroundColor: bg },
      ]}
    >
      <View style={styles.row}>
        {mode === "offline" ? (
          <WifiOff size={16} color={whiteColor} />
        ) : mode === "unstable" ? (
          <SignalLow size={16} color={whiteColor} />
        ) : (
          <Wifi size={16} color={whiteColor} />
        )}
        <Text style={styles.text}>{label}</Text>
      </View>
    </Animated.View>
  );
}

export default NetworkStatusBanner;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 998,
    paddingBottom: SPACE_8,
    paddingHorizontal: SPACE_16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginLeft: SPACE_8,
    color: whiteColor,
    fontSize: 13,
    fontFamily: FontFamily.satoshiMedium,
  },
});
