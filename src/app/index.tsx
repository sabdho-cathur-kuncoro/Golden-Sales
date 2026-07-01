import AnimatedSplash from "@/components/splash/AnimatedSplash";
import { getProfileService } from "@/services/auth.services";
import { db } from "@/storage/db";
import { useAuthStore } from "@/stores/auth.store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function BootstrapScreen() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await db.init();
      await useAuthStore.getState().hydrate();

      if (!mounted) return;
      setIsHydrated(true);
      if (useAuthStore.getState().isAuthenticated) {
        getProfileService().catch(() => {}); // background refresh each cold start
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAnimationDone) return;

    const { isAuthenticated } = useAuthStore.getState();

    router.replace(isAuthenticated ? "/home" : "/login");
  }, [isHydrated, isAnimationDone]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedSplash
        onFinish={() => {
          setIsAnimationDone(true);
        }}
      />
    </View>
  );
}
