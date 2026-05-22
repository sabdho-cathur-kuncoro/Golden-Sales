import {
  blackColor,
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  lineColor,
  orangeRGBAColor,
  rowCenter,
  SPACE_16,
  SPACE_4,
  SPACE_8,
} from "@/constants/theme";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Gap from "./Gap";

type TransferGuideProps = {
  bankName: string;
};

const Notes = () => {
  return (
    <View style={styles.noteContainer}>
      <Text style={[blackTextStyle, styles.sectionTitle]}>Catatan Penting</Text>
      <Gap height={SPACE_4} />

      <Text style={[greyTextStyle, styles.text]}>
        • Pastikan nomor rekening atau Virtual Account sudah benar.
        {"\n"}• Jangan membagikan PIN, OTP, atau kode token kepada siapa pun.
        {"\n"}• Simpan bukti transfer hingga pembayaran terverifikasi.{"\n"}•
        Biaya admin transfer antar bank dapat berbeda tergantung metode
        transfer.
      </Text>
    </View>
  );
};

const TransferGuide = ({ bankName }: TransferGuideProps) => {
  const [mbankingVisible, setMbankingVisible] = useState(false);
  const [ibankingVisible, setIbankingVisible] = useState(false);
  const [atmVisible, setATMVisible] = useState(false);
  return (
    <View>
      {/* m-Banking */}
      <View style={[styles.section]}>
        <Pressable
          onPress={() => setMbankingVisible(!mbankingVisible)}
          style={[rowCenter, { width: "100%" }]}
        >
          <View style={{ width: "86%" }}>
            <Text style={[blackTextStyle, styles.sectionTitle]}>
              Petunjuk Transfer via m-Banking
            </Text>
          </View>
          <View
            style={{
              width: "12%",
              alignItems: "flex-end",
            }}
          >
            <ChevronDown size={20} color={blackColor} />
          </View>
        </Pressable>
        {mbankingVisible ? (
          <>
            <Gap height={SPACE_8} />

            <Text style={[greyTextStyle, styles.text]}>
              1. Buka aplikasi m-Banking {bankName}.{"\n"}
              2. Login menggunakan username/password atau PIN.{"\n"}
              3. Pilih menu Transfer.{"\n"}
              4. Pilih transfer sesama bank atau antar bank.{"\n"}
              5. Masukkan nomor rekening / Virtual Account dan nominal transfer.
              {"\n"}
              6. Pastikan data penerima sudah benar.{"\n"}
              7. Klik Lanjut / Konfirmasi.{"\n"}
              8. Masukkan PIN transaksi.{"\n"}
              9. Simpan bukti transfer setelah transaksi berhasil.
            </Text>

            {/* Notes */}
            <Notes />
          </>
        ) : null}
      </View>

      {/* i-Banking */}
      <View style={[styles.section]}>
        <Pressable
          onPress={() => setIbankingVisible(!ibankingVisible)}
          style={[rowCenter, { width: "100%" }]}
        >
          <View style={{ width: "86%" }}>
            <Text style={[blackTextStyle, styles.sectionTitle]}>
              Petunjuk Transfer via i-Banking
            </Text>
          </View>
          <View
            style={{
              width: "12%",
              alignItems: "flex-end",
            }}
          >
            <ChevronDown size={20} color={blackColor} />
          </View>
        </Pressable>
        <Gap height={SPACE_8} />
        {ibankingVisible ? (
          <>
            <Gap height={SPACE_8} />

            <Text style={[greyTextStyle, styles.text]}>
              1. Buka website internet banking {bankName}.{"\n"}
              2. Login menggunakan User ID dan Password.{"\n"}
              3. Pilih menu Transfer.{"\n"}
              4. Pilih jenis transfer yang diinginkan.{"\n"}
              5. Masukkan data penerima dan nominal transfer.{"\n"}
              6. Periksa kembali detail transaksi.{"\n"}
              7. Klik Konfirmasi / Kirim.{"\n"}
              8. Masukkan OTP atau Token keamanan.{"\n"}
              9. Simpan bukti transaksi.
            </Text>

            {/* Notes */}
            <Notes />
          </>
        ) : null}
      </View>

      {/* ATM */}
      <View>
        <Pressable
          onPress={() => setATMVisible(!atmVisible)}
          style={[rowCenter, { width: "100%" }]}
        >
          <View style={{ width: "86%" }}>
            <Text style={[blackTextStyle, styles.sectionTitle]}>
              Petunjuk Transfer via ATM
            </Text>
          </View>
          <View
            style={{
              width: "12%",
              alignItems: "flex-end",
            }}
          >
            <ChevronDown size={20} color={blackColor} />
          </View>
        </Pressable>
        <Gap height={SPACE_8} />
        {atmVisible ? (
          <>
            <Gap height={SPACE_8} />

            <Text style={[greyTextStyle, styles.text]}>
              1. Masukkan kartu ATM {bankName}.{"\n"}
              2. Pilih bahasa.{"\n"}
              3. Masukkan PIN ATM.{"\n"}
              4. Pilih menu Transfer.{"\n"}
              5. Pilih transfer sesama bank atau antar bank.{"\n"}
              6. Masukkan nomor rekening tujuan / Virtual Account.{"\n"}
              7. Masukkan nominal transfer.{"\n"}
              8. Periksa detail penerima dan jumlah transfer.{"\n"}
              9. Pilih Benar / Ya / Lanjut.{"\n"}
              10. Ambil struk sebagai bukti transaksi.
            </Text>

            {/* Notes */}
            <Notes />
          </>
        ) : null}
      </View>
    </View>
  );
};

export default TransferGuide;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },
  section: {
    paddingBottom: SPACE_16,
    marginBottom: SPACE_16,
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamily.satoshiMedium,
  },
  text: {
    fontSize: 14,
    lineHeight: 24,
  },
  noteContainer: {
    width: "100%",
    padding: SPACE_8,
    marginTop: SPACE_16,
    backgroundColor: orangeRGBAColor,
    borderRadius: 8,
  },
});
