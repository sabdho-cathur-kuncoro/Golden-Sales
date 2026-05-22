import TimerSandIC from "@/assets/icons/ic-timer-sand.svg";
import WorldSecIC from "@/assets/icons/ic-world-sec.svg";
import WorldIC from "@/assets/icons/ic-world.svg";
import {
  blackTextStyle,
  FontFamily,
  line,
  lineColor,
  orangeTextStyle,
  primaryColor,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import Gap from "./Gap";

type TypeProductItem = {
  data: any;
  isService?: boolean;
  onPress: () => void;
};

/* =========================
   Small Reusable Components
========================= */

const SectionDivider = () => (
  <>
    <Gap height={16} />
    <View style={line} />
    <Gap height={16} />
  </>
);

const InfoItem = ({ icon: Icon, text }: any) => {
  if (!text) return null;

  return (
    <View style={styles.rows}>
      <Icon width={14} height={14} />
      <Gap width={10} />
      <Text style={styles.textSmall}>{text}</Text>
    </View>
  );
};

/* =========================
   Main Component
========================= */

const TileItem = ({ data, isService = false, onPress }: TypeProductItem) => {
  const hasValue = !!data?.value;
  const hasExp = !!data?.exp;

  const renderServiceInfo = () => {
    if (!hasValue) return null;

    return (
      <>
        <SectionDivider />
        <InfoItem icon={WorldIC} text={data.value} />
      </>
    );
  };

  const renderProductInfo = () => {
    if (!hasValue && !hasExp) return null;

    return (
      <>
        <SectionDivider />
        <View style={styles.rows}>
          {hasValue && <InfoItem icon={WorldSecIC} text={data.value} />}

          {hasValue && hasExp && (
            <>
              <Gap width={10} />
              <View style={styles.dot} />
              <Gap width={10} />
            </>
          )}

          {hasExp && <InfoItem icon={TimerSandIC} text={data.exp} />}
        </View>
      </>
    );
  };

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
        {data?.name}
      </Text>
      <Gap height={10} />
      <Text style={[orangeTextStyle]}>
        {currencyFormat(data?.price)} / {data?.unit}
      </Text>
      {isService ? renderServiceInfo() : renderProductInfo()}
    </Pressable>
  );
};

export default TileItem;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
    borderRadius: 10,
  },

  tileContainer: {
    width: "100%",
    minHeight: 80,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },

  title: {
    ...blackTextStyle,
    fontFamily: FontFamily.satoshiMedium,
  },

  price: {
    ...orangeTextStyle,
    fontFamily: FontFamily.satoshiBold,
  },

  textSmall: {
    ...blackTextStyle,
    fontSize: 12,
    fontFamily: FontFamily.satoshiMedium,
  },

  rows: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: primaryColor,
  },
});
