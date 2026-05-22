import BinIcon from "@/assets/icons/ic-bin.svg";
import IconCOD from "@/assets/icons/ic-cod.svg";
import EditIcon from "@/assets/icons/ic-edit.svg";
import IconTransfer from "@/assets/icons/ic-payment-method.svg";
import { AnimatedPressable, Button, Gap, Header } from "@/components/ui";
import { PaymentMethodData, ProductItemData } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  greenColor,
  greyColor,
  greyTextStyle,
  lineColor,
  lineDash,
  orangeTextStyle,
  primaryColor,
  primaryTextStyle,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_48,
  SPACE_8,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
import { useBottomSheetStore } from "@/features/shared/store/bottomSheet.store";
import { useGlobalStore } from "@/features/shared/store/global.store";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, MapPin, Minus, Plus } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";

const RincianOrder = () => {
  const { id, name } = useLocalSearchParams();
  const { selectedAddress, setAddress } = useGlobalStore();
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);

  const handleOpen = (outlet: any) => {
    const address = outlet?.list_address;
    const snapPoints = address?.length <= 2 ? ["55%"] : ["80%"];

    openSheet(
      <BottomSheetFlatList
        style={{ flex: 1 }}
        data={address}
        keyExtractor={(item: any) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
        renderItem={({ item }: any) => (
          <Pressable
            onPress={() => {
              setAddress(item);
              closeSheet();
            }}
            style={[rowCenter, styles.tileAddressContainer]}
          >
            <View
              style={{
                width: "15%",
                alignItems: "center",
              }}
            >
              <MapPin size={24} color={primaryColor} />
            </View>

            <View style={{ width: "83%" }}>
              <Text
                style={[
                  primaryTextStyle,
                  {
                    fontSize: 18,
                    fontFamily: FontFamily.satoshiMedium,
                  },
                ]}
              >
                {item?.name}
              </Text>

              <Gap height={4} />

              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {item?.address}
              </Text>
            </View>
          </Pressable>
        )}
      />,
      snapPoints,
      // header
      <>
        <Text
          style={[
            blackTextStyle,
            {
              fontFamily: FontFamily.satoshiMedium,
            },
          ]}
        >
          Pilih Alamat Tujuan
        </Text>

        <Gap height={10} />

        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          Silakan tentukan alamat pengiriman untuk {outlet?.name}
        </Text>

        <Gap height={16} />
      </>,
      // footer
      <Button
        title="Batalkan"
        titleColor={greyTextStyle}
        border={1}
        borderColor={greyColor}
        bgColor={"transparent"}
        onPress={closeSheet}
      />
    );
  };
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={"Rincian Pesanan"}
        isIconVisible
        onBack={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[{ paddingTop: SPACE_16, paddingBottom: 120 }]}
      >
        {/* ADDRESS */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter, styles.addressContainer]}>
            <View style={{ width: "74%", flexDirection: "row" }}>
              <View style={{ width: "12%" }}>
                <MapPin size={20} color={blackColor} />
              </View>
              <View style={{ width: "87%" }}>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  Alamat Pengiriman
                </Text>
                <Gap height={SPACE_8} />
                <Text style={[blackTextStyle]}>{selectedAddress?.name}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleOpen}
              style={{ width: "25%", alignItems: "flex-end" }}
            >
              <Text style={[primaryTextStyle, { fontSize: 12 }]}>
                Ubah Alamat
              </Text>
            </Pressable>
          </View>
        </View>
        {/* PRODUK */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Produk Order
          </Text>
          <Gap height={SPACE_16} />
          <Text
            style={[orangeTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            {name}
          </Text>
          <Gap height={10} />
          {ProductItemData.map((item: any, index: any) => {
            const isLast = index === ProductItemData.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.productTileContainer,
                  { marginBottom: isLast ? 0 : SPACE_16 },
                ]}
              >
                <View style={[rowCenter]}>
                  <View style={{ width: "78%" }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontFamily: FontFamily.satoshiMedium },
                      ]}
                    >
                      {item?.name}
                    </Text>
                    <Gap height={10} />
                    <Text style={[greyTextStyle, { fontSize: 12 }]}>
                      {currencyFormat(item?.price)} / 20
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "20%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <AnimatedPressable>
                      <EditIcon width={24} color={primaryColor} />
                    </AnimatedPressable>
                    <Gap width={SPACE_16} />
                    <AnimatedPressable>
                      <BinIcon width={24} color={primaryColor} />
                    </AnimatedPressable>
                  </View>
                </View>
                <Gap height={20} />
                <View style={[rowCenter]}>
                  <View style={[{ width: "60%" }]}>
                    <Text
                      style={[
                        orangeTextStyle,
                        { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                      ]}
                    >
                      {currencyFormat(item?.sub_total_price)}
                    </Text>
                  </View>
                  <View style={[styles.qtyContainer]}>
                    <View style={{ width: "20%" }}>
                      <AnimatedPressable>
                        <Minus size={22} color={primaryColor} />
                      </AnimatedPressable>
                    </View>
                    <View
                      style={{
                        width: "55%",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        value={String(20)}
                        // onChangeText={(text) => setQty(text)}
                        style={[
                          blackTextStyle,
                          {
                            height: 42,
                            fontFamily: FontFamily.satoshiBold,
                            fontSize: 16,
                          },
                        ]}
                      />
                    </View>
                    <View style={{ width: "20%" }}>
                      <AnimatedPressable>
                        <Plus size={22} color={primaryColor} />
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {/* NOTE */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Catatan Pesanan <Text style={[greyTextStyle]}>(Opsional)</Text>
          </Text>
          <Gap height={SPACE_16} />
          <TextInput
            placeholder="Tulis catatan untuk pengiriman atau sales"
            placeholderTextColor={greyColor}
            style={[blackTextStyle, styles.noteInputContainer]}
            multiline
            textAlignVertical="top"
          />
        </View>
        {/* PAYMENT METHOD */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              Metode Pembayaran
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/payment-method")}
            >
              <ChevronRight size={20} color={blackColor} />
            </Pressable>
          </View>
          <Gap height={SPACE_16} />
          {PaymentMethodData.map((data: any, index: any) => {
            const isLast = index === PaymentMethodData.length - 1;
            const isBank = data?.name.includes("Bank");
            return (
              <View
                key={data.id}
                style={[
                  styles.paymentMethodContainer,
                  rowCenter,
                  { marginBottom: isLast ? 0 : SPACE_16 },
                ]}
              >
                <View
                  style={{
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "15%" }}>
                    {isBank ? (
                      <IconTransfer width={24} color={primaryColor} />
                    ) : (
                      <IconCOD width={24} color={primaryColor} />
                    )}
                  </View>
                  <View style={{ width: "84%" }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontFamily: FontFamily.satoshiMedium },
                      ]}
                    >
                      {data.name}
                    </Text>
                  </View>
                </View>
                <View style={{ width: "14%", alignItems: "flex-end" }}>
                  <View style={styles.dotContainer}>
                    {data?.is_selected ? <View style={styles.dotFill} /> : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {/* RINCIAN */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Rincian Pembayaran
          </Text>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Subtotal Barang</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {currencyFormat(1_800_000)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Biaya Pengiriman</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {currencyFormat(0)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Diskon Promo</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {currencyFormat(0)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[greyTextStyle]}>Biaya Admin</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {currencyFormat(0)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={lineDash} />
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                TOTAL PEMBAYARAN
              </Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(1_800_000)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        <View style={[styles.half]}>
          <Text style={[greyTextStyle]}>Total Pembayaran</Text>
          <Text
            style={[
              primaryTextStyle,
              { fontSize: 16, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            {currencyFormat(1_800_000)}
          </Text>
        </View>
        <View style={[styles.half]}>
          <Button
            title="Submit Pesanan"
            onPress={() => router.push("/payment")}
          />
        </View>
      </View>
    </View>
  );
};

export default RincianOrder;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  productTileContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: bgColor,
    borderRadius: 10,
    padding: 10,
  },
  qtyContainer: {
    width: "38%",
    borderWidth: 1,
    borderColor: bgColor,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteInputContainer: {
    width: "100%",
    height: 64,
    borderWidth: 1,
    borderColor: bgColor,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  half: {
    width: "49%",
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
  tileAddressContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  addressContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    padding: 10,
  },
  paymentMethodContainer: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },
  dotContainer: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: strokeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  dotFill: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: greenColor,
  },
});
