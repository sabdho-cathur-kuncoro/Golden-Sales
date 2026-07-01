import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import StatusRow from "@/components/ui/StatusRow";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyTextStyle,
  line,
  primaryColor,
  redColor,
  rowCenter,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { getOrderTimelineService } from "@/services/orders.services";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatDate, formatDateTime } from "../../../utils/days";

// Map a timeline event ({ type, title, subtitle, done, ts }) to StatusRow shape.
const mapEvent = (e: any) => ({
  status_name: e?.title ?? e?.status_name ?? e?.status ?? e?.type ?? "-",
  created_at: e?.ts
    ? formatDateTime(e.ts)
    : e?.created_at ?? (e?.createdAt ? formatDateTime(e.createdAt) : ""),
  is_reject:
    e?.is_reject ??
    (typeof e?.type === "string" && e.type.includes("reject")) ??
    false,
  step_done: e?.done ?? e?.step_done ?? true,
  current_step: e?.current ?? e?.current_step ?? false,
});

const StatusOrder = () => {
  const { id, orderId } = useLocalSearchParams();
  const [dataRow, setDataRow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const tl = await getOrderTimelineService(id, { current: null });
        const evs = tl?.events ?? (Array.isArray(tl) ? tl : tl?.data) ?? [];
        if (active) setDataRow(evs);
      } catch (err) {
        if (active) setError(String(err instanceof Error ? err.message : err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Status Transaksi
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: 150,
        }}
      >
        <View
          style={[
            styles.cardContainer,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={[blackTextStyle]}>Order ID:</Text>
          </View>
          <View
            style={{
              width: "55%",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={[
                blackTextStyle,
                { fontFamily: FontFamily.satoshiBold, textAlign: "right" },
              ]}
            >
              {orderId ?? id}
            </Text>
          </View>
        </View>
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <View style={{ width: "44%" }}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Status Transaksi
              </Text>
            </View>
            <View style={{ width: "44%", alignItems: "flex-end" }}>
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {formatDate(new Date())}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={line} />
          <Gap height={SPACE_16} />
          {loading ? (
            <ActivityIndicator color={primaryColor} />
          ) : error ? (
            <Text style={[greyTextStyle, { color: redColor, fontSize: 13 }]}>
              {error}
            </Text>
          ) : dataRow.length > 0 ? (
            dataRow.map((item: any, index: number) => (
              <StatusRow
                key={item?.id ?? index}
                data={mapEvent(item)}
                isLast={index === dataRow.length - 1}
              />
            ))
          ) : (
            <Text style={[greyTextStyle, { fontSize: 13 }]}>
              Belum ada riwayat
            </Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default StatusOrder;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  idBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: whiteColor,
    padding: SPACE_16,
  },
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: 20,
  },
});
