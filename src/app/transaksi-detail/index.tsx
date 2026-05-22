import { Button, Gap, Header } from "@/components/ui";
import { OrderDetail } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  blueSecondaryColor,
  blueTextStyle,
  FontFamily,
  greenTextStyle,
  greyTextStyle,
  lightBlueColor,
  line,
  lineColor,
  orangeTextStyle,
  primaryColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_4,
  SPACE_48,
  SPACE_8,
  whiteColor,
  whiteThirdColor,
} from "@/constants/theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDate, formatDateTime } from "../../../utils/days";

const TransaksiDetail = () => {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const [detailTransaksi, setDetailTransaksi] = useState<any>(null);

  useEffect(() => {
    getDetailTransaksi();
  }, []);

  async function getDetailTransaksi() {
    setDetailTransaksi(OrderDetail);
  }
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Detail Transaksi"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: 150,
        }}
      >
        {/* ORDER INFORMATION */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Order ID</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {id}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Tanggal Transaksi</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
                ]}
              >
                {formatDate(new Date())}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Dibuat Oleh</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Customer
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Proforma Invoice</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blueTextStyle,
                  { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
                ]}
              >
                Lihat Proforma Invoice
              </Text>
            </View>
          </View>
        </View>
        {/* ADDRESS */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Alamat Pengiriman
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Toko Maju Jaya (Cabang Batam)
          </Text>
          <Gap height={SPACE_8} />
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Komplek Ruko Mall Nagoya Hill Blok. R3 No. J36-37 Nagoya, Batam,
            Lubuk Baja Kota, Batam City, Kepulauan Riau 29444
          </Text>
        </View>
        {/* STATUS */}
        <View style={[styles.cardContainer]}>
          <View style={rowCenter}>
            <View style={[styles.half]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Status Transaksi
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/status-order",
                  params: { id, status: detailTransaksi?.status_order },
                })
              }
              style={[styles.half, { alignItems: "flex-end" }]}
            >
              <Text
                style={[
                  blueTextStyle,
                  { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
                ]}
              >
                Lihat Detail
              </Text>
            </Pressable>
          </View>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <View
            style={[
              { width: "100%", flexDirection: "row", alignItems: "center" },
            ]}
          >
            <View
              style={[
                styles.statusCircle,
                {
                  backgroundColor: blueSecondaryColor,
                  borderColor: lightBlueColor,
                },
              ]}
            />
            <Gap width={10} />
            <View>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {detailTransaksi?.status_order_name}
              </Text>
              <Gap height={SPACE_4} />
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {formatDateTime(new Date())}
              </Text>
            </View>
          </View>
        </View>
        {/* PRODUCT */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Produk Order
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          {detailTransaksi?.product.map((item: any, index: any) => {
            const isLast = index === detailTransaksi?.product.length - 1;
            return (
              <View
                key={item.id}
                style={{
                  width: "100%",
                  borderBottomColor: lineColor,
                  borderStyle: "dashed",
                  paddingBottom: isLast ? 0 : SPACE_16,
                  marginBottom: isLast ? 0 : SPACE_16,
                  borderBottomWidth: isLast ? 0 : 1,
                }}
              >
                <View style={[rowCenter, { width: "100%" }]}>
                  <View
                    style={[
                      {
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View style={styles.imgContainer}>
                      <Image
                        source={require("@/assets/images/img3.png")}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                        }}
                        contentFit="fill"
                      />
                    </View>
                    <View style={{ width: "82%" }}>
                      <Text
                        style={[
                          blackTextStyle,
                          { fontFamily: FontFamily.satoshiMedium },
                        ]}
                      >
                        {item?.product_name}
                      </Text>
                      <Gap height={10} />
                      <View style={[rowCenter, { width: "100%" }]}>
                        <View style={[styles.half]}>
                          <Text
                            style={[
                              greyTextStyle,
                              {
                                fontSize: 12,
                              },
                            ]}
                          >
                            {currencyFormat(item?.price)} x {item?.qty}
                          </Text>
                        </View>
                        <View style={[styles.half, { alignItems: "flex-end" }]}>
                          <Text
                            style={[
                              orangeTextStyle,
                              { fontFamily: FontFamily.satoshiMedium },
                            ]}
                          >
                            {currencyFormat(item?.sub_total_price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <Gap height={10} />
                <Text style={[greyTextStyle, { fontSize: 12 }]}>
                  Catatan Customer: {item?.customer_note ?? "-"}
                </Text>
              </View>
            );
          })}
        </View>
        {/* NOTE */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Informasi Order
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <Text style={[blackTextStyle]}>Catatan Customer</Text>
          <Gap height={10} />
          <View style={[styles.noteContent]}>
            <Text style={[blackTextStyle]}>-</Text>
          </View>
          <Gap height={SPACE_16} />
          <Text style={[blackTextStyle]}>Catatan Sales</Text>
          <Gap height={10} />
          <View style={[styles.noteContent]}>
            <Text style={[blackTextStyle]}>-</Text>
          </View>
          <Gap height={SPACE_16} />
          <Text style={[blackTextStyle]}>Catatan Admin SO</Text>
          <Gap height={10} />
          <View style={[styles.noteContent]}>
            <Text style={[blackTextStyle]}>-</Text>
          </View>
        </View>
        {/* PAYMENT */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Informasi Pembayaran
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Total Tagihan</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {currencyFormat(detailTransaksi?.total_price)}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Metode</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {detailTransaksi?.payment_method}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Nama Bank</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {detailTransaksi?.bank_name}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Status Pembayaran</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  greenTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {detailTransaksi?.status_payment_name}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[shadow, styles.footer]}>
        {detailTransaksi?.status_order === 3 ? (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ width: "47%" }}>
              <Button
                title="Chat"
                titleColor={primaryColor}
                bgColor={"transparent"}
                border={1}
                borderColor={primaryColor}
              />
            </View>
            <View style={{ width: "47%" }}>
              <Button
                title="Selesaikan Order"
                onPress={() =>
                  router.push({ pathname: "/konfirmasi-order", params: { id } })
                }
              />
            </View>
          </View>
        ) : (
          <Button title="Chat" />
        )}
      </View>
    </View>
  );
};

export default TransaksiDetail;

const styles = StyleSheet.create({
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: 20,
  },
  half: {
    width: "49%",
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 3,
  },
  imgContainer: {
    width: "15%",
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  noteContent: {
    width: "100%",
    minHeight: 38,
    padding: 10,
    borderRadius: 10,
    backgroundColor: whiteThirdColor,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    backgroundColor: whiteColor,
    width: "100%",
  },
});
