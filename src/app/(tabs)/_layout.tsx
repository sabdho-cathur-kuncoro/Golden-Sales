import HomeIcon from "@/assets/icons/ic-home.svg";
import LaporanIcon from "@/assets/icons/ic-laporan.svg";
import ProfileIcon from "@/assets/icons/ic-profile.svg";
import TransaksiIcon from "@/assets/icons/ic-transaksi.svg";
import { AnimatedPressable } from "@/components/ui";
import {
  FontFamily,
  pinkColor,
  primaryColor,
  SPACE_16,
  SPACE_8,
  strokeColor,
  tabBarColor,
  whiteColor,
} from "@/constants/theme";
import { useCameraAccess } from "@/hooks/useCameraAccess";
import { useToast } from "@/hooks/useToast";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, usePathname, useRouter } from "expo-router";
import { ScanQrCode } from "lucide-react-native";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TabButtonProps = {
  icon: string;
  label: string;
  focused: boolean;
} & PressableProps;

function TabButton({ icon, label, focused, ...props }: TabButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const { request } = useCameraAccess();

  // FAB (Penjualan)
  if (icon === "sale") {
    async function handleScan() {
      const granted = await request();

      if (!granted) {
        toast.warning(
          "Perhatian",
          "Izin kamera dibutuhkan untuk pindai kode QR/Barcode.",
          5000
        );
        return;
      }
      router.push("/scan");
    }
    return (
      <AnimatedPressable onPress={handleScan}>
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={[pinkColor, primaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={styles.FAB}
          >
            <ScanQrCode width={32} height={32} color={whiteColor} />
          </LinearGradient>
          <Text style={[styles.label, styles.fabLabel]}>{label}</Text>
        </View>
      </AnimatedPressable>
    );
  }
  return (
    <Pressable {...props} style={styles.buttonWrapper}>
      {icon === "home" && (
        <HomeIcon
          width={24}
          height={24}
          color={focused ? primaryColor : tabBarColor}
        />
      )}

      {icon === "laporan" && (
        <LaporanIcon
          width={24}
          height={24}
          color={focused ? primaryColor : tabBarColor}
        />
      )}

      {icon === "transaksi" && (
        <TransaksiIcon
          width={24}
          height={24}
          color={focused ? primaryColor : tabBarColor}
        />
      )}

      {icon === "profil" && (
        <ProfileIcon
          width={24}
          height={24}
          color={focused ? primaryColor : tabBarColor}
        />
      )}

      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { minHeight: 96 }],
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="home"
              label="Beranda"
              focused={pathname === "/home"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transaksi"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="transaksi"
              label="Transaksi"
              focused={pathname === "/transaksi"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dummy"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="sale"
              label="Penjualan"
              focused={false}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="laporan"
              label="Laporan"
              focused={pathname === "/laporan"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="profil"
              label="Profil"
              focused={pathname === "/profil"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: whiteColor,
    borderTopColor: strokeColor,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SPACE_16,
    paddingBottom: SPACE_16,
  },
  label: {
    fontSize: 12,
    fontFamily: FontFamily.satoshiMedium,
    color: tabBarColor,
    marginTop: SPACE_8,
  },
  labelActive: {
    color: primaryColor,
  },
  FAB: {
    position: "absolute",
    bottom: 6,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  fabLabel: {
    position: "absolute",
    bottom: -24,
  },
});
