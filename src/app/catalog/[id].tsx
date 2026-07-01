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
  SPACE_16,
  SPACE_24,
  SPACE_4,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
  whiteThirdColor,
  yellowColor,
  yellowRGBAColor,
  yellowTextStyle,
} from "@/constants/theme";
import useKatalogDetailController from "@/hooks/useKatalogDetailController";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Hash,
  ImageIcon,
  Info,
  Package,
  PackageX,
  Sparkles,
  Tag,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { promoLabel } from "../../../utils/promo";

// Shared top bar — same on the loading, error, and loaded states.
const DetailHeader = () => (
  <View style={styles.header}>
    <AnimatedPressable onPress={() => router.back()}>
      <ChevronLeft size={24} color={whiteColor} />
    </AnimatedPressable>
    <Gap width={SPACE_16} />
    <Text style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}>
      Detail Produk
    </Text>
  </View>
);

const CatalogDetail = () => {
  const { id } = useLocalSearchParams();
  const {
    productDetail,
    detailLoading,
    imgList,
    imgView,
    stockList,
    setImagetoView,
    refreshing,
    onRefresh,
    isKartuPerdana,
    promos,
    activePromo,
  } = useKatalogDetailController(id);

  const { height } = useWindowDimensions();

  if (detailLoading) {
    return (
      <LinearGradient
        colors={[darkPrimaryColor, primaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[screen]}
      >
        <FocusAwareStatusBar barStyle={"light-content"} />
        <DetailHeader />
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
        <FocusAwareStatusBar barStyle={"light-content"} />
        <DetailHeader />
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
          <Text
            style={[greyTextStyle, { fontSize: 13, textAlign: "center" }]}
          >
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

  const stock = productDetail?.stock ?? 0;
  const inStock = stock > 0;

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <DetailHeader />
      <ScrollView
        style={[mainContent]}
        contentContainerStyle={[paddingScroll]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* GALLERY CARD */}
        <View style={[card]}>
          <View style={[styles.galleryBox, { height: height * 0.3 }]}>
            {imgView ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${imgView}` }}
                style={styles.imgPlaceholder}
                contentFit="contain"
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
                {inStock ? `Stok tersedia: ${stock} pcs` : "Stok habis"}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_8} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                orangeTextStyle,
                { fontSize: 22, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {currencyFormat(productDetail?.price ?? 0)}
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

        {/* PROMO CARD */}
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
              {productDetail?.category || "—"}
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Brand</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {productDetail?.brand || "—"}
            </Text>
          </View>
          <Gap height={SPACE_8} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle]}>Cabang</Text>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {productDetail?.branch || "—"}
            </Text>
          </View>
          <Gap height={SPACE_16} />
          <View style={[line]} />
          <Gap height={SPACE_16} />
          <Text style={[greyTextStyle]}>Deskripsi</Text>
          <Gap height={SPACE_4} />
          <Text
            style={[
              productDetail?.description ? blackTextStyle : greyTextStyle,
              { fontFamily: FontFamily.satoshiBold },
            ]}
          >
            {productDetail?.description || "Belum ada deskripsi produk."}
          </Text>
        </View>

        {/* NOMOR TERSEDIA CARD (kartu perdana) */}
        {isKartuPerdana && (
          <>
            <Gap height={SPACE_16} />
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
                  Nomor Tersedia
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
                    stockList.map((stockItem: any, index: number) => (
                      <View
                        key={stockItem.id}
                        style={[
                          styles.itemContent,
                          index === stockList.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}
                      >
                        <Text style={[blackTextStyle]}>
                          {stockItem.productNameValue}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptySerial}>
                      <Text style={[greyTextStyle]}>
                        Belum ada nomor tersedia
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </>
        )}

        {/* INFO BANNER */}
        <Gap height={SPACE_16} />
        <View style={styles.infoContainer}>
          <Info size={16} color={blackColor} />
          <Gap width={SPACE_8} />
          <Text style={[blackTextStyle, { fontSize: 12, flex: 1 }]}>
            {productDetail?.info ||
              "Produk yang sudah dibeli tidak dapat dikembalikan."}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default CatalogDetail;

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
    paddingHorizontal: SPACE_24,
    backgroundColor: bgColor,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: whiteThirdColor,
    alignItems: "center",
    justifyContent: "center",
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
  itemContent: {
    paddingVertical: SPACE_16,
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
    flexDirection: "row",
    alignItems: "center",
  },
  emptySerial: {
    paddingVertical: SPACE_24,
    alignItems: "center",
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
});
