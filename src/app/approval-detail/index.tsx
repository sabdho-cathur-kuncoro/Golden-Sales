import {
  AnimatedPressable,
  Button,
  FocusAwareStatusBar,
  Gap,
  Header,
} from "@/components/ui";
import StatusRow from "@/components/ui/StatusRow";
import {
  bgColor,
  blackTextStyle,
  blueTextStyle,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greenRGBAColor,
  greenTextStyle,
  greyTextStyle,
  line,
  lineColor,
  lineDash,
  orangeTextStyle,
  pinkSecondaryColor,
  primaryColor,
  primaryTextStyle,
  redColor,
  redRGBAColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_4,
  SPACE_48,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
  whiteThirdColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import {
  onDeleteApprovalService,
  onRejectApprovalService,
  onSubmitApprovalService,
} from "@/services/approval.services";
import {
  getDetailOrdersService,
  getOrderTimelineService,
} from "@/services/orders.services";
import { useConfirmStore } from "@/stores/confirm.store";
import { useInputModalStore } from "@/stores/input.store";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  IdCard,
  Lock,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDateTime } from "../../../utils/days";
import {
  groupOrderItems,
  isVoucherCategory,
  itemCode,
  itemSubtotal,
} from "../../../utils/orderItems";

const MONO = Platform.OS === "ios" ? "Courier" : "monospace";

// One label/value row in the payment breakdown. Negative values (discounts)
// render green with a leading minus, matching the order/checkout flow.
const Money = ({ label, value }: { label: string; value: any }) => {
  const v = Number(value) || 0;
  const negative = v < 0;
  return (
    <View style={[rowCenter, { width: "100%", marginBottom: SPACE_8 }]}>
      <View style={[{ flex: 1 }]}>
        <Text style={[greyTextStyle, { fontSize: 13 }]}>{label}</Text>
      </View>
      <Text
        style={[
          { fontSize: 13, fontFamily: FontFamily.satoshiMedium },
          negative ? { color: greenColor } : blackTextStyle,
        ]}
      >
        {negative ? "- " : ""}
        {currencyFormat(Math.abs(v))}
      </Text>
    </View>
  );
};

// Map a timeline event ({ type, title, subtitle, done, ts }) to StatusRow shape.
const mapEvent = (e: any) => ({
  status_name: e?.title ?? e?.status_name ?? e?.status ?? e?.type ?? "-",
  created_at: e?.ts
    ? formatDateTime(e.ts)
    : e?.created_at ?? (e?.createdAt ? formatDateTime(e.createdAt) : ""),
  is_reject:
    e?.is_reject ??
    (typeof e?.type === "string" && e.type.includes("reject")) ??
    false,
  step_done: e?.done ?? e?.step_done ?? true,
  current_step: e?.current ?? e?.current_step ?? false,
});

const ApprovalDetail = () => {
  const { id } = useLocalSearchParams();
  const toast = useToast();
  const showConfirm = useConfirmStore((s) => s.show);
  const showInput = useInputModalStore((s) => s.showInput);

  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDetailOrdersService(id);
      setOrder(data ?? null);
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setLoading(false);
    }
    // Timeline (best-effort, non-blocking — failure shouldn't break the screen).
    try {
      const tl = await getOrderTimelineService(id, { current: null });
      const evs = tl?.events ?? (Array.isArray(tl) ? tl : tl?.data) ?? [];
      setTimeline(evs);
    } catch {
      setTimeline([]);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const items: any[] = useMemo(() => order?.items ?? [], [order?.items]);
  const canApprove = order?.status === "Menunggu Konfirmasi";
  const canReject = order?.status === "Menunggu Konfirmasi";
  const waitingAdminSo = order?.status === "Diproses Sales";
  const canDeleteItem = canApprove && items.length > 1;

  // Real invoice once the order is being fulfilled; otherwise a proforma.
  const invoiceReady = [
    "Diproses",
    "Diproses Sebagian",
    "Dikirim",
    "Selesai",
    "Selesai Sebagian",
  ].includes(order?.status);

  // Group rows sharing productName + unitPrice (e.g. Kartu Perdana, 1 row per
  // SN) into one accordion. Voucher codes stay masked until order Selesai.
  const groups = useMemo(() => groupOrderItems(items), [items]);
  const isSelesai = order?.status === "Selesai";
  const shouldMask = (categoryName: string | null) =>
    isVoucherCategory(categoryName) && !isSelesai;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const doApprove = async () => {
    showConfirm({
      title: "Terima Pesanan",
      message: "Proses pesanan ini?",
      type: "danger",
      onConfirm: async () => {
        setActing(true);
        try {
          await onSubmitApprovalService(id);
          toast.success("Berhasil", "Pesanan di-approve.");
          await load();
        } catch (err) {
          toast.error(
            "Gagal",
            String(err instanceof Error ? err.message : err)
          );
        } finally {
          setActing(false);
        }
      },
    });
  };

  const doReject = () => {
    showInput({
      title: "Tolak Pesanan",
      placeholder: "Alasan penolakan...",
      onConfirm: async (reason: string) => {
        if (!reason?.trim()) {
          toast.warning("Perhatian", "Masukkan alasan penolakan.");
          return;
        }
        setActing(true);
        try {
          await onRejectApprovalService(id, reason.trim());
          toast.success("Berhasil", "Pesanan ditolak.");
          await load();
        } catch (err) {
          toast.error(
            "Gagal",
            String(err instanceof Error ? err.message : err)
          );
        } finally {
          setActing(false);
        }
      },
    });
  };

  const doDeleteItem = (item: any) => {
    showConfirm({
      title: "Hapus Item",
      message: `Hapus "${
        item?.productName ?? "item ini"
      }" dari pesanan? Stok akan dikembalikan.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await onDeleteApprovalService(id, item?.id);
          await load();
        } catch (err) {
          toast.error(
            "Gagal",
            String(err instanceof Error ? err.message : err)
          );
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={[screen, { backgroundColor: whiteColor }]}>
        <FocusAwareStatusBar barStyle={"dark-content"} />
        <Header title={"Detail Approval"} onBack={() => router.back()} />
        <View style={styles.stateContainer}>
          <ActivityIndicator color={primaryColor} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[screen, { backgroundColor: whiteColor }]}>
        <FocusAwareStatusBar barStyle={"dark-content"} />
        <Header title={"Detail Approval"} onBack={() => router.back()} />
        <View style={styles.stateContainer}>
          <Text style={[greyTextStyle, { color: redColor }]}>
            {error || "Pesanan tidak ditemukan"}
          </Text>
        </View>
      </View>
    );
  }

  const customer = order?.customer ?? {};
  const showFooter = canApprove || canReject || waitingAdminSo;

  // latest status = most recent done event, fallback last event
  const latestEvent =
    [...timeline].reverse().find((e) => e?.done ?? e?.step_done) ??
    timeline[timeline.length - 1];

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
          Detail Approval
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: showFooter ? 150 : SPACE_48,
        }}
      >
        {/* ORDER INFORMATION */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Order ID</Text>
            </View>
            <View
              style={[
                styles.half,
                {
                  width: "55%",
                  alignItems: "flex-end",
                },
              ]}
            >
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium, textAlign: "right" },
                ]}
              >
                {order?.orderNumber ?? id}
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
                {formatDateTime(order?.createdAt)}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Status</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {order?.status ?? "-"}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Pengiriman</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {order?.deliveryMethod ?? "-"}
              </Text>
            </View>
          </View>
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text style={[blackTextStyle]}>Pembayaran</Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                {order?.paymentMethod ?? "-"}
              </Text>
            </View>
          </View>
          <Gap height={SPACE_16} />
          <View style={[lineDash]} />
          <Gap height={SPACE_16} />
          <View style={[rowCenter]}>
            <View style={[styles.half]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                Total
              </Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(order?.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* CUSTOMER / ADDRESS */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Alamat Pengiriman
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <View style={[styles.row]}>
            <View style={styles.iconInfoContainer}>
              <User size={16} color={redColor} />
            </View>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {customer?.customerName ?? "-"}
            </Text>
          </View>
          <Gap height={10} />
          <View style={[styles.row]}>
            <View style={styles.iconInfoContainer}>
              <IdCard size={16} color={redColor} />
            </View>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {customer?.customerCode ?? "-"}
            </Text>
          </View>
          {customer?.phone ? (
            <>
              <Gap height={10} />
              <View style={styles.row}>
                <View style={styles.iconInfoContainer}>
                  <Phone size={14} color={redColor} />
                </View>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {customer.phone}
                </Text>
              </View>
            </>
          ) : null}
          {customer?.address ? (
            <>
              <Gap height={10} />
              <View style={styles.row}>
                <View style={styles.iconInfoContainer}>
                  <MapPin size={14} color={redColor} />
                </View>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {customer.address}
                </Text>
              </View>
            </>
          ) : null}
          <Gap height={10} />
          <View
            style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}
          >
            <View style={styles.iconInfoContainer}>
              <Map size={14} color={redColor} />
            </View>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {customer?.branch} {" · "} {customer?.regional}
            </Text>
          </View>
        </View>

        {/* RIWAYAT PESANAN */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter]}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              Riwayat Pesanan
            </Text>
            {timeline.length > 0 ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/status-order",
                    params: { id: String(id), orderId: order?.orderNumber },
                  })
                }
              >
                <Text
                  style={[
                    blueTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  Lihat Detail
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Gap height={10} />
          <View style={line} />
          <Gap height={SPACE_16} />
          {latestEvent ? (
            <StatusRow data={mapEvent(latestEvent)} isLast />
          ) : (
            <Text style={[greyTextStyle, { fontSize: 13 }]}>
              Belum ada riwayat
            </Text>
          )}
        </View>

        {/* PRODUCTS */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Produk Order ({items.length})
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          {groups.map((g: any, index: number) => {
            const isLast = index === groups.length - 1;
            const masked = shouldMask(g.categoryName);
            const rowWrap = {
              width: "100%" as const,
              borderBottomColor: lineColor,
              borderStyle: "dashed" as const,
              paddingBottom: isLast ? 0 : SPACE_16,
              marginBottom: isLast ? 0 : SPACE_16,
              borderBottomWidth: isLast ? 0 : 1,
            };

            // --- Single item (not grouped): keep current row design ---------
            if (!g.isGrouped) {
              const item = g.rows[0];
              const code = itemCode(item);
              const lineDiscount = Number(item.discount) || 0;
              const hasPromo = lineDiscount > 0;
              const unitNet =
                hasPromo && item.quantity
                  ? item.unitPrice - lineDiscount / item.quantity
                  : item.unitPrice;
              return (
                <View key={g.key} style={rowWrap}>
                  <View style={[rowCenter, { width: "100%" }]}>
                    <View style={[styles.half]}>
                      <Text
                        style={[
                          blackTextStyle,
                          { fontFamily: FontFamily.satoshiMedium },
                        ]}
                      >
                        {item?.productName}
                      </Text>
                      {code ? (
                        masked ? (
                          <View
                            style={[
                              {
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 2,
                              },
                            ]}
                          >
                            <Lock size={12} color={orangeTextStyle.color} />
                            <Gap width={4} />
                            <Text style={[orangeTextStyle, { fontSize: 11 }]}>
                              Kode tampil setelah selesai
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={[
                              greyTextStyle,
                              { fontSize: 11, fontFamily: MONO, marginTop: 2 },
                            ]}
                          >
                            {code}
                          </Text>
                        )
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.half,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          blackTextStyle,
                          {
                            fontFamily: FontFamily.satoshiMedium,
                            fontSize: 16,
                          },
                        ]}
                      >
                        {currencyFormat(itemSubtotal(item))}
                      </Text>
                      {canDeleteItem ? (
                        <>
                          <Gap width={SPACE_8} />
                          <Pressable
                            hitSlop={8}
                            onPress={() => doDeleteItem(item)}
                          >
                            <Trash2 size={18} color={redColor} />
                          </Pressable>
                        </>
                      ) : null}
                    </View>
                  </View>
                  <Gap height={10} />
                  <View
                    style={[
                      {
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    {hasPromo ? (
                      <>
                        <Text
                          style={[
                            greyTextStyle,
                            {
                              fontSize: 12,
                              textDecorationLine: "line-through",
                            },
                          ]}
                        >
                          {currencyFormat(item?.unitPrice)}
                        </Text>
                        <Gap width={4} />
                        <Text style={[orangeTextStyle, { fontSize: 12 }]}>
                          {currencyFormat(unitNet)}{" "}
                          <Text style={[greyTextStyle, { fontSize: 12 }]}>
                            x {item?.quantity}
                          </Text>
                        </Text>
                      </>
                    ) : (
                      <Text style={[greyTextStyle, { fontSize: 12 }]}>
                        {currencyFormat(item?.unitPrice)} x {item?.quantity}
                      </Text>
                    )}
                  </View>
                  {hasPromo && (
                    <View style={styles.pillPromo}>
                      <Text
                        style={[
                          greenTextStyle,
                          { fontSize: 10, fontFamily: FontFamily.satoshiBold },
                        ]}
                      >
                        Hemat {currencyFormat(lineDiscount)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }

            // --- Grouped (e.g. Kartu Perdana, 1 row per SN): accordion ------
            const opened = !!openGroups[g.key];
            return (
              <View key={g.key} style={rowWrap}>
                <Pressable onPress={() => toggleGroup(g.key)}>
                  <View style={[rowCenter, { width: "100%" }]}>
                    <View style={[styles.half]}>
                      <Text
                        style={[
                          blackTextStyle,
                          { fontFamily: FontFamily.satoshiMedium },
                        ]}
                      >
                        {g.productName}
                      </Text>
                      <Text
                        style={[greyTextStyle, { fontSize: 12, marginTop: 2 }]}
                      >
                        {g.rows.length} nomor · {currencyFormat(g.unitPrice)}
                        /pcs
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.half,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          orangeTextStyle,
                          { fontFamily: FontFamily.satoshiMedium },
                        ]}
                      >
                        {currencyFormat(g.totalSubtotal)}
                      </Text>
                      <Gap width={SPACE_8} />
                      <ChevronDown
                        size={18}
                        color={primaryColor}
                        style={{
                          transform: [{ rotate: opened ? "180deg" : "0deg" }],
                        }}
                      />
                    </View>
                  </View>
                </Pressable>

                {opened ? (
                  <View
                    style={{
                      marginTop: 10,
                      marginLeft: 4,
                      paddingLeft: 10,
                      borderLeftWidth: 2,
                      borderLeftColor: lineColor,
                    }}
                  >
                    {masked ? (
                      <View style={[rowCenter, { marginBottom: 6 }]}>
                        <Lock size={12} color={orangeTextStyle.color} />
                        <Gap width={4} />
                        <Text style={[orangeTextStyle, { fontSize: 11 }]}>
                          Kode tampil setelah order selesai
                        </Text>
                      </View>
                    ) : null}
                    {g.rows.map((r: any, idx: number) => {
                      const code = itemCode(r);
                      return (
                        <View
                          key={r?.id ?? `${g.key}-${idx}`}
                          style={[
                            rowCenter,
                            { width: "100%", paddingVertical: 4 },
                          ]}
                        >
                          <View
                            style={[
                              rowCenter,
                              { flex: 1, justifyContent: "flex-start" },
                            ]}
                          >
                            {masked ? (
                              <Lock size={12} color={orangeTextStyle.color} />
                            ) : (
                              <Hash size={12} color={primaryColor} />
                            )}
                            <Gap width={6} />
                            <Text
                              numberOfLines={1}
                              style={
                                masked
                                  ? [
                                      orangeTextStyle,
                                      { fontSize: 12, letterSpacing: 2 },
                                    ]
                                  : [
                                      blackTextStyle,
                                      { fontSize: 12, fontFamily: MONO },
                                    ]
                              }
                            >
                              {masked ? "•••• •••• ••••" : code || "—"}
                            </Text>
                          </View>
                          <View
                            style={[rowCenter, { justifyContent: "flex-end" }]}
                          >
                            <Text style={[greyTextStyle, { fontSize: 12 }]}>
                              {currencyFormat(itemSubtotal(r))}
                            </Text>
                            {canDeleteItem ? (
                              <>
                                <Gap width={SPACE_8} />
                                <Pressable
                                  hitSlop={8}
                                  onPress={() => doDeleteItem(r)}
                                >
                                  <Trash2 size={16} color={redColor} />
                                </Pressable>
                              </>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
          {canDeleteItem ? (
            <>
              <Gap height={10} />
              <Text style={[greyTextStyle, { fontSize: 11 }]}>
                Hapus item sebelum setujui — stok akan dikembalikan.
              </Text>
            </>
          ) : null}
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
          {order?.voucherCode ? (
            <>
              <View style={[rowCenter, { marginBottom: SPACE_8 }]}>
                <View style={[styles.half]}>
                  <Text style={[greyTextStyle, { fontSize: 13 }]}>Voucher</Text>
                </View>
                <View style={[styles.half, { alignItems: "flex-end" }]}>
                  <Text
                    style={[
                      blueTextStyle,
                      { fontFamily: FontFamily.satoshiMedium, fontSize: 13 },
                    ]}
                  >
                    {order.voucherCode}
                  </Text>
                </View>
              </View>
            </>
          ) : null}
          {(() => {
            const promoTotal = items.reduce(
              (s, i) => s + (Number(i?.discount) || 0),
              0
            );
            const baseSubtotal = items.reduce(
              (s, i) =>
                s + (Number(i?.unitPrice) || 0) * (Number(i?.quantity) || 0),
              0
            );
            return (
              <>
                <Money label="Subtotal Barang" value={baseSubtotal} />
                {promoTotal > 0 ? (
                  <Money
                    label="Diskon Promo Produk"
                    value={-Math.abs(promoTotal)}
                  />
                ) : null}
                {Math.abs(Number(order?.discount) || 0) > 0 ? (
                  <Money
                    label="Diskon Voucher"
                    value={-Math.abs(Number(order?.discount) || 0)}
                  />
                ) : null}
              </>
            );
          })()}
          <Money label="Pengiriman" value={order?.deliveryFee} />
          <Money label="Biaya Admin" value={order?.adminFee} />
          <Gap height={SPACE_8} />
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
                Total
              </Text>
            </View>
            <View style={[styles.half, { alignItems: "flex-end" }]}>
              <Text
                style={[
                  primaryTextStyle,
                  { fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {currencyFormat(order?.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* NOTES */}
        {order?.notes ? (
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: pinkSecondaryColor,
                borderWidth: 1,
                borderColor: redRGBAColor,
              },
            ]}
          >
            <Text
              style={[
                greyTextStyle,
                {
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                },
              ]}
            >
              Catatan
            </Text>
            <Text style={[blackTextStyle, { fontSize: 13 }]}>
              {order.notes}
            </Text>
          </View>
        ) : null}

        {/* CHAT */}
        <Pressable
          style={[styles.cardContainer, styles.invoiceRow]}
          onPress={() =>
            router.push({
              pathname: "/order-chat/[id]",
              params: {
                id: String(id),
                orderId: order?.orderNumber,
                status: String(order?.status ?? ""),
              },
            })
          }
        >
          <View style={styles.invoiceIcon}>
            <MessageCircle size={20} color={primaryColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              Chat Pesanan
            </Text>
            <Gap height={2} />
            <Text style={[greyTextStyle, { fontSize: 11 }]}>
              Tanya status / kirim pesan
            </Text>
          </View>
          <ChevronRight size={20} color={greyTextStyle.color} />
        </Pressable>

        {/* INVOICE LINK */}
        <Pressable
          style={[styles.cardContainer, styles.invoiceRow]}
          onPress={() =>
            router.push({
              pathname: "/invoice/[id]",
              params: { id: String(id) },
            })
          }
        >
          <View style={styles.invoiceIcon}>
            <FileText size={20} color={primaryColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              Lihat {invoiceReady ? "Invoice" : "Proforma Invoice"}
            </Text>
            <Gap height={2} />
            <Text style={[greyTextStyle, { fontSize: 11 }]}>PDF / Print</Text>
          </View>
          <ChevronRight size={20} color={greyTextStyle.color} />
        </Pressable>
      </ScrollView>

      {showFooter ? (
        <View style={[shadow, styles.footer]}>
          {waitingAdminSo ? (
            <View style={styles.waitingContainer}>
              <Text
                style={[
                  blueTextStyle,
                  {
                    fontFamily: FontFamily.satoshiMedium,
                    fontSize: 12,
                    textAlign: "center",
                  },
                ]}
              >
                Sudah disetujui — menunggu Admin SO
              </Text>
            </View>
          ) : (
            <>
              <View style={{ width: "47%" }}>
                <Button
                  title="Reject"
                  titleColor={primaryColor}
                  bgColor={"transparent"}
                  border={1}
                  borderColor={primaryColor}
                  disabled={acting}
                  onPress={doReject}
                />
              </View>
              <View style={{ width: "47%" }}>
                <Button
                  title={acting ? "Memproses..." : "Setujui"}
                  disabled={acting}
                  onPress={doApprove}
                />
              </View>
            </>
          )}
        </View>
      ) : null}
    </LinearGradient>
  );
};

export default ApprovalDetail;

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
  cardContainer: {
    padding: SPACE_16,
    borderRadius: 10,
    backgroundColor: whiteColor,
    marginBottom: 20,
  },
  half: {
    width: "45%",
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: pinkSecondaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noteContent: {
    width: "100%",
    minHeight: 64,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: whiteThirdColor,
  },
  waitingContainer: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    backgroundColor: whiteColor,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: lineColor,
    paddingBottom: 8,
  },
  iconInfoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: redRGBAColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pillPromo: {
    alignSelf: "flex-start",
    marginTop: SPACE_8,
    paddingHorizontal: SPACE_8,
    paddingVertical: SPACE_4,
    backgroundColor: greenRGBAColor,
    borderWidth: 1,
    borderColor: greenColor,
    borderRadius: 999,
  },
});
