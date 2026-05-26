import { Button, Gap, Header, TransferGuide } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  blueColor,
  blueTextStyle,
  FontFamily,
  line,
  primaryTextStyle,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_48,
  whiteColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Copy } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDateTime } from "../../../utils/days";

const Payment = () => {
  const toast = useToast();
  const noVA = "89621000123456";
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(noVA);
    toast.success("Berhasil", "Berhasil copy nomor VA");
  };
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Pembayaran"} onBack={() => router.back()} />
      <ScrollView
        style={[{ flex: 1, backgroundColor: bgColor }]}
        contentContainerStyle={[{ paddingTop: SPACE_16, paddingBottom: 100 }]}
      >
        {/* RINCIAN PEMBAYARAN */}
        <View style={[styles.cardContainer]}>
          <View style={[{ width: "100%" }, rowCenter]}>
            <View style={[styles.half]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Total Pembayaran
              </Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(1_800_000)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[line]} />
          <Gap height={SPACE_16} />
          <View style={[{ width: "100%" }, rowCenter]}>
            <View style={[{ width: "40%" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Bayar Dalam
              </Text>
            </View>
            <View
              style={[
                {
                  width: "60%",
                  alignItems: "flex-end",
                  justifyContent: "center",
                },
              ]}
            >
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                1 jam 15 menit 20 detik
              </Text>
              <Gap height={10} />
              <Text style={[primaryTextStyle, { fontSize: 12 }]}>
                Jatuh tempo {formatDateTime(new Date())}
              </Text>
            </View>
          </View>
        </View>
        {/* VA */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter, { width: "100%" }]}>
            <View style={{ width: "15%", height: 18 }}>
              <Image
                source={require("@/assets/images/logo-bca.png")}
                style={{ width: 40, height: 18 }}
                contentFit="contain"
              />
            </View>
            <View style={{ width: "85%" }}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Bank BCA
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={line} />
          <Gap height={SPACE_16} />
          <Text style={[blackTextStyle]}>No. Virtual Account</Text>
          <Gap height={SPACE_16} />
          <View style={[rowCenter, styles.numVAContainer]}>
            <View style={[{ width: "88%" }]}>
              <Text
                style={[
                  blueTextStyle,
                  { fontSize: 16, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {noVA}
              </Text>
            </View>
            <Pressable
              onPress={copyToClipboard}
              style={[
                {
                  width: "10%",
                  alignItems: "flex-end",
                },
              ]}
            >
              <Copy size={20} color={blueColor} />
            </Pressable>
          </View>
        </View>
        {/* PANDUAN PEMBAYARAN */}
        <View style={[styles.cardContainer]}>
          <TransferGuide bankName="BCA" />
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        <Button
          title="OK"
          onPress={() =>
            router.push({
              pathname: "/status-screen",
              params: {
                type: "success",
                title: "Pesanan Berhasil Dibuat!",
                message: `Pesanan Anda telah kami terima dan sedang diproses.${"\n"}Anda dapat memantau status pesanan melalui menu Transaksi`,
                primaryActionType: "go-home",
                primaryActionTitle: "Kembali ke Home",
                secondaryActionType: "go-transaction",
                secondaryActionTitle: "Lihat Transaksi",
              },
            })
          }
        />
      </View>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  half: {
    width: "49%",
  },
  numVAContainer: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    backgroundColor: bgColor,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: whiteColor,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
  },
});
