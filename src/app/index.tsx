import AnimatedSplash from "@/components/splash/AnimatedSplash";
import { router } from "expo-router";
// import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";
import { View } from "react-native";

export default function BootstrapScreen() {
  //   const hydrate = useAuthStore.getState().hydrate;

  //   const [isHydrated, setIsHydrated] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  //   useEffect(() => {
  //     let mounted = true;

  //     hydrate().finally(() => {
  //       if (mounted) setIsHydrated(true);
  //     });

  //     return () => {
  //       mounted = false;
  //     };
  //   }, []);

  //   useEffect(() => {
  //     if (!isHydrated || !isAnimationDone) return;

  //     const { isAuthenticated } = useAuthStore.getState();

  //     router.replace(isAuthenticated ? "/home" : "/login");
  //   }, [isHydrated, isAnimationDone]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedSplash
        onFinish={() => {
          setIsAnimationDone(true),
            setTimeout(() => {
              router.replace("/(auth)");
            }, 500);
        }}
      />
    </View>
  );
}
