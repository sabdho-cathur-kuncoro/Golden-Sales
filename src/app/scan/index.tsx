import { FormInput } from "@/components/form";
import {
  AnimatedPressable,
  FocusAwareStatusBar,
  Gap,
  GradientButton,
  ScanLine,
} from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  primaryColor,
  redColor,
  rowCenter,
  screen,
  SPACE_16,
  SPACE_32,
  SPACE_48,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useScanController from "@/hooks/useScanController";
import {
  selectNotifUnread,
  useNotificationStore,
} from "@/stores/notification.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  Camera as CameraIcon,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Package,
  Scan as ScanIcon,
  Trash2,
  X,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { currencyFormat } from "../../../utils/currencyFormat";
import { isAndroid } from "../../../utils/platform";

const Scan = () => {
  const {
    cart,
    manualQr,
    setManualQr,
    statusMsg,
    statusColor,
    busy,
    camOn,
    setCamOn,
    buyerName,
    setBuyerName,
    buyerPhone,
    setBuyerPhone,
    submitting,
    stock,
    stockLoading,
    stockErr,
    expanded,
    toggleGroup,
    device,
    codeScanner,
    fps,
    format,
    isFocused,
    tryAdd,
    removeItem,
    updatePrice,
    cartTotal,
    submit,
  } = useScanController();

  const notifUnread = useNotificationStore(selectNotifUnread);

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <View style={rowCenter}>
          <AnimatedPressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={whiteColor} />
          </AnimatedPressable>
          <Gap width={SPACE_16} />
          <Text
            style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Penjualan
          </Text>
        </View>
        <AnimatedPressable onPress={() => router.push("/notifikasi")}>
          {notifUnread > 0 ? (
            <View style={styles.dot}>
              <Text style={[whiteTextStyle, { fontSize: 8 }]}>
                {notifUnread > 99 ? "99+" : notifUnread}
              </Text>
            </View>
          ) : null}
          <Bell size={22} color={whiteColor} />
        </AnimatedPressable>
      </View>
      <View style={styles.mainContent}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SCAN CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={rowCenter}>
                <ScanIcon size={16} color={primaryColor} />
                <Gap width={SPACE_8} />
                <Text style={styles.cardTitle}>Scan QR / SN</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCamOn((v: any) => !v)}
                style={[
                  styles.camBtn,
                  { backgroundColor: camOn ? lineColor : primaryColor },
                ]}
              >
                {camOn ? (
                  <X size={16} color={blackTextStyle.color as string} />
                ) : (
                  <CameraIcon size={16} color={whiteColor} />
                )}
                <Gap width={6} />
                <Text
                  style={[
                    { fontSize: 12, fontFamily: FontFamily.satoshiBold },
                    {
                      color: camOn
                        ? (blackTextStyle.color as string)
                        : whiteColor,
                    },
                  ]}
                >
                  {camOn ? "Stop" : "Kamera"}
                </Text>
              </TouchableOpacity>
            </View>

            {camOn ? (
              <View style={styles.cameraContainer}>
                {device ? (
                  <>
                    <Camera
                      style={StyleSheet.absoluteFill}
                      device={device}
                      isActive={camOn && isFocused}
                      codeScanner={codeScanner}
                      fps={fps}
                      format={format}
                    />
                    <ScanLine />
                  </>
                ) : (
                  <View style={styles.cameraFallback}>
                    <Text style={[greyTextStyle, { fontSize: 12 }]}>
                      Kamera tidak tersedia
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            <Gap height={SPACE_8} />
            <View style={rowCenter}>
              <TextInput
                value={manualQr}
                onChangeText={setManualQr}
                onSubmitEditing={() => tryAdd(manualQr)}
                placeholder="Ketik QR / SN manual"
                placeholderTextColor={greyColor}
                style={styles.manualInput}
              />
              <Gap width={SPACE_8} />
              <TouchableOpacity
                onPress={() => tryAdd(manualQr)}
                disabled={busy || !manualQr.trim()}
                style={[
                  styles.addBtn,
                  { opacity: busy || !manualQr.trim() ? 0.5 : 1 },
                ]}
              >
                <Text
                  style={[
                    whiteTextStyle,
                    { fontSize: 13, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  Tambah
                </Text>
              </TouchableOpacity>
            </View>
            {statusMsg ? (
              <Text
                style={[
                  { marginTop: SPACE_8, fontSize: 12 },
                  { color: statusColor },
                ]}
              >
                {statusMsg}
              </Text>
            ) : null}
          </View>

          {/* STOK SAYA */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={rowCenter}>
                <Package size={16} color={primaryColor} />
                <Gap width={SPACE_8} />
                <Text style={styles.cardTitle}>Stok Saya</Text>
              </View>
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {stock.totalQty} unit
              </Text>
            </View>

            {stockLoading ? (
              <Text style={styles.centerMuted}>Memuat stok…</Text>
            ) : stockErr ? (
              <Text style={[styles.centerMuted, { color: primaryColor }]}>
                {stockErr}
              </Text>
            ) : stock.groups.length === 0 ? (
              <Text style={styles.centerMuted}>
                Belum ada stok. Selesaikan order pengiriman dulu untuk dapat
                stok.
              </Text>
            ) : (
              stock.groups.map((g: any) => {
                const isOpen = !!expanded[g.productId];
                return (
                  <View key={g.productId} style={styles.stockGroup}>
                    <TouchableOpacity
                      onPress={() => toggleGroup(g.productId)}
                      style={styles.stockGroupHeader}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            blackTextStyle,
                            {
                              fontSize: 13,
                              fontFamily: FontFamily.satoshiBold,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {g.productName || `Product #${g.productId}`}
                        </Text>
                        <Text style={[greyTextStyle, { fontSize: 11 }]}>
                          {g.qty} unit · {currencyFormat(g.unitPrice)} / unit
                        </Text>
                      </View>
                      <View style={[rowCenter, { alignItems: "center" }]}>
                        <View style={styles.qtyBadge}>
                          <Text
                            style={{
                              color: orangeColor,
                              fontSize: 11,
                              fontFamily: FontFamily.satoshiBold,
                            }}
                          >
                            {g.qty}
                          </Text>
                        </View>
                        <Gap width={SPACE_8} />
                        {isOpen ? (
                          <ChevronUp size={16} color={greyColor} />
                        ) : (
                          <ChevronDown size={16} color={greyColor} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {isOpen
                      ? (g.items ?? []).map((it: any) => {
                          const inCart = cart.some((c: any) => c.qr === it.sn);
                          return (
                            <View key={it.sn} style={styles.snRow}>
                              <Text
                                style={{
                                  flex: 1,
                                  color: primaryColor,
                                  fontSize: 11,
                                }}
                                numberOfLines={1}
                              >
                                {it.sn}
                              </Text>
                              {/* Tombol "Jual" per-SN di-hide — flow jual wajib
                                  via Scan QR/SN di atas (konsisten dgn proses
                                  fisik & cegah double-entry). */}
                              {inCart ? (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontFamily: FontFamily.satoshiBold,
                                    color: greyColor,
                                  }}
                                >
                                  ✓ Di keranjang
                                </Text>
                              ) : null}
                            </View>
                          );
                        })
                      : null}
                  </View>
                );
              })
            )}
          </View>

          {/* KERANJANG JUAL */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Keranjang Jual</Text>
              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {cart.length} item
              </Text>
            </View>

            {cart.length === 0 ? (
              <Text style={styles.centerMuted}>
                Belum ada item. Scan QR / tap dari Stok Saya di atas.
              </Text>
            ) : (
              cart.map((it: any) => (
                <View key={it.qr} style={styles.cartRow}>
                  <View style={[rowCenter, { alignItems: "flex-start" }]}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          blackTextStyle,
                          { fontSize: 13, fontFamily: FontFamily.satoshiBold },
                        ]}
                        numberOfLines={1}
                      >
                        {it.productName}
                      </Text>
                      <Text style={{ color: primaryColor, fontSize: 11 }}>
                        {it.qr}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(it.qr)}>
                      <Trash2 size={16} color={greyColor} />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[rowCenter, { alignItems: "center", marginTop: 6 }]}
                  >
                    <Text style={[greyTextStyle, { fontSize: 11 }]}>
                      Harga Jual
                    </Text>
                    <Gap width={SPACE_8} />
                    <TextInput
                      value={String(it.unitPrice)}
                      onChangeText={(val) => updatePrice(it.qr, val)}
                      keyboardType="number-pad"
                      style={styles.priceInput}
                    />
                  </View>
                </View>
              ))
            )}

            <View style={styles.totalRow}>
              <Text style={[greyTextStyle, { fontSize: 13 }]}>Total</Text>
              <Text
                style={{
                  color: primaryColor,
                  fontSize: 16,
                  fontFamily: FontFamily.satoshiBold,
                }}
              >
                {currencyFormat(cartTotal)}
              </Text>
            </View>
          </View>

          {/* PEMBELI */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: SPACE_8 }]}>
              Pembeli (opsional)
            </Text>
            <FormInput
              label="Nama Pembeli"
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Nama pembeli"
              placeholderTextColor={greyColor}
            />
            <Gap height={SPACE_8} />
            <FormInput
              label="No. HP Pembeli"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              placeholder="No. HP pembeli"
              placeholderTextColor={greyColor}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>

        {/* STICKY FOOTER */}
        <View style={styles.footer}>
          <GradientButton
            title={`Jual Sekarang (${currencyFormat(cartTotal)})`}
            loading={submitting}
            disabled={submitting || cart.length === 0}
            onPress={submit}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default Scan;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dot: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: redColor,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  mainContent: {
    flex: 1,
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: SPACE_16,
    paddingTop: SPACE_16,
    paddingBottom: SPACE_16,
  },
  footer: {
    paddingHorizontal: SPACE_16,
    paddingTop: 12,
    paddingBottom: isAndroid ? SPACE_48 : SPACE_32,
    backgroundColor: bgColor,
    borderTopWidth: 1,
    borderTopColor: lineColor,
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    padding: SPACE_16,
    borderWidth: 1,
    borderColor: lineColor,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#1A0000",
    fontSize: 14,
    fontFamily: FontFamily.satoshiBold,
  },
  camBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cameraContainer: {
    width: "100%",
    minHeight: 220,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  cameraFallback: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  manualInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: blackTextStyle.color as string,
  },
  addBtn: {
    backgroundColor: primaryColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centerMuted: {
    color: greyColor,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: SPACE_16,
  },
  stockGroup: {
    borderTopWidth: 1,
    borderTopColor: lineColor,
    paddingVertical: 10,
  },
  stockGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyBadge: {
    backgroundColor: "#FFF0E6",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  snRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: bgColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  cartRow: {
    borderTopWidth: 1,
    borderTopColor: lineColor,
    paddingVertical: 10,
  },
  priceInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    textAlign: "right",
    color: blackTextStyle.color as string,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lineColor,
  },
});
