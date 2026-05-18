import ApprovalIcon from "@/assets/icons/ic-approval.svg";
import HomeIcon from "@/assets/icons/ic-home.svg";
import ProfileIcon from "@/assets/icons/ic-profile.svg";
import TransaksiIcon from "@/assets/icons/ic-transaksi.svg";
import {
  FontFamily,
  primaryColor,
  SPACE_16,
  SPACE_8,
  strokeColor,
  tabBarColor,
  whiteColor,
} from "@/constants/theme";
import { Tabs, usePathname } from "expo-router";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type TabButtonProps = {
  icon: string;
  label: string;
  focused: boolean;
} & PressableProps;

function TabButton({ icon, label, focused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={styles.buttonWrapper}>
      {icon === "home" && (
        <HomeIcon
          width={24}
          height={24}
          color={focused ? primaryColor : tabBarColor}
        />
      )}

      {icon === "approval" && (
        <ApprovalIcon
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
        name="approval"
        options={{
          tabBarButton: (props) => (
            <TabButton
              {...props}
              icon="approval"
              label="Approval"
              focused={pathname === "/approval"}
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
    paddingBottom: SPACE_8,
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
});
