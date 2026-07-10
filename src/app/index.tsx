import AnimatedSplash from "@/components/splash/AnimatedSplash";
import { VERSION_KEY, isUpdateRequired } from "@/constants/version";
import { resolveNotifTarget } from "@/notifications/navigation";
import { getProfileService } from "@/services/auth.services";
import { getAppVersionService } from "@/services/global.services";
import { db } from "@/storage/db";
import { useAuthStore } from "@/stores/auth.store";
import { usePendingRouteStore } from "@/stores/pendingRoute.store";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function BootstrapScreen() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await db.init();
      await useAuthStore.getState().hydrate();

      // Force-update gate. Fail open: any check failure must not block boot.
      try {
        const res = await getAppVersionService(VERSION_KEY);
        const remote = res?.result?.[0]?.version_value;
        const installed = Constants.expoConfig?.version;
        if (mounted && isUpdateRequired(installed, remote)) {
          setNeedsUpdate(true);
        }
      } catch {
        // ignore — proceed with normal boot
      }

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

    if (needsUpdate) {
      router.replace("/update");
      return;
    }

    const { isAuthenticated } = useAuthStore.getState();

    router.replace(isAuthenticated ? "/home" : "/login");

    // Deep-link from a killed-state notification tap, once authenticated.
    const pending = usePendingRouteStore.getState().consume();
    if (pending && isAuthenticated) {
      router.push(resolveNotifTarget(pending) as never);
    }
  }, [isHydrated, isAnimationDone, needsUpdate]);

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
