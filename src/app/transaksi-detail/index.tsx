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
  greyColor,
  greyTextStyle,
  line,
  lineColor,
  orangeColor,
  orangeRGBAColor,
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
  completeOrderService,
  getDetailOrdersService,
  getOrderTimelineService,
} from "@/services/orders.services";
import { useConfirmStore } from "@/stores/confirm.store";
import { useInputModalStore } from "@/stores/input.store";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  User as UserIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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

const num = (v: any) => Number(v) || 0;
const MONO = Platform.OS === "ios" ? "Courier" : "monospace";

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

const TransaksiDetail = () => {
  const { id } = useLocalSearchParams();
  const toast = useToast();
  const showConfirm = useConfirmStore((s) => s.show);
  const showInput = useInputModalStore((s) => s.showInput);

  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDetailOrdersService(id);
      setOrder(data ?? null);
      try {
        const tl = await getOrderTimelineService(id, { current: null });
        const evs = tl?.events ?? (Array.isArray(tl) ? tl : tl?.data) ?? [];
        setTimeline(evs);
      } catch {
        setTimeline([]);
      }
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const items: any[] = useMemo(() => order?.items ?? [], [order?.items]);
  const status = order?.status;
  const isPending = status === "Menunggu Konfirmasi";
  const waitingAdminSo = status === "Diproses Sales";
  const isTerminal =
    status === "Selesai" || status === "Ditolak" || status === "Reject";
  const canDeleteItem = isPending && items.length > 1;

  // Real invoice once the order is being fulfilled; otherwise a proforma.
  const invoiceReady = [
    "Diproses",
    "Diproses Sebagian",
    "Dikirim",
    "Selesai",
    "Selesai Sebagian",
  ].includes(status);

  // Group rows sharing productName + unitPrice (e.g. Kartu Perdana, 1 row per
  // SN) into one accordion. Voucher codes stay masked until order Selesai.
  const groups = useMemo(() => groupOrderItems(items), [items]);
  const isSelesai = status === "Selesai";
  const shouldMask = (categoryName: string | null) =>
    isVoucherCategory(categoryName) && !isSelesai;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const openChat = () =>
    router.push({ pathname: "/notifikasi/[id]", params: { id: String(id) } });

  const doApprove = async () => {
    setActing(true);
    try {
      await onSubmitApprovalService(id);
      toast.success("Berhasil", "Pesanan di-approve.");
      await load();
    } catch (err) {
      toast.error("Gagal", String(err instanceof Error ? err.message : err));
    } finally {
      setActing(false);
    }
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

  // Selesaikan pesanan Dikirim → POST /sales/orders/:id/complete. SN masuk ke
  // stock sales, bisa langsung dijual via menu Scan.
  const doComplete = () => {
    showConfirm({
      type: "danger",
      title: "Selesaikan Pesanan?",
      message: `Pesanan ${
        order?.orderNumber ?? ""
      } akan ditandai Selesai dan item-itemnya masuk ke Stock Anda. Bisa langsung dijual lewat menu Scan.`,
      onConfirm: async () => {
        setCompleting(true);
        try {
          const res = await completeOrderService(id);
          const sn = res?.snInserted
            ? ` ${res.snInserted} item masuk ke stock.`
            : "";
          toast.success(
            "Berhasil",
            `${res?.message ?? "Pesanan diselesaikan."}${sn}`
          );
          await load();
        } catch (err) {
          toast.error(
            "Gagal",
            String(err instanceof Error ? err.message : err)
          );
        } finally {
          setCompleting(false);
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
        <Header title={"Detail Transaksi"} onBack={() => router.back()} />
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
        <Header title={"Detail Transaksi"} onBack={() => router.back()} />
        <View style={styles.stateContainer}>
          <Text style={[greyTextStyle, { color: redColor }]}>
            {error || "Pesanan tidak ditemukan"}
          </Text>
        </View>
      </View>
    );
  }

  const customer = order?.customer ?? {};
  const branchRegional = [customer?.branch, customer?.regional]
    .filter(Boolean)
    .join(" · ");

  // payment breakdown
  const baseSubtotal = items.reduce(
    (s, i) => s + num(i?.unitPrice) * num(i?.quantity),
    0
  );
  const promoTotal = items.reduce((s, i) => s + num(i?.discount), 0);
  const voucherDiscount = Math.abs(num(order?.discount));

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
          Detail Transaksi
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: SPACE_16,
          paddingHorizontal: SPACE_16,
          paddingBottom: 150,
        }}
      >
        {/* ORDER SUMMARY */}
        <View style={[styles.cardContainer]}>
          <View style={[rowCenter, { alignItems: "flex-start" }]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  blackTextStyle,
                  { fontFamily: FontFamily.satoshiBold, fontSize: 16 },
                ]}
              >
                {order?.orderNumber ?? id}
              </Text>
              <Gap height={SPACE_4} />
              <Text style={[greyTextStyle, { fontSize: 11 }]}>
                {formatDateTime(order?.createdAt)}
              </Text>
            </View>
            {status ? (
              <View style={styles.statusBadge}>
                <Text
                  style={[
                    {
                      color: orangeColor,
                      fontSize: 11,
                      fontFamily: FontFamily.satoshiMedium,
                    },
                  ]}
                >
                  {status}
                </Text>
              </View>
            ) : null}
          </View>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <Row label="Pengiriman" value={order?.deliveryMethod ?? "—"} />
          <Gap height={SPACE_8} />
          <Row label="Pembayaran" value={order?.paymentMethod ?? "—"} />
          {order?.voucherCode ? (
            <>
              <Gap height={SPACE_8} />
              <Row label="Voucher" value={order.voucherCode} />
            </>
          ) : null}
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <View style={[rowCenter]}>
            <Text style={[greyTextStyle, { fontSize: 13 }]}>Total</Text>
            <Text
              style={[primaryTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              {currencyFormat(order?.total)}
            </Text>
          </View>
        </View>

        {/* CUSTOMER */}
        {order?.customer ? (
          <View style={[styles.cardContainer]}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              Customer
            </Text>
            <Gap height={10} />
            <View style={line} />
            <CustomerRow icon={<UserIcon size={16} color={primaryColor} />}>
              {customer?.customerName ?? "-"}
            </CustomerRow>
            {customer?.customerCode ? (
              <CustomerRow>Kode: {customer.customerCode}</CustomerRow>
            ) : null}
            {customer?.phone ? (
              <CustomerRow
                icon={<Phone size={16} color={primaryColor} />}
                onPress={() => Linking.openURL(`tel:${customer.phone}`)}
              >
                {customer.phone}
              </CustomerRow>
            ) : null}
            {customer?.address ? (
              <CustomerRow icon={<MapPin size={16} color={primaryColor} />}>
                {customer.address}
              </CustomerRow>
            ) : null}
            {branchRegional ? (
              <CustomerRow>{branchRegional}</CustomerRow>
            ) : null}
          </View>
        ) : null}

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

        {/* PAYMENT BREAKDOWN */}
        <View style={[styles.cardContainer]}>
          <Text
            style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Rincian Pembayaran
          </Text>
          <Gap height={10} />
          <View style={line} />
          <Gap height={SPACE_16} />
          <Money label="Subtotal Barang" value={baseSubtotal} />
          {promoTotal > 0 ? (
            <>
              <Gap height={SPACE_8} />
              <Money label="Diskon Promo Produk" value={-promoTotal} />
            </>
          ) : null}
          {voucherDiscount > 0 ? (
            <>
              <Gap height={SPACE_8} />
              <Money label="Diskon Voucher" value={-voucherDiscount} />
            </>
          ) : null}
          <Gap height={SPACE_8} />
          <Money label="Pengiriman" value={num(order?.deliveryFee)} />
          <Gap height={SPACE_8} />
          <Money label="Biaya Admin" value={num(order?.adminFee)} />
          <Gap height={SPACE_16} />
          <View style={line} />
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
              {currencyFormat(order?.total)}
            </Text>
          </View>
        </View>

        {/* NOTES */}
        {order?.notes ? (
          <View style={[styles.cardContainer]}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              Catatan Pesanan
            </Text>
            <Gap height={10} />
            <View style={line} />
            <Gap height={10} />
            <Text style={[greyTextStyle, { fontSize: 13 }]}>{order.notes}</Text>
          </View>
        ) : null}

        {/* COMPLETE — Dikirim → masuk stock */}
        {status === "Dikirim" ? (
          <Pressable
            onPress={doComplete}
            disabled={completing}
            style={completing && { opacity: 0.6 }}
          >
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeBtn}
            >
              <CheckCircle size={20} color={whiteColor} />
              <Gap width={12} />
              <Text
                style={[
                  whiteTextStyle,
                  { fontSize: 14, fontFamily: FontFamily.satoshiBold },
                ]}
              >
                {completing ? "Memproses..." : "Selesaikan Pesanan"}
              </Text>
            </LinearGradient>
          </Pressable>
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
          <ChevronRight size={20} color={greyColor} />
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
          <ChevronRight size={20} color={greyColor} />
        </Pressable>
      </ScrollView>

      {/* FOOTER */}
      <View style={[shadow, styles.footer]}>
        {isPending ? (
          <View style={styles.footerRow}>
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
                title={acting ? "Memproses..." : "Approve"}
                disabled={acting}
                onPress={doApprove}
              />
            </View>
          </View>
        ) : waitingAdminSo ? (
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
              Sudah di-approve — menunggu Admin SO
            </Text>
          </View>
        ) : isTerminal ? (
          <Button title="Chat" onPress={openChat} />
        ) : (
          <View style={styles.footerRow}>
            <View style={{ width: "47%" }}>
              <Button
                title="Chat"
                titleColor={primaryColor}
                bgColor={"transparent"}
                border={1}
                borderColor={primaryColor}
                onPress={openChat}
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
        )}
      </View>
    </LinearGradient>
  );
};

export default TransaksiDetail;

const Row = ({ label, value }: any) => (
  <View style={[rowCenter]}>
    <Text style={[greyTextStyle, { fontSize: 13 }]}>{label}</Text>
    <Text
      style={[
        blackTextStyle,
        { fontSize: 13, fontFamily: FontFamily.satoshiMedium },
      ]}
    >
      {value}
    </Text>
  </View>
);

const Money = ({ label, value }: any) => (
  <View style={[rowCenter]}>
    <Text style={[greyTextStyle, { fontSize: 13 }]}>{label}</Text>
    <Text
      style={[
        value < 0 ? greenTextStyle : blackTextStyle,
        { fontSize: 13, fontFamily: FontFamily.satoshiMedium },
      ]}
    >
      {value < 0 ? "- " : ""}
      {currencyFormat(Math.abs(value || 0))}
    </Text>
  </View>
);

const CustomerRow = ({ icon, children, onPress }: any) => {
  if (!children) return null;
  const inner = (
    <View style={styles.customerRow}>
      {icon ? (
        <>
          <View style={styles.customerIcon}>{icon}</View>
          <Gap width={10} />
        </>
      ) : (
        <Gap width={37} />
      )}
      <Text style={[blackTextStyle, { fontSize: 13, flex: 1 }]}>
        {children}
      </Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
};

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
    width: "49%",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: SPACE_4,
    borderRadius: 999,
    backgroundColor: orangeRGBAColor,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: lineColor,
  },
  customerIcon: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: whiteThirdColor,
    alignItems: "center",
    justifyContent: "center",
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
  footer: {
    position: "absolute",
    bottom: 0,
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    paddingBottom: SPACE_48,
    backgroundColor: whiteColor,
    width: "100%",
  },
  footerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  waitingContainer: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
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
