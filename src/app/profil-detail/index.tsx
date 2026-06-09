import { AnimatedPressable, Gap } from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  borderInputColor,
  FontFamily,
  greenColor,
  greenTextStyle,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  line,
  paddingH,
  primaryColor,
  primaryTextStyle,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_24,
  SPACE_4,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { router } from "expo-router";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  Command,
  IdCard,
  Mail,
  Map,
  Phone,
  TrendingUp,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";

const ProfilDetail = () => {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[screen, { backgroundColor: primaryColor }]}>
      {/* HEADER */}
      <View style={[rowCenter, paddingH]}>
        <AnimatedPressable onPress={() => router.back()}>
          <View style={{ width: "12%" }}>
            <ChevronLeft size={32} color={whiteColor} />
          </View>
        </AnimatedPressable>
        <View style={{ width: "87%" }}>
          <Text
            style={[
              whiteTextStyle,
              { fontSize: 16, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            Profil Detail
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            { width, minHeight: height * 0.42, backgroundColor: primaryColor },
          ]}
        >
          <View
            style={{
              width,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={styles.imgContainer}>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={[
                    whiteTextStyle,
                    { fontSize: 48, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  DS
                </Text>
              </View>
              <View style={styles.btnVerifBadge}>
                <BadgeCheck size={16} color={primaryColor} />
              </View>
            </View>
            <Gap height={SPACE_24} />
            <Text
              style={[
                whiteTextStyle,
                { fontSize: 32, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Dudung Sadudung
            </Text>
            <Gap height={SPACE_4} />
            <Text style={[whiteTextStyle, { fontSize: 16, opacity: 0.8 }]}>
              Senior Sales
            </Text>
            <Gap height={SPACE_16} />
            <View style={styles.overlayStatus}>
              <View
                style={[styles.dotStatus, { backgroundColor: "#6FFBBE" }]}
              />
              <Gap width={10} />
              <Text style={[whiteTextStyle]}>ACTIVE</Text>
            </View>
          </View>
        </View>
        <View style={[rowCenter, paddingH, { marginTop: -40 }]}>
          <View style={[shadow, styles.cardAchieve]}>
            <Text style={[greyTextStyle, { fontSize: 16 }]}>MTD REVENUE</Text>
            <Text style={[blackTextStyle, { fontSize: 16 }]}>
              {currencyFormat(250_000_000)}
            </Text>
            <Gap height={SPACE_8} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TrendingUp size={14} color={greenColor} />
              <Gap width={SPACE_4} />
              <Text style={[greenTextStyle, { fontSize: 16 }]}>+12%</Text>
            </View>
          </View>
          <View style={[shadow, styles.cardAchieve]}>
            <Text style={[greyTextStyle, { fontSize: 16 }]}>ACHIEVEMENT</Text>
            <Text style={[primaryTextStyle, { fontSize: 16 }]}>85%</Text>
            <Gap height={6} />
            <View style={styles.achievementBarContainer}>
              <View style={styles.achievementBarFill} />
            </View>
          </View>
        </View>
        <Gap height={SPACE_24} />
        <View style={[paddingH]}>
          {/* REGION */}
          <View style={[shadow, styles.cardContainer]}>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Command size={16} color={blackColor} />
              <Gap width={10} />
              <Text style={[blackTextStyle, { fontSize: 16 }]}>REGIONAL</Text>
            </View>
            <Gap height={10} />
            <View style={line} />
            <Gap height={10} />
            <View style={styles.regionContainer}>
              <View
                style={{
                  width: "15%",
                }}
              >
                <View style={styles.iconContainer}>
                  <Map size={24} color={blackColor} />
                </View>
              </View>
              <View style={{ width: "84%" }}>
                <Text style={[greyTextStyle]}>REGIONAL</Text>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  BATAM
                </Text>
              </View>
            </View>
            <Gap height={SPACE_16} />
            <View style={styles.regionContainer}>
              <View
                style={{
                  width: "15%",
                }}
              >
                <View style={styles.iconContainer}>
                  <Building2 size={24} color={blackColor} />
                </View>
              </View>
              <View style={{ width: "84%" }}>
                <Text style={[greyTextStyle]}>SUB-BRANCH</Text>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  BATAM
                </Text>
              </View>
            </View>
          </View>
          <Gap height={SPACE_24} />
          {/* CONTACT */}
          <View style={[shadow, styles.cardContainer]}>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <User size={16} color={blackColor} />
              <Gap width={10} />
              <Text style={[blackTextStyle, { fontSize: 16 }]}>
                KONTAK DETAIL
              </Text>
            </View>
            <Gap height={10} />
            <View style={line} />
            <Gap height={10} />
            <View style={[rowCenter]}>
              <View style={{ width: "10%" }}>
                <IdCard size={24} color={blackColor} />
              </View>
              <View style={{ width: "89%" }}>
                <Text style={[blackTextStyle]}>ID KARYAWAN</Text>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  SLS-001
                </Text>
              </View>
            </View>
            <Gap height={SPACE_16} />
            <View style={[rowCenter]}>
              <View style={{ width: "10%" }}>
                <Mail size={24} color={blackColor} />
              </View>
              <View style={{ width: "89%" }}>
                <Text style={[blackTextStyle]}>EMAIL</Text>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  dudung.sad@gmail.com
                </Text>
              </View>
            </View>
            <Gap height={SPACE_16} />
            <View style={[rowCenter]}>
              <View style={{ width: "10%" }}>
                <Phone size={24} color={blackColor} />
              </View>
              <View style={{ width: "89%" }}>
                <Text style={[blackTextStyle]}>TELEPON</Text>
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  0812341234
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilDetail;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    padding: SPACE_16,
    backgroundColor: whiteColor,
    borderRadius: 8,
  },
  cardAchieve: {
    width: "48%",
    height: 130,
    padding: SPACE_24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: whiteColor,
    borderRadius: 8,
  },
  achievementBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5EEFF",
    borderRadius: 12,
  },
  achievementBarFill: {
    width: "80%",
    height: 6,
    backgroundColor: "#4648D4",
    borderRadius: 12,
  },
  imgContainer: {
    width: 128,
    height: 128,
    borderRadius: 12,
    backgroundColor: greenColor,
  },
  imgContent: {
    width: 88,
    height: 88,
    backgroundColor: greyColor,
    borderRadius: 16,
  },
  btnVerifBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 4,
    backgroundColor: "#6FFBBE",
    borderColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayStatus: {
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  dotStatus: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  regionContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: strokeColor,
    backgroundColor: borderInputColor,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: greyTertiaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
