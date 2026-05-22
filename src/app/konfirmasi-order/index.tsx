import SignIcon from "@/assets/icons/ic-sign.svg";
import { Button, Gap, Header } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  blueColor,
  blueTextStyle,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_48,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Camera, RefreshCcw } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../../utils/days";

const KonfirmasiOrder = () => {
  const { id } = useLocalSearchParams();
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Penyelesaian Order"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: 150,
        }}
      >
        {/* ORDER INFO */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Order ID</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {id}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Tanggal Transaksi</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  greyTextStyle,
                  { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
                ]}
              >
                {formatDate(new Date())}
              </Text>
            </View>
          </View>
        </View>
        {/* PHOTO */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Bukti Foto Penyerahan
          </Text>
          <Gap height={10} />
          <View style={styles.cameraContainer}>
            <Camera size={56} color={greyColor} />
            <Gap height={SPACE_8} />
            <Text
              style={[
                greyTextStyle,
                { fontSize: 12, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              Ambil Foto
            </Text>
          </View>
        </View>
        {/* OUTLET SIGNATURE */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <View style={styles.half}>
              <Text
                style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
              >
                Tanda Tangan Outlet
              </Text>
            </View>
            <View
              style={[
                styles.half,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                },
              ]}
            >
              <RefreshCcw size={16} color={blueColor} />
              <Gap width={10} />
              <Text style={[blueTextStyle, { fontSize: 12 }]}>Reset</Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[styles.signContainer]}>
            <View style={styles.hintSignContainer}>
              <SignIcon color={greyColor} width={16} height={15} />
              <Gap width={10} />
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                Tanda Tangan Disini
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        <Button title="Konfirmasi Selesai" />
      </View>
    </View>
  );
};

export default KonfirmasiOrder;

const styles = StyleSheet.create({
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: 20,
  },
  half: {
    width: "49%",
  },
  cameraContainer: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lineColor,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  signContainer: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lineColor,
    alignItems: "center",
    justifyContent: "center",
  },
  hintSignContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 65,
    backgroundColor: "#F1F2F4",
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    backgroundColor: whiteColor,
    width: "100%",
  },
});
