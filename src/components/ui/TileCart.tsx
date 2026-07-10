import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  lineColor,
  orangeTextStyle,
  primaryColor,
  rowCenter,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { lineWithPromo } from "../../../utils/promo";
import AnimatedPressable from "./AnimatedPressable";
import Gap from "./Gap";

function TileCart({
  item,
  selectable = false,
  selected = false,
  onToggleSelect,
  selectedSerials = [],
  onToggleSerial,
  onToggleSerialAll,
  onInc,
  onDec,
  onChangeQty,
  onDelete,
  onRemoveSerial,
}: any) {
  const serials: string[] = item?.serials ?? [];
  const isSerial = serials.length > 0;
  const qtyNum = isSerial ? serials.length : Number(item?.quantity) || 0;

  const [qty, setQty] = useState(String(qtyNum));
  // Serial sub-list collapse (serial lines only). Collapsed by default.
  const [open, setOpen] = useState(false);
  // Keep the displayed qty in sync when the store updates item.quantity.
  useEffect(() => {
    setQty(String(qtyNum));
  }, [qtyNum]);

  const unit = Number(item?.salesPrice) || 0;
  const info = lineWithPromo(unit, qtyNum, item?.promos);
  const hasPromo = info.discountPerUnit > 0;

  const allSerialsSelected =
    isSerial && selectedSerials.length === serials.length;

  const commitQty = (text: string) => {
    const n = parseInt(text, 10);
    const accepted = onChangeQty?.(Number.isFinite(n) ? n : 0);
    // Rejected (e.g. over stock) → store qty unchanged, sync effect won't fire.
    // Reset the field to the store value so it isn't left stale (typed 10 with
    // stock 4 → snap back to the actual qty).
    if (accepted === false) setQty(String(qtyNum));
  };

  return (
    <View style={styles.cardContainer}>
      {selectable ? (
        <View style={{ width: "9%" }}>
          <AnimatedPressable onPress={onToggleSelect}>
            <View style={[styles.checkbox, selected && styles.checkboxOn]}>
              {selected ? <Check size={14} color={whiteColor} /> : null}
            </View>
          </AnimatedPressable>
        </View>
      ) : null}

      <View style={{ width: selectable ? "90%" : "100%" }}>
        {/* PRODUCT NAME & DELETE */}
        <View style={[rowCenter]}>
          <View style={{ width: "85%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {item?.productName ?? "-"}
            </Text>
            {typeof item?.stock === "number" ? (
              <Text style={[greyTextStyle, { fontSize: 11 }]}>
                Stok: {item.stock}
              </Text>
            ) : null}
          </View>
          <View style={{ width: "14%", alignItems: "flex-end" }}>
            <AnimatedPressable onPress={onDelete}>
              <Trash2 size={20} color={greyColor} />
            </AnimatedPressable>
          </View>
        </View>
        <Gap height={SPACE_4} />

        {/* PRICE & QTY */}
        <View style={[rowCenter]}>
          <View style={{ width: "55%" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={[orangeTextStyle, { fontFamily: FontFamily.satoshiBold }]}
              >
                {currencyFormat(hasPromo ? unit - info.discountPerUnit : unit)}
              </Text>
              {hasPromo ? (
                <>
                  <Gap width={SPACE_4} />
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 10, textDecorationLine: "line-through" },
                    ]}
                  >
                    {currencyFormat(unit)}
                  </Text>
                </>
              ) : null}
            </View>
          </View>

          {/* Serial lines can't be qty-stepped; tap the count to expand/collapse. */}
          {isSerial ? (
            <AnimatedPressable onPress={() => setOpen((v) => !v)}>
              <View
                style={{
                  width: "44%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Text style={[greyTextStyle, { fontSize: 12 }]}>
                  {serials.length} nomor
                </Text>
                <Gap width={SPACE_4} />
                {open ? (
                  <ChevronUp size={16} color={greyColor} />
                ) : (
                  <ChevronDown size={16} color={greyColor} />
                )}
              </View>
            </AnimatedPressable>
          ) : (
            <View
              style={{
                width: "44%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <AnimatedPressable onPress={onDec}>
                <View style={styles.btn}>
                  <Text
                    style={[greyTextStyle, { fontFamily: FontFamily.satoshiBold }]}
                  >
                    -
                  </Text>
                </View>
              </AnimatedPressable>
              <Gap width={SPACE_8} />
              <TextInput
                value={qty}
                onChangeText={setQty}
                onEndEditing={(e) => commitQty(e.nativeEvent.text)}
                keyboardType="number-pad"
                style={[
                  blackTextStyle,
                  {
                    minWidth: "20%",
                    fontFamily: FontFamily.satoshiBold,
                    textAlign: "center",
                  },
                ]}
              />
              <Gap width={SPACE_8} />
              <AnimatedPressable onPress={onInc}>
                <View style={styles.btn}>
                  <Text
                    style={[greyTextStyle, { fontFamily: FontFamily.satoshiBold }]}
                  >
                    +
                  </Text>
                </View>
              </AnimatedPressable>
            </View>
          )}
        </View>

        {/* SERIAL SUB-LIST (collapsible) */}
        {isSerial && open ? (
          <View style={{ marginTop: SPACE_8 }}>
            <AnimatedPressable onPress={onToggleSerialAll}>
              <View style={styles.serialRow}>
                <View
                  style={[
                    styles.checkbox,
                    allSerialsSelected && styles.checkboxOn,
                  ]}
                >
                  {allSerialsSelected ? (
                    <Check size={12} color={whiteColor} />
                  ) : null}
                </View>
                <Gap width={SPACE_8} />
                <Text style={[greyTextStyle, { fontSize: 11 }]}>
                  Pilih semua nomor
                </Text>
              </View>
            </AnimatedPressable>
            {serials.map((sn) => {
              const checked = selectedSerials.includes(sn);
              return (
                <View key={sn} style={styles.serialRow}>
                  <AnimatedPressable onPress={() => onToggleSerial?.(sn)}>
                    <View
                      style={[styles.checkbox, checked && styles.checkboxOn]}
                    >
                      {checked ? <Check size={12} color={whiteColor} /> : null}
                    </View>
                  </AnimatedPressable>
                  <Gap width={SPACE_8} />
                  <Text
                    style={[blackTextStyle, { flex: 1, fontSize: 13 }]}
                    numberOfLines={1}
                  >
                    {sn}
                  </Text>
                  <AnimatedPressable onPress={() => onRemoveSerial?.(sn)}>
                    <Trash2 size={16} color={greyColor} />
                  </AnimatedPressable>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default React.memo(TileCart);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: whiteColor,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACE_16,
    marginBottom: SPACE_16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: greyTertiaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  btn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: greyTertiaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  serialRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: bgColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: SPACE_8,
    marginBottom: SPACE_4,
  },
});
