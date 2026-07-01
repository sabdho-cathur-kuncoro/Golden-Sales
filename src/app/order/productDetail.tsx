import {
  AnimatedPressable,
  Button,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  card,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greenTextStyle,
  greyColor,
  greyTextStyle,
  line,
  lineColor,
  mainContent,
  orangeTextStyle,
  paddingScroll,
  primaryColor,
  redColor,
  redRGBAColor,
  redTextStyle,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_24,
  SPACE_4,
  SPACE_48,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
  whiteThirdColor,
  yellowColor,
  yellowRGBAColor,
  yellowTextStyle,
} from "@/constants/theme";
import useOrderDetailController from "@/hooks/useOrderDetailController";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  Hash,
  ImageIcon,
  Info,
  Minus,
  Package,
  PackageX,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { promoLabel } from "../../../utils/promo";

const OrderProductDetail = () => {
  const { uid } = useLocalSearchParams();
  const {
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    setImagetoView,
    isKartuPerdana,
    promos,
    activePromo,
    nextPromo,
    line: priceLine,
    stock,
    price,
    qty,
    effectiveQty,
    selectedSerials,
    toggleSerial,
    onChangeQty,
    commitQty,
    handleAddToCart,
  } = useOrderDetailController(uid);

  const { height } = useWindowDimensions();
  // String draft so the field can go empty while editing (qty is the number of
  // record; sync back when +/- or cart pre-fill change it).
  const [qtyText, setQtyText] = useState(String(qty));
  useEffect(() => setQtyText(String(qty)), [qty]);

  if (detailLoading) {
    return (
      <LinearGradient
        colors={[darkPrimaryColor, primaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[screen]}
      >
        <View style={[styles.header]}>
          <AnimatedPressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={whiteColor} />
          </AnimatedPressable>
          <Gap width={SPACE_16} />
          <Text
            style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Detail Produk
          </Text>
        </View>
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Gap height={SPACE_16} />
          <Text style={[greyTextStyle]}>Memuat detail produk...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!productDetail) {
    return (
      <LinearGradient
        colors={[darkPrimaryColor, primaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[screen]}
      >
        <View style={[styles.header]}>
          <AnimatedPressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={whiteColor} />
          </AnimatedPressable>
          <Gap width={SPACE_16} />
          <Text
            style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Detail Produk
          </Text>
        </View>
        <View style={styles.stateContainer}>
          <View style={styles.emptyIcon}>
            <PackageX size={40} color={greyColor} />
          </View>
          <Gap height={SPACE_16} />
          <Text
            style={[
              blackTextStyle,
              { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
            ]}
          >
            Produk tidak ditemukan
          </Text>
          <Gap height={SPACE_4} />
          <Text style={[greyTextStyle, { fontSize: 13, textAlign: "center" }]}>
            Produk mungkin sudah tidak tersedia atau telah dihapus.
          </Text>
          <Gap height={SPACE_24} />
          <View style={{ width: "60%" }}>
            <Button title="Kembali" onPress={() => router.back()} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const subtotal = priceLine.subtotal;
  const hasActiveDiscount = activePromo && priceLine.discountPerUnit > 0;
  const unitPrice = price - (priceLine.discountPerUnit ?? 0);
  const inStock = stock > 0;

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
          Detail Produk
        </Text>
      </View>
      <ScrollView
        style={[mainContent]}
        contentContainerStyle={[paddingScroll, { paddingBottom: 140 }]}
      >
        {/* GALLERY CARD */}
        <View style={[card]}>
          <View style={[styles.galleryBox, { height: height * 0.3 }]}>
            {imgView ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${imgView}` }}
                style={styles.imgPlaceholder}
                contentFit="fill"
              />
            ) : (
              <View style={styles.imgPlaceholder}>
                <ImageIcon size={120} color={greyColor} />
              </View>
            )}
          </View>
          {imgList.length > 0 ? (
            <>
              <Gap height={SPACE_16} />
              <View style={{ flexDirection: "row" }}>
                {imgList.map((img: any) => {
                  const active = img.imageBase64 === imgView;
                  return (
                    <AnimatedPressable
                      key={img.id}
                      onPress={() => setImagetoView(img.imageBase64)}
                    >
                      <View
                        style={[styles.imgTiny, active && styles.imgTinyActive]}
                      >
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${img.imageBase64}`,
                          }}
                          style={styles.imgPlaceholder}
                          contentFit="cover"
                        />
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>

        {/* TITLE & PRICE CARD */}
        <Gap height={SPACE_16} />
        <View style={[card]}>
          <Text
            style={[
              blackTextStyle,
              { fontFamily: FontFamily.satoshiBold, fontSize: 18 },
            ]}
          >
            {productDetail?.productName ?? "-"}
          </Text>
          <Gap height={SPACE_8} />
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.pill,
                {
                  backgroundColor: inStock ? greenRGBAColor : redRGBAColor,
                  borderColor: inStock ? greenColor : redColor,
                },
              ]}
            >
              <Text
                style={[
                  inStock ? greenTextStyle : redTextStyle,
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {inStock ? `Tersedia: ${stock}` : "Stok habis"}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_8} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {hasActiveDiscount ? (
              <>
                <Text
                  style={[
                    greyTextStyle,
                    { fontSize: 13, textDecorationLine: "line-through" },
                  ]}
                >
                  {currencyFormat(price)}
                </Text>
                <Gap width={SPACE_8} />
              </>
            ) : null}
            <Text
              style={[
                orangeTextStyle,
                { fontSize: 22, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {currencyFormat(hasActiveDiscount ? unitPrice : price)}
            </Text>
            {promos.length > 0 && (
              <>
                <Gap width={SPACE_8} />
                <View style={styles.promoContainer}>
                  <Sparkles size={12} color={greenColor} />
                  <Gap width={SPACE_4} />
                  <Text
                    style={[
                      greenTextStyle,
                      { fontFamily: FontFamily.satoshiBold, fontSize: 10 },
                    ]}
                  >
                    PROMO
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* PROMO LADDER CARD */}
        {promos.length > 0 && (
          <>
            <Gap height={SPACE_16} />
            <View style={styles.promoListContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Tag size={16} color={yellowColor} />
                <Gap width={SPACE_8} />
                <Text
                  style={[
                    yellowTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  PROMO TERSEDIA
                </Text>
              </View>
              <Gap height={SPACE_8} />
              {promos.map((p: any) => {
                const isActive = activePromo && activePromo.id === p.id;
                const min = p.minQuantity ?? 1;
                const max = p.maxQuantity;
                const range = max ? `min ${min}–${max}` : `min ${min}`;
                return (
                  <View key={p.id} style={[rowCenter]}>
                    <Text
                      style={[
                        isActive ? greenTextStyle : blackTextStyle,
                        { fontSize: 12 },
                      ]}
                    >
                      {isActive ? "✓ " : "○ "}
                      {promoLabel(p)}{" "}
                      <Text style={[greyTextStyle, { fontSize: 12 }]}>
                        ({range} pcs)
                      </Text>
                    </Text>
                  </View>
                );
              })}
              {effectiveQty > 0 && hasActiveDiscount ? (
                <>
                  <Gap height={SPACE_8} />
                  <View style={[line]} />
                  <Gap height={SPACE_8} />
                  <Text
                    style={[
                      greenTextStyle,
                      { fontSize: 11, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    Anda hemat{" "}
                    {currencyFormat(priceLine.discountPerUnit * effectiveQty)}{" "}
                    untuk {effectiveQty} pcs
                  </Text>
                </>
              ) : null}
              {nextPromo && effectiveQty > 0 ? (
                <>
                  <Gap height={SPACE_4} />
                  <Text style={[yellowTextStyle, { fontSize: 11 }]}>
                    Tambah {(nextPromo.minQuantity ?? 0) - effectiveQty} pcs
                    lagi untuk dapat {promoLabel(nextPromo)}
                  </Text>
                </>
              ) : null}
            </View>
          </>
        )}

        {/* INFORMASI PRODUK CARD */}
        <Gap height={SPACE_16} />
        <View style={[card]}>
          <View style={styles.sectionHeader}>
            <Package size={16} color={blackColor} />
            <Gap width={SPACE_8} />
            <Text
              style={[
                blackTextStyle,
                { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
              ]}
            >
              Informasi Produk
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[line]} />
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Kondisi</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              Baru
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Kategori</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {productDetail?.category ?? "-"}
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Brand</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {productDetail?.brand ?? "-"}
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Cabang</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {productDetail?.branch ?? "-"}
            </Text>
          </View>
          <Gap height={SPACE_16} />
          <View style={[line]} />
          <Gap height={SPACE_16} />
          <Text style={[greyTextStyle]}>Deskripsi</Text>
          <Gap height={SPACE_4} />
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            {productDetail?.description ?? "-"}
          </Text>
        </View>

        {/* ACTION CARD */}
        <Gap height={SPACE_16} />
        {isKartuPerdana ? (
          <View style={[card]}>
            <View style={styles.sectionHeader}>
              <Hash size={16} color={blackColor} />
              <Gap width={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
                ]}
              >
                Pilih Nomor
              </Text>
              <Gap width={SPACE_8} />
              <View style={styles.countBadge}>
                <Text
                  style={[
                    greyTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {stockList?.length ?? 0}
                </Text>
              </View>
            </View>
            <Gap height={SPACE_8} />
            <View style={[line]} />
            <View style={{ maxHeight: height * 0.4 }}>
              <ScrollView nestedScrollEnabled>
                {stockList && stockList.length > 0 ? (
                  stockList.map((s: any, index: number) => {
                    const checked = selectedSerials.includes(
                      s.productNameValue
                    );
                    return (
                      <AnimatedPressable
                        key={s.id}
                        onPress={() => toggleSerial(s.productNameValue)}
                      >
                        <View
                          style={[
                            styles.serialRow,
                            index === stockList.length - 1 && {
                              borderBottomWidth: 0,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checked && {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                              },
                            ]}
                          >
                            {checked ? (
                              <Check size={14} color={whiteColor} />
                            ) : null}
                          </View>
                          <Gap width={SPACE_8} />
                          <Text style={[blackTextStyle]}>
                            {s.productNameValue}
                          </Text>
                        </View>
                      </AnimatedPressable>
                    );
                  })
                ) : (
                  <View style={styles.emptySerial}>
                    <Text style={[greyTextStyle]}>Tidak ada nomor</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            <Gap height={SPACE_8} />
            <View style={[line]} />
            <Gap height={SPACE_8} />
            <Text style={[greyTextStyle, { fontSize: 12 }]}>
              Terpilih:{" "}
              <Text
                style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
              >
                {selectedSerials.length}
              </Text>{" "}
              nomor
            </Text>
          </View>
        ) : (
          <View style={[card]}>
            <View style={styles.sectionHeader}>
              <Package size={16} color={blackColor} />
              <Gap width={SPACE_8} />
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
                ]}
              >
                Atur Jumlah
              </Text>
            </View>
            <Gap height={SPACE_16} />
            <View style={styles.qtyRow}>
              <View style={{ width: "30%" }}>
                <Text style={[greyTextStyle]}>Qty</Text>
              </View>
              <View style={styles.qtyContainer}>
                <AnimatedPressable
                  onPress={() => onChangeQty(Math.max(1, qty - 1))}
                >
                  <Minus size={22} color={primaryColor} />
                </AnimatedPressable>
                <TextInput
                  value={qtyText}
                  onChangeText={(t) => {
                    const raw = t.replace(/[^0-9]/g, "");
                    setQtyText(raw);
                    onChangeQty(raw === "" ? 0 : Number(raw));
                  }}
                  onBlur={() => {
                    commitQty();
                    setQtyText(String(qty < 1 ? 1 : qty));
                  }}
                  keyboardType="number-pad"
                  style={[blackTextStyle, styles.qtyInput]}
                />
                <AnimatedPressable onPress={() => onChangeQty(qty + 1)}>
                  <Plus size={22} color={primaryColor} />
                </AnimatedPressable>
              </View>
            </View>
          </View>
        )}

        <Gap height={SPACE_16} />
        <View style={styles.infoContainer}>
          <Info size={16} color={blackColor} />
          <Gap width={SPACE_8} />
          <Text style={[blackTextStyle, { fontSize: 12, flex: 1 }]}>
            {productDetail?.info ||
              "Product yang di beli tidak bisa dikembalikan"}
          </Text>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[shadow, styles.footer]}>
        <View style={{ flex: 1 }}>
          <Text style={[greyTextStyle, { fontSize: 11 }]}>Subtotal</Text>
          {hasActiveDiscount ? (
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={[
                  greyTextStyle,
                  { fontSize: 11, textDecorationLine: "line-through" },
                ]}
              >
                {currencyFormat(price * effectiveQty)}
              </Text>
              <Gap width={SPACE_4} />
              <Text
                style={[
                  orangeTextStyle,
                  { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(subtotal)}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                blackTextStyle,
                { fontSize: 16, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {currencyFormat(subtotal)}
            </Text>
          )}
        </View>
        <View style={{ width: "45%" }}>
          <Button
            title="+ Keranjang"
            disabled={effectiveQty === 0}
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default OrderProductDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: bgColor,
  },
  galleryBox: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: whiteThirdColor,
    overflow: "hidden",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imgTiny: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
    overflow: "hidden",
  },
  imgTinyActive: {
    borderWidth: 2,
    borderColor: primaryColor,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    minWidth: 24,
    paddingHorizontal: SPACE_8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: SPACE_4,
    borderWidth: 1,
  },
  serialRow: {
    paddingVertical: SPACE_16,
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: greyColor,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySerial: {
    paddingVertical: SPACE_24,
    alignItems: "center",
  },
  qtyRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyContainer: {
    width: "65%",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyInput: {
    height: 42,
    minWidth: "40%",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: redRGBAColor,
    borderWidth: 1,
    borderColor: redColor,
    padding: SPACE_8,
    borderRadius: 10,
  },
  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: SPACE_8,
    paddingVertical: SPACE_4,
    backgroundColor: greenRGBAColor,
    borderWidth: 1,
    borderColor: greenColor,
  },
  promoListContainer: {
    width: "100%",
    backgroundColor: yellowRGBAColor,
    borderWidth: 1,
    borderColor: yellowColor,
    borderRadius: 12,
    padding: SPACE_16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: whiteColor,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: whiteThirdColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
