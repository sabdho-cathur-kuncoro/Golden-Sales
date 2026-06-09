import { Gap, Header } from "@/components/ui";
import {
  blackTextStyle,
  borderInputColor,
  FontFamily,
  greyTextStyle,
  line,
  mainContent,
  primaryColor,
  rowCenter,
  screen,
  whiteColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

type PrefKey = "pesanan" | "promo" | "chat";

type Pref = {
  key: PrefKey;
  title: string;
  subtitle: string;
};

const PREFS: Pref[] = [
  {
    key: "pesanan",
    title: "Pesanan",
    subtitle: "Status pesanan, persetujuan, dan pengiriman",
  },
  {
    key: "promo",
    title: "Promo & Info",
    subtitle: "Promosi, pengumuman, dan berita terbaru",
  },
  {
    key: "chat",
    title: "Chat",
    subtitle: "Pesan baru dari pelanggan dan sales",
  },
];

const initialState: Record<PrefKey, boolean> = {
  pesanan: true,
  promo: true,
  chat: true,
};

const NotificationPreferences = () => {
  const toast = useToast();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(initialState);

  const toggle = (key: PrefKey) => (value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    // TODO: connect to real updateNotificationPreference(key, value) endpoint once API is wired up
    toast.success(
      "Tersimpan",
      `Notifikasi ${PREFS.find((p) => p.key === key)?.title} ${
        value ? "diaktifkan" : "dinonaktifkan"
      }`
    );
  };

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Preferensi Notifikasi"}
        onBack={() => router.back()}
      />
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            Atur jenis notifikasi yang ingin Anda terima
          </Text>
          <Gap height={16} />

          {PREFS.map((pref, i) => (
            <View key={pref.key}>
              <View style={[rowCenter, styles.row]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {pref.title}
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    {pref.subtitle}
                  </Text>
                </View>
                <Switch
                  value={prefs[pref.key]}
                  onValueChange={toggle(pref.key)}
                  trackColor={{ false: borderInputColor, true: primaryColor }}
                  thumbColor={whiteColor}
                />
              </View>
              {i < PREFS.length - 1 ? <View style={line} /> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default NotificationPreferences;

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
  },
});
