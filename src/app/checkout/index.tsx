import {
  AnimatedPressable,
  Button,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greenTextStyle,
  greyColor,
  greyTextStyle,
  lineColor,
  lineDash,
  orangeTextStyle,
  pinkSecondaryColor,
  primaryColor,
  primaryTextStyle,
  redColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_4,
  SPACE_48,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCart from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import {
  getVoucherValidateService,
  onSubmitOrdersService,
} from "@/services/orders.services";
import { useAuthStore } from "@/stores/auth.store";
import { lineUnits } from "@/stores/cart.store";
import { useConfirmStore } from "@/stores/confirm.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Minus,
  Plus,
  Ticket,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { currencyFormat } from "../../../utils/currencyFormat";

const DELIVERY_OPTIONS = ["Ambil Sendiri"];
const PAYMENT_OPTIONS = [
  { v: "Transfer Bank", label: "Transfer Bank", sub: "Bank BCA" },
];

// Cart line → the product shape `setQty`/buildLine expects.
const toProduct = (it: any) => ({
  id: it?.productId,
  productName: it?.productName,
  productCode: it?.productCode,
  salesPrice: it?.salesPrice,
  imageBase64: it?.imageBase64,
  imageContentType: it?.imageContentType,
  promos: it?.promos ?? [],
  stock: it?.stock,
});

/**
 * Editable qty stepper for a non-serial line. Holds a local text draft; on
 * commit calls `onCommit(n)` and, if rejected (over stock / invalid), resets
 * the field to the store value `q` so it never shows a stale number.
 */
function LineQty({
  q,
  onDec,
  onInc,
  onCommit,
}: {
  q: number;
  onDec: () => void;
  onInc: () => void;
  onCommit: (n: number) => boolean;
}) {
  const [text, setText] = useState(String(q));
  useEffect(() => setText(String(q)), [q]);

  const commit = (t: string) => {
    const n = parseInt(t, 10);
    const accepted = onCommit(Number.isFinite(n) ? n : 0);
    if (!accepted) setText(String(q));
  };

  return (
    <View style={styles.qtyContainer}>
      <AnimatedPressable onPress={onDec}>
        <Minus size={20} color={primaryColor} />
      </AnimatedPressable>
      <TextInput
        value={text}
        onChangeText={setText}
        onEndEditing={(e) => commit(e.nativeEvent.text)}
        keyboardType="number-pad"
        style={[
          blackTextStyle,
          {
            minWidth: "18%",
            textAlign: "center",
            fontFamily: FontFamily.satoshiBold,
          },
        ]}
      />
      <AnimatedPressable onPress={onInc}>
        <Plus size={20} color={primaryColor} />
      </AnimatedPressable>
    </View>
  );
}

const Checkout = () => {
  const toast = useToast();
  const { show } = useConfirmStore();
  const user = useAuthStore((s) => s.user);

  // Operate on the live cart (matches the web flow); clear() wipes it on order.
  const {
    items,
    setQty,
    remove,
    removeSerial,
    subtotal,
    promoTotal,
    netSubtotal,
    clear,
    lineInfo,
    warehouse,
  } = useCart();

  const [note, setNote] = useState("");
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0]);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0].v);
  const [voucher, setVoucher] = useState("");
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (pid: string) =>
    setCollapsed((p) => ({ ...p, [pid]: !p[pid] }));

  // Confirm before any destructive cart edit (mirrors the cart screen).
  const confirmRemove = (it: any) =>
    show({
      title: "Hapus Item",
      message: `Hapus "${it?.productName}" dari pesanan?`,
      type: "danger",
      onConfirm: async () => remove(it.productId),
    });
  const confirmRemoveSerial = (pid: string, sn: string) =>
    show({
      title: "Hapus Nomor",
      message: `Hapus nomor "${sn}"?`,
      type: "danger",
      onConfirm: async () => removeSerial(pid, sn),
    });

  // Set a non-serial line qty, capped at its known stock (like productDetail).
  // Returns false when rejected so the qty field can reset instead of showing
  // a stale value. Empty/0 keeps the current qty (removal is via trash/minus).
  const changeQty = (it: any, qty: number): boolean => {
    if (typeof it?.stock === "number" && qty > it.stock) {
      toast.warning(
        "Melebihi stok",
        `Jumlah melebihi stok yang tersedia (stok: ${it.stock}).`
      );
      return false;
    }
    if (qty <= 0) return false;
    setQty(toProduct(it), qty);
    return true;
  };

  const incLine = (it: any) => changeQty(it, lineUnits(it) + 1);

  const discount = voucherInfo?.valid ? Number(voucherInfo.discount) || 0 : 0;
  const total = Math.max(0, netSubtotal - discount);

  // Debounced voucher validation (mirrors the web effect).
  useEffect(() => {
    const code = voucher.trim();
    if (!code) {
      setVoucherInfo(null);
      return;
    }
    let cancelled = false;
    setVoucherChecking(true);
    const t = setTimeout(() => {
      getVoucherValidateService(code, subtotal)
        .then((r) => !cancelled && setVoucherInfo(r))
        .catch(
          (e) =>
            !cancelled &&
            setVoucherInfo({ valid: false, message: String(e?.message ?? e) })
        )
        .finally(() => !cancelled && setVoucherChecking(false));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [voucher, subtotal]);

  const doSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        branchId: user?.branchId ? Number(user.branchId) : null,
        warehouseId: warehouse.id,
        notes: note,
        deliveryMethod: delivery,
        paymentMethod: payment,
        voucherCode: voucher.trim() ? voucher.trim() : null,
        items: items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          serials: i.serials || [],
        })),
      };
      const data = await onSubmitOrdersService(payload);
      // Reset cart + warehouse — next order may switch gudang.
      clear();
      router.replace({
        pathname: "/status-screen",
        params: {
          type: "success",
          title: "Pesanan Berhasil Dibuat!",
          message:
            "Pesanan Anda telah kami terima dan sedang diproses.\nAnda dapat memantau status pesanan melalui menu Transaksi.",
          primaryActionType: "go-home",
          primaryActionTitle: "Kembali ke Home",
          secondaryActionType: "go-transaction",
          secondaryActionTitle: "Lihat Transaksi",
          orderId: String(data?.id ?? ""),
        },
      });
    } catch (e: any) {
      toast.error(
        "Gagal Membuat Order",
        String(e?.message ?? "Terjadi Kesalahan")
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate, then ask for confirmation before firing the order.
  const submit = () => {
    if (items.length === 0) return;
    if (!warehouse?.id) {
      toast.warning(
        "Gudang belum dipilih",
        "Kembali ke halaman produk untuk pilih gudang."
      );
      return;
    }
    if (voucher.trim() && voucherInfo && !voucherInfo.valid) {
      toast.warning("Voucher tidak valid", "Hapus atau perbaiki kode voucher.");
      return;
    }
    show({
      title: "Buat Pesanan?",
      message: `Buat pesanan ${items.length} produk senilai ${currencyFormat(
        total
      )}?`,
      onConfirm: doSubmit,
    });
  };

  const renderLine = (it: any) => {
    const hasSerials = it?.serials && it.serials.length > 0;
    const info = lineInfo(it);
    const unit = Number(it?.salesPrice) || 0;
    const q = lineUnits(it);
    const lineDiscount = unit * q - info.subtotal;

    return (
      <View key={it.productId} style={styles.lineContainer}>
        <View style={[rowCenter, { alignItems: "flex-start" }]}>
          <View style={{ width: "62%" }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {it.productName}
            </Text>
            {typeof it?.stock === "number" ? (
              <Text style={[greyTextStyle, { fontSize: 11 }]}>
                Stok: {it.stock}
              </Text>
            ) : null}
            {info.promo ? (
              <>
                <Gap height={SPACE_4} />
                <View style={styles.promoBadge}>
                  <Text
                    style={[
                      greenTextStyle,
                      { fontSize: 10, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {info.label} · hemat {currencyFormat(lineDiscount)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
          <View style={{ width: "36%", alignItems: "flex-end" }}>
            {info.promo ? (
              <>
                <Text
                  style={[
                    greyTextStyle,
                    { fontSize: 11, textDecorationLine: "line-through" },
                  ]}
                >
                  {currencyFormat(unit)}
                </Text>
                <Text
                  style={[
                    orangeTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {currencyFormat(unit - info.discountPerUnit)}{" "}
                  <Text style={[greyTextStyle, { fontSize: 11 }]}>x {q}</Text>
                </Text>
              </>
            ) : (
              <Text style={[blackTextStyle]}>
                {currencyFormat(unit)}{" "}
                <Text style={[greyTextStyle, { fontSize: 11 }]}>x {q}</Text>
              </Text>
            )}
          </View>
        </View>

        {hasSerials ? (
          <View style={{ marginTop: SPACE_8 }}>
            <Pressable
              onPress={() => toggleCollapse(it.productId)}
              style={styles.snToggle}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {collapsed[it.productId] ? (
                  <ChevronUp size={16} color={primaryColor} />
                ) : (
                  <ChevronDown size={16} color={primaryColor} />
                )}
                <Gap width={SPACE_8} />
                <Text style={[primaryTextStyle, { fontSize: 11 }]}>
                  {it.serials.length} nomor
                </Text>
              </View>
            </Pressable>

            {!collapsed[it.productId] ? (
              <>
                {it.serials.map((sn: string) => (
                  <View key={sn} style={styles.snRow}>
                    <Text
                      style={[blackTextStyle, { flex: 1, fontSize: 13 }]}
                      numberOfLines={1}
                    >
                      {sn}
                    </Text>
                    <AnimatedPressable
                      onPress={() => confirmRemoveSerial(it.productId, sn)}
                    >
                      <View style={styles.snDelete}>
                        <Trash2 size={14} color={redColor} />
                      </View>
                    </AnimatedPressable>
                  </View>
                ))}
              </>
            ) : null}

            <Pressable
              onPress={() => confirmRemove(it)}
              style={{ alignSelf: "flex-end", marginTop: SPACE_8 }}
            >
              <Text
                style={[
                  greyTextStyle,
                  { fontSize: 12, textDecorationLine: "underline" },
                ]}
              >
                Hapus semua
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={[rowCenter, { marginTop: SPACE_8 }]}>
            <AnimatedPressable onPress={() => confirmRemove(it)}>
              <View style={styles.snDelete}>
                <Trash2 size={16} color={redColor} />
              </View>
            </AnimatedPressable>
            <LineQty
              q={q}
              onDec={() =>
                q - 1 <= 0 ? confirmRemove(it) : setQty(toProduct(it), q - 1)
              }
              onInc={() => incLine(it)}
              onCommit={(n) => changeQty(it, n)}
            />
          </View>
        )}
      </View>
    );
  };

  const SummaryRow = ({ label, value }: any) => (
    <View style={[rowCenter]}>
      <Text style={[greyTextStyle]}>{label}</Text>
      <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}>
        {value}
      </Text>
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
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Rincian Pesanan
        </Text>
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{ paddingTop: SPACE_16, paddingBottom: 120 }}
        bottomOffset={SPACE_48}
        keyboardShouldPersistTaps="handled"
      >
        {/* SALES INFO */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            {user?.fullName || user?.userName}
          </Text>
          <Gap height={SPACE_4} />
          <Text style={[greyTextStyle, { fontSize: 12 }]}>
            Sales · {user?.role || "—"}
          </Text>
        </View>

        {/* PRODUK ORDER */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Produk Order
          </Text>
          <Gap height={SPACE_16} />
          {items.length === 0 ? (
            <Text
              style={[
                greyTextStyle,
                { textAlign: "center", paddingVertical: SPACE_16 },
              ]}
            >
              Keranjang kosong
            </Text>
          ) : (
            items.map(renderLine)
          )}
          {/* <Gap height={SPACE_8} />
          <Pressable onPress={() => router.push("/order")}>
            <Text
              style={[
                primaryTextStyle,
                { fontFamily: FontFamily.satoshiBold, textAlign: "center" },
              ]}
            >
              + Tambah Pesanan
            </Text>
          </Pressable> */}
        </View>

        {/* NOTE */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Catatan Pesanan <Text style={[greyTextStyle]}>(Opsional)</Text>
          </Text>
          <Gap height={SPACE_16} />
          <TextInput
            value={note}
            onChangeText={(t) => setNote(t.slice(0, 200))}
            placeholder="Tulis catatan untuk pengiriman atau sales"
            placeholderTextColor={greyColor}
            style={[blackTextStyle, styles.noteInput]}
            multiline
            textAlignVertical="top"
          />
          <Text style={[greyTextStyle, { fontSize: 11, textAlign: "right" }]}>
            {note.length} / 200
          </Text>
        </View>

        {/* DELIVERY */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Metode Pengiriman
          </Text>
          <Gap height={SPACE_16} />
          {DELIVERY_OPTIONS.map((m, i) => (
            <Pressable
              key={m}
              onPress={() => setDelivery(m)}
              style={[
                styles.optionRow,
                {
                  marginBottom: i === DELIVERY_OPTIONS.length - 1 ? 0 : SPACE_8,
                },
                delivery === m && styles.optionRowOn,
              ]}
            >
              <View>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {m}
                </Text>
                <Text style={[greyTextStyle, { fontSize: 11 }]}>
                  Sales ambil sendiri di gudang
                </Text>
              </View>
              <View
                style={[
                  {
                    paddingHorizontal: SPACE_8,
                    paddingVertical: SPACE_4,
                    backgroundColor: greenRGBAColor,
                    borderRadius: 999,
                  },
                ]}
              >
                <Text style={[greenTextStyle, {}]}>Gratis</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* PAYMENT */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Metode Pembayaran
          </Text>
          <Gap height={SPACE_16} />
          {PAYMENT_OPTIONS.map((p, i) => (
            <Pressable
              key={p.v}
              onPress={() => setPayment(p.v)}
              style={[
                styles.optionRow,
                {
                  marginBottom: i === PAYMENT_OPTIONS.length - 1 ? 0 : SPACE_8,
                },
                payment === p.v && styles.optionRowOn,
              ]}
            >
              <View>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {p.label}
                </Text>
                {p.sub ? (
                  <Text style={[greyTextStyle, { fontSize: 11 }]}>{p.sub}</Text>
                ) : null}
              </View>
              <View style={[styles.dot, payment === p.v && styles.dotOn]}>
                {payment === p.v ? <View style={styles.dotFill} /> : null}
              </View>
            </Pressable>
          ))}
        </View>

        {/* VOUCHER */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Voucher
          </Text>
          <Gap height={SPACE_16} />
          <View style={styles.voucherInput}>
            <Ticket size={18} color={primaryColor} />
            <Gap width={SPACE_8} />
            <TextInput
              value={voucher}
              onChangeText={(t) => setVoucher(t.toUpperCase())}
              placeholder="Kode voucher"
              placeholderTextColor={greyColor}
              autoCapitalize="characters"
              style={[blackTextStyle, { flex: 1 }]}
            />
            {voucher ? (
              <Pressable hitSlop={8} onPress={() => setVoucher("")}>
                <X size={16} color={greyColor} />
              </Pressable>
            ) : null}
          </View>
          {voucher.trim() ? (
            <>
              <Gap height={SPACE_8} />
              {voucherChecking ? (
                <Text style={[greyTextStyle, { fontSize: 12 }]}>
                  Cek voucher...
                </Text>
              ) : voucherInfo?.valid ? (
                <Text style={[greenTextStyle, { fontSize: 12 }]}>
                  ✓ {voucherInfo.message} — Hemat {currencyFormat(discount)}
                </Text>
              ) : (
                <Text style={[{ color: redColor, fontSize: 12 }]}>
                  ✕ {voucherInfo?.message || "Tidak valid"}
                </Text>
              )}
            </>
          ) : null}
        </View>

        {/* SUMMARY */}
        <View style={styles.cardContainer}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
          >
            Rincian Pembayaran
          </Text>
          <Gap height={SPACE_16} />
          <SummaryRow label="Subtotal" value={currencyFormat(subtotal)} />
          {promoTotal > 0 ? (
            <>
              <Gap height={SPACE_8} />
              <SummaryRow
                label="Diskon Promo Produk"
                value={"- " + currencyFormat(promoTotal)}
              />
            </>
          ) : null}
          <Gap height={SPACE_8} />
          <SummaryRow label="Diskon" value={"- " + currencyFormat(discount)} />
          <Gap height={SPACE_16} />
          <View style={lineDash} />
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <Text
              style={[primaryTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              TOTAL
            </Text>
            <Text
              style={[primaryTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {currencyFormat(total)}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={[shadow, styles.footer]}>
        <View style={{ width: "49%" }}>
          <Text style={[greyTextStyle]}>Total</Text>
          <Text
            style={[
              primaryTextStyle,
              { fontSize: 16, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            {currencyFormat(total)}
          </Text>
        </View>
        <View style={{ width: "49%" }}>
          <Button
            title={loading ? "Memproses..." : "Buat Pesanan"}
            disabled={loading || items.length === 0}
            onPress={submit}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
  },
  lineContainer: {
    width: "100%",
    paddingBottom: SPACE_16,
    marginBottom: SPACE_16,
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
  },
  promoBadge: {
    alignSelf: "flex-start",
    backgroundColor: greenRGBAColor,
    borderWidth: 1,
    borderColor: greenColor,
    borderRadius: 999,
    paddingHorizontal: SPACE_8,
    paddingVertical: 2,
  },
  snToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: bgColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: SPACE_8,
    marginBottom: SPACE_4,
  },
  snRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: bgColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: SPACE_8,
    marginBottom: SPACE_4,
  },
  snDelete: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: redColor,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyContainer: {
    width: "38%",
    borderWidth: 1,
    borderColor: lineColor,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteInput: {
    width: "100%",
    height: 64,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  optionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACE_16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },
  optionRowOn: {
    borderColor: primaryColor,
    backgroundColor: pinkSecondaryColor,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: strokeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  dotOn: {
    borderColor: primaryColor,
  },
  dotFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: primaryColor,
  },
  voucherInput: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 44,
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
});
