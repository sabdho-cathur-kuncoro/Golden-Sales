import {
  bgTertiaryColor,
  blackTextStyle,
  FontFamily,
  greyTextStyle,
  primaryColor,
  whiteColor,
} from "@/constants/theme";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const WEEKDAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  // selected range, ISO "YYYY-MM-DD"
  start?: string | null;
  end?: string | null;
  onSelectDay: (dateStr: string) => void;
};

const Calendar = ({ start, end, onSelectDay }: Props) => {
  const initial = dayjs(start || end || undefined).startOf("month");
  const [view, setView] = useState(initial);

  const year = view.year();
  const month = view.month(); // 0-indexed
  const daysInMonth = view.daysInMonth();
  const firstWeekday = view.startOf("month").day(); // 0=Sun

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  }

  const goPrev = () => setView((v) => v.subtract(1, "month"));
  const goNext = () => setView((v) => v.add(1, "month"));

  return (
    <View>
      {/* MONTH NAV */}
      <View style={styles.navRow}>
        <Pressable onPress={goPrev} hitSlop={10} style={styles.navBtn}>
          <ChevronLeft size={20} color={primaryColor} />
        </Pressable>
        <Text style={[blackTextStyle, styles.monthLabel]}>
          {MONTHS_ID[month]} {year}
        </Text>
        <Pressable onPress={goNext} hitSlop={10} style={styles.navBtn}>
          <ChevronRight size={20} color={primaryColor} />
        </Pressable>
      </View>

      {/* WEEKDAY HEADER */}
      <View style={styles.weekRow}>
        {WEEKDAYS_ID.map((w) => (
          <View key={w} style={styles.cell}>
            <Text style={[greyTextStyle, styles.weekday]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* DAYS GRID */}
      <View style={styles.grid}>
        {cells.map((dateStr, i) => {
          if (!dateStr) {
            return <View key={`b-${i}`} style={styles.cell} />;
          }
          const isStart = !!start && dateStr === start;
          const isEnd = !!end && dateStr === end;
          const inRange =
            !!start && !!end && dateStr > start && dateStr < end;
          const isEdge = isStart || isEnd;
          const day = Number(dateStr.slice(-2));

          return (
            <Pressable
              key={dateStr}
              style={styles.cell}
              onPress={() => onSelectDay(dateStr)}
            >
              <View
                style={[
                  styles.dayBox,
                  inRange && { backgroundColor: bgTertiaryColor },
                  isEdge && { backgroundColor: primaryColor },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isEdge
                      ? { color: whiteColor, fontFamily: FontFamily.satoshiBold }
                      : { color: blackTextStyle.color },
                  ]}
                >
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 15,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  weekday: {
    fontSize: 11,
    fontFamily: FontFamily.satoshiMedium,
  },
  dayBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    fontFamily: FontFamily.satoshiMedium,
  },
});
