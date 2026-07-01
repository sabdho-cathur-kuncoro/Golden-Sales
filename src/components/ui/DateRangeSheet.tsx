import {
  blackTextStyle,
  borderInputColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  primaryColor,
  rowCenter,
} from "@/constants/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { CalendarDays } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../../utils/days";
import Button from "./Button";
import Calendar from "./Calendar";
import Gap from "./Gap";

export type DateRangeValue = {
  start: string | null;
  end: string | null;
};

type Props = {
  current: DateRangeValue;
  onApply: (value: DateRangeValue) => void;
  onReset: () => void;
};

/**
 * Date-only range picker for a filter bottom sheet — reuses the shared
 * `Calendar`, tap start/end fields to switch which bound is being picked.
 * A trimmed variant of `FilterSheet` (no payment pills).
 */
const DateRangeSheet = ({ current, onApply, onReset }: Props) => {
  const [start, setStart] = useState<string | null>(current.start);
  const [end, setEnd] = useState<string | null>(current.end);
  const [activeField, setActiveField] = useState<"start" | "end">("start");

  const onSelectDay = (dateStr: string) => {
    if (activeField === "start") {
      setStart(dateStr);
      if (end && dateStr > end) setEnd(null);
      setActiveField("end");
    } else {
      if (start && dateStr < start) {
        setStart(dateStr);
        setEnd(null);
        setActiveField("end");
      } else {
        setEnd(dateStr);
      }
    }
  };

  const reset = () => {
    setStart(null);
    setEnd(null);
    setActiveField("start");
    onReset();
  };

  const DateField = ({
    label,
    value,
    field,
  }: {
    label: string;
    value: string | null;
    field: "start" | "end";
  }) => {
    const active = activeField === field;
    return (
      <Pressable
        onPress={() => setActiveField(field)}
        style={[
          styles.dateField,
          { borderColor: active ? primaryColor : borderInputColor },
        ]}
      >
        <Text style={[greyTextStyle, { fontSize: 11 }]}>{label}</Text>
        <Gap height={2} />
        <Text
          style={[
            blackTextStyle,
            { fontSize: 13, fontFamily: FontFamily.satoshiMedium },
          ]}
        >
          {value ? formatDate(value, "DD MMM YYYY") : "Pilih tanggal"}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.sheetContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={rowCenter}>
        <Text style={[blackTextStyle, styles.sectionTitle]}>
          Rentang Tanggal
        </Text>
        <CalendarDays size={18} color={primaryColor} />
      </View>
      <Gap height={10} />
      <View style={styles.dateRow}>
        <DateField label="Tanggal Mulai" value={start} field="start" />
        <Gap width={10} />
        <DateField label="Tanggal Akhir" value={end} field="end" />
      </View>
      <Gap height={14} />
      <Calendar start={start} end={end} onSelectDay={onSelectDay} />

      <Gap height={20} />
      <View style={styles.actionRow}>
        <View style={{ flex: 1 }}>
          <Button
            title="Reset"
            bgColor="transparent"
            border={1}
            borderColor={greyColor}
            titleColor={greyTextStyle}
            onPress={reset}
          />
        </View>
        <Gap width={12} />
        <View style={{ flex: 1 }}>
          <Button title="Terapkan" onPress={() => onApply({ start, end })} />
        </View>
      </View>
      <Gap height={12} />
    </BottomSheetScrollView>
  );
};

export default DateRangeSheet;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
  },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: "row",
  },
});
