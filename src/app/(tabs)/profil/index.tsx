import { AnimatedPressable, Gap } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  blueColor,
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
  rowCenter,
  screen,
  SPACE_16,
  SPACE_4,
  whiteColor,
  whiteSecondaryColor,
  whiteTextStyle,
} from "@/constants/theme";
import AntDesignIC from "@expo/vector-icons/AntDesign";
import {
  BookOpen,
  ChevronRight,
  Fingerprint,
  Lock,
  LogOut,
  Smartphone,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

const Profile = () => {
  const onLogout = () => {};
  return (
    <View style={[screen, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.topContent}>
        <View
          style={{ width: "85%", flexDirection: "row", alignItems: "center" }}
        >
          <View style={styles.imageProfile} />
          <Gap width={SPACE_16} />
          <View>
            <Text
              style={[
                whiteTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Ahmad Kurniawan
            </Text>
            <Gap height={SPACE_4} />
            <Text style={[whiteTextStyle, { fontSize: 16 }]}>SLS-99281</Text>
          </View>
        </View>
        <View style={styles.chevronRightContainer}>
          <ChevronRight size={28} color={whiteColor} />
        </View>
      </View>
      <View style={[styles.mainContainer]}>
        <ScrollView contentContainerStyle={[paddingScroll]}>
          {/* FAQ */}
          <AnimatedPressable>
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
                    Frequently Ask Question
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
          <AnimatedPressable>
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
                    Manual Book
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Comprehensive User Guide (PDF)
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
          <AnimatedPressable>
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
                    Change Password
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Update your login password
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
          <AnimatedPressable>
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
          </AnimatedPressable>
          {/* NOTIFICATION */}
          <AnimatedPressable>
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
          </AnimatedPressable>
          {/* LOGOUT */}
          <AnimatedPressable onPress={onLogout}>
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
                    Logout
                  </Text>
                  <Text style={[greyTextStyle, { fontSize: 12 }]}>
                    Safely logout from session
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
        </ScrollView>
      </View>
    </View>
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
    backgroundColor: primaryColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACE_16,
  },
  imageProfile: {
    width: 60,
    height: 60,
    borderRadius: 60,
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
});
