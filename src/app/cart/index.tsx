import {
  AnimatedPressable,
  Button,
  FocusAwareStatusBar,
  Gap,
  TileCart,
} from "@/components/ui";
import {
  blackTextStyle,
  blueColor,
  darkPrimaryColor,
  FontFamily,
  greyTertiaryColor,
  greyTextStyle,
  mainContent,
  paddingScroll,
  primaryColor,
  row,
  screen,
  shadow,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCartController from "@/hooks/useCartController";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Check, ChevronLeft, Info } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { handleBack } from "../../../utils/helper";

const Cart = () => {
  const {
    items,
    refreshing,
    onRefresh,
    keyExtractor,
    isSelected,
    selectedSerialsOf,
    toggleSelect,
    toggleSerial,
    toggleSerialAll,
    allSelected,
    toggleSelectAll,
    selectedItems,
    selectedTotal,
    onInc,
    onDec,
    onChangeQty,
    handleDelete,
    handleRemoveSerial,
    handleCheckout,
  } = useCartController();

  const renderItem = ({ item }: any) => (
    <TileCart
      item={item}
      selectable
      selected={isSelected(item)}
      onToggleSelect={() => toggleSelect(item)}
      selectedSerials={selectedSerialsOf(item)}
      onToggleSerial={(sn: string) => toggleSerial(item, sn)}
      onToggleSerialAll={() => toggleSerialAll(item)}
      onInc={() => onInc(item)}
      onDec={() => onDec(item)}
      onChangeQty={(qty: number) => onChangeQty(item, qty)}
      onDelete={() => handleDelete(item)}
      onRemoveSerial={(sn: string) => handleRemoveSerial(item, sn)}
    />
  );

  const renderHeader = () =>
    items.length > 0 ? (
      <Pressable onPress={toggleSelectAll} style={styles.selectAllRow}>
        {allSelected ? (
          <View style={styles.checkboxOn}>
            <Check size={14} color={whiteColor} />
          </View>
        ) : (
          <View style={styles.checkboxOff} />
        )}
        <Gap width={SPACE_8} />
        <Text
          style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Pilih semua ({selectedItems.length}/{items.length})
        </Text>
      </Pressable>
    ) : null;

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={{ alignSelf: "center" }}>
        <Info size={72} color={blueColor} />
      </View>
      <Gap height={SPACE_8} />
      <Text style={[blackTextStyle, { fontSize: 18, textAlign: "center" }]}>
        Keranjang kamu masih kosong
      </Text>
      <Gap height={SPACE_8} />
      <Text style={[greyTextStyle, { textAlign: "center" }]}>
        Yuk, mulai belanja dan temukan produk favoritmu!
      </Text>
      <Gap height={24} />
      <View style={{ alignSelf: "center" }}>
        <Button
          title={"Tambah Keranjang"}
          onPress={() => router.push("/order")}
        />
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <AnimatedPressable onPress={() => handleBack("/(tabs)/home")}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Keranjang
        </Text>
      </View>
      <View style={[mainContent]}>
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={[paddingScroll, { paddingBottom: 120 }]}
        />
      </View>
      {items.length > 0 && (
        <View style={[shadow, row, styles.footer]}>
          <View style={{ width: "39%" }}>
            <Text style={[blackTextStyle]}>Total Harga</Text>
            <Text
              style={[
                blackTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {currencyFormat(selectedTotal)}
            </Text>
          </View>
          <View style={{ width: "60%" }}>
            <Button
              title={`Checkout (${selectedItems.length})`}
              onPress={handleCheckout}
            />
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

export default Cart;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: SPACE_16,
  },
  checkboxOn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOff: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: greyTertiaryColor,
  },
  emptyContainer: {
    paddingTop: 24,
  },
  footer: {
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingBottom: 40,
    paddingVertical: 10,
  },
});
