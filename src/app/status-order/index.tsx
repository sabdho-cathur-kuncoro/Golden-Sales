import { Gap, Header } from "@/components/ui";
import StatusRow from "@/components/ui/StatusRow";
import {
  StatusTransaksiDikirim,
  StatusTransaksiReject,
  StatusTransaksiSelesai,
} from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  line,
  screen,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../../utils/days";

const StatusOrder = () => {
  const { id, status } = useLocalSearchParams();
  const [dataRow, setDataRow] = useState<any>([]);

  useEffect(() => {
    setDataStatus();
  }, []);

  async function setDataStatus() {
    if (Number(status) === 4) {
      setDataRow(StatusTransaksiDikirim);
    } else if (Number(status) === 6) {
      setDataRow(StatusTransaksiReject);
    } else {
      setDataRow(StatusTransaksiSelesai);
    }
  }
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Status Transaksi"} onBack={() => router.back()} />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: whiteColor,
          padding: SPACE_16,
        }}
      >
        <View style={{ width: "49%" }}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            {id}
          </Text>
        </View>
        <View style={{ width: "49%", alignItems: "flex-end" }}>
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            {formatDate(new Date())}
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: 150,
        }}
      >
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Status Transaksi
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          {dataRow.map((item: any, index: any) => {
            const isLast = index === dataRow.length - 1;
            return <StatusRow key={item.id} data={item} isLast={isLast} />;
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default StatusOrder;

const styles = StyleSheet.create({
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: 20,
  },
});
