import { AnimatedPressable, Gap } from "@/components/ui";
import { ENABLE_DEV_TOOLS } from "@/constants/flags";
import {
  bgColor,
  blackTextStyle,
  blueColor,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greyColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  paddingScroll,
  primaryColor,
  purpleColor,
  redColor,
  row,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
  whiteSecondaryColor,
  whiteTextStyle,
} from "@/constants/theme";
import { unsubscribeAllTopics } from "@/notifications/topics";
import { useAuthStore } from "@/stores/auth.store";
import { useConfirmStore } from "@/stores/confirm.store";
import AntDesignIC from "@expo/vector-icons/AntDesign";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Activity,
  BookOpen,
  ChevronRight,
  Lock,
  LogOut,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { getInitials } from "../../../../utils/helper";

const Profile = () => {
  const { user } = useAuthStore();
  const { show } = useConfirmStore();
  const handleLogout = () => {
    show({
      title: "Logout",
      message: "Yakin ingin keluar akun ini?",
      type: "danger",
      onConfirm: async () => {
        // Unsubscribe topics BEFORE logout — backend service reads token from store.
        await unsubscribeAllTopics();
        await useAuthStore.getState().logout();
        router.replace("/(auth)/login");
      },
    });
  };
  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <StatusBar barStyle={"light-content"} />
      <View style={[styles.topContent]}>
        <AnimatedPressable onPress={() => router.push("/profil-detail")}>
          <View style={[rowCenter]}>
            <View
              style={{
                width: "85%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {user?.avatar ? (
                <View style={[styles.imageProfile]}>
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${user?.avatar}`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.imageProfile,
                    {
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: greenColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      whiteTextStyle,
                      { fontSize: 24, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {getInitials(user?.fullName ?? "")}
                  </Text>
                </View>
              )}
              <Gap width={SPACE_16} />
              <View>
                <Text
                  style={[
                    whiteTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {user?.fullName ?? "-"}
                </Text>
                <Gap height={SPACE_4} />
                <Text style={[whiteTextStyle, { fontSize: 16 }]}>
                  {user?.role ?? "-"}
                </Text>
              </View>
            </View>
            <View style={styles.chevronRightContainer}>
              <ChevronRight size={28} color={whiteColor} />
            </View>
          </View>
        </AnimatedPressable>
      </View>
      <View style={[styles.mainContainer]}>
        <ScrollView contentContainerStyle={[paddingScroll]}>
          {/* FAQ */}
          <AnimatedPressable onPress={() => router.push("/faq")}>
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <AntDesignIC
                    name="question-circle"
                    size={20}
                    color={blueColor}
                  />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    FAQ
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Pertanyaan yang Sering Diajukan
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable>
          {/* MANUAL BOOK */}
          <AnimatedPressable onPress={() => router.push("/manual-book")}>
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <BookOpen size={20} color={purpleColor} />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    Buku Panduan
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Panduan Pengguna Lengkap (PDF)
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable>
          {/* CHANGE PASSWORD */}
          <AnimatedPressable onPress={() => router.push("/change-password")}>
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <Lock size={20} color={orangeColor} />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    Ubah Kata Sandi
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Perbarui kata sandi login Anda
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable>
          {/* PIN */}
          {/* <AnimatedPressable onPress={() => router.push("/pin")}>
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <Fingerprint size={20} color={greenColor} />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    PIN
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Setup 6-digit security PIN
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable> */}
          {/* NOTIFICATION */}
          {/* <AnimatedPressable
            onPress={() => router.push("/notification-preferences")}
          >
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <Smartphone size={20} color={"#AD46FF"} />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    Notification Preferences
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Notification settings
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable> */}
          {/* NETWORK LOGS (dev/QA only) */}
          {ENABLE_DEV_TOOLS && (
            <AnimatedPressable onPress={() => router.push("/network-logs")}>
              <View style={[styles.cardContainer, row]}>
                <View
                  style={[
                    {
                      width: "85%",
                      flexDirection: "row",
                      alignItems: "center",
                    },
                  ]}
                >
                  <View style={styles.tileIconContainer}>
                    <Activity size={20} color={blueColor} />
                  </View>
                  <Gap width={SPACE_16} />
                  <View>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontFamily: FontFamily.satoshiBold },
                      ]}
                    >
                      Network Logs
                    </Text>
                    <Text style={[greyTextStyle, { fontSize: 12 }]}>
                      Inspeksi request & response API
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: "14%",
                    alignItems: "flex-end",
                  }}
                >
                  <ChevronRight size={18} color={greyColor} />
                </View>
              </View>
            </AnimatedPressable>
          )}
          {/* LOGOUT */}
          <AnimatedPressable onPress={handleLogout}>
            <View style={[styles.cardContainer, rowCenter]}>
              <View
                style={[
                  {
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.tileIconContainer}>
                  <LogOut size={20} color={redColor} />
                </View>
                <Gap width={SPACE_16} />
                <View>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    Keluar
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Keluar dari sesi dengan aman
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "14%",
                  alignItems: "flex-end",
                }}
              >
                <ChevronRight size={18} color={greyColor} />
              </View>
            </View>
          </AnimatedPressable>
          <Text style={styles.versionText}>
            Versi {Constants.expoConfig?.version ?? "-"}
          </Text>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  topContent: {
    flex: 0.15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACE_16,
  },
  imageProfile: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: whiteSecondaryColor,
  },
  chevronRightContainer: {
    width: "14%",
    height: 60,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: lineColor,
    marginBottom: 10,
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  versionText: {
    ...greyTextStyle,
    fontSize: 12,
    textAlign: "center",
    marginTop: SPACE_8,
  },
});
