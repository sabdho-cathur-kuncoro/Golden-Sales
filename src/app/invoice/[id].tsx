import { FocusAwareStatusBar, Gap, GradientButton } from "@/components/ui";
import {
  blackColor,
  blackTextStyle,
  FontFamily,
  greenColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  orangeRGBAColor,
  pinkSecondaryColor,
  primaryColor,
  redRGBAColor,
  screen,
  shadow,
  SPACE_16,
  SPACE_8,
  whiteColor,
  whiteThirdColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { getDetailOrdersService } from "@/services/orders.services";
import { useAuthStore } from "@/stores/auth.store";
import { Asset } from "expo-asset";
import * as LegacyFS from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
// expo-print's printToFileAsync is the HTML→PDF generator (writes a .pdf file,
// it does NOT send to a printer). Aliased to htmlToPdf to keep this a download.
import { printToFileAsync as htmlToPdf } from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  ArrowLeft,
  Briefcase,
  Download,
  Hash,
  Share2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { formatDate } from "../../../utils/days";
import { groupOrderItems } from "../../../utils/orderItems";

// Statuses where the doc is a real invoice (post Admin-SO), else a proforma.
const FINAL_STATUSES = [
  "Diproses",
  "Diproses Sebagian",
  "Dikirim",
  "Tiba",
  "Selesai",
  "Selesai Sebagian",
];

const num = (v: any) => Number(v) || 0;

// Logo embedded into the PDF as a base64 data-URI (resolved once, cached).
const LOGO_MODULE = require("../../../assets/icon-horizontal.png");
let logoDataUriCache: string | null = null;
const getLogoDataUri = async (): Promise<string> => {
  if (logoDataUriCache) return logoDataUriCache;
  const asset = Asset.fromModule(LOGO_MODULE);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const base64 = await LegacyFS.readAsStringAsync(uri, {
    encoding: LegacyFS.EncodingType.Base64,
  });
  logoDataUriCache = `data:image/png;base64,${base64}`;
  return logoDataUriCache;
};

const InvoiceScreen = () => {
  const { id } = useLocalSearchParams();
  const toast = useToast();
  const sales = useAuthStore((s) => s.user);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

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
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isFinalInvoice = order && FINAL_STATUSES.includes(order.status);
  const docLabel = isFinalInvoice ? "Invoice" : "Proforma Invoice";

  // ---- PDF ----------------------------------------------------------------
  const buildHtml = (logo: string) => {
    const hasCustomer = !!order.customer;
    const buyer = hasCustomer ? order.customer : null;
    const su = sales ?? ({} as any);

    const promoTotal = (order.items || []).reduce(
      (s: number, i: any) => s + num(i?.discount),
      0
    );
    const baseSubtotal = (order.items || []).reduce(
      (s: number, i: any) => s + num(i?.unitPrice) * num(i?.quantity),
      0
    );

    const moneyRow = (label: string, value: number) => {
      const neg = value < 0;
      return `<div class="mrow"><span class="muted">${label}</span><span style="color:${
        neg ? "#0DB561" : "#1A0000"
      }">${neg ? "- " : ""}${currencyFormat(
        Math.abs(value || 0)
      )}</span></div>`;
    };

    const itemsHtml = groupOrderItems(order.items)
      .map((g: any) => {
        if (!g.isGrouped) {
          const it = g.rows[0];
          const serials = Array.isArray(it.serials) ? it.serials : [];
          const snHtml = serials.length
            ? `<div class="snwrap">${serials
                .map((sn: string) => `<div class="snrow">#${sn}</div>`)
                .join("")}</div>`
            : it.productCode
            ? `<div class="code">${it.productCode}</div>`
            : "";
          return `<div class="irow">
            <div><div class="pname">${it.productName ?? ""}</div>${snHtml}
              <div class="muted sm">@ ${currencyFormat(
                it.unitPrice
              )}</div></div>
            <div class="qty">${it.quantity ?? ""}</div>
            <div class="sub">${currencyFormat(
              it.subtotal ??
                num(it.unitPrice) * num(it.quantity) - num(it.discount)
            )}</div>
          </div>`;
        }
        const snList = g.rows
          .map(
            (r: any) =>
              `<div class="snrow"><span>#${
                r.productCode || "—"
              }</span><span class="muted">${currencyFormat(
                r.subtotal ??
                  num(r.unitPrice) * num(r.quantity) - num(r.discount)
              )}</span></div>`
          )
          .join("");
        return `<div class="irow">
          <div><div class="pname">${g.productName ?? ""}</div>
            <div class="muted sm"><b>${
              g.rows.length
            } nomor</b> · @ ${currencyFormat(g.unitPrice)}</div>
            <div class="snwrap">${snList}</div></div>
          <div class="qty">${g.totalQuantity}</div>
          <div class="sub">${currencyFormat(g.totalSubtotal)}</div>
        </div>`;
      })
      .join("");

    const issuer = hasCustomer
      ? `<div class="b">${buyer.customerName || "—"}</div>
         ${
           buyer.customerCode
             ? `<div class="muted sm">Kode: ${buyer.customerCode}</div>`
             : ""
         }
         ${buyer.phone ? `<div class="muted sm">${buyer.phone}</div>` : ""}
         ${buyer.email ? `<div class="muted sm">${buyer.email}</div>` : ""}
         ${buyer.address ? `<div class="muted sm">${buyer.address}</div>` : ""}`
      : `<div class="b">${su.fullName || su.username || "—"}</div>
         ${su.username ? `<div class="muted sm">@${su.username}</div>` : ""}
         ${su.phone ? `<div class="muted sm">${su.phone}</div>` : ""}
         ${su.email ? `<div class="muted sm">${su.email}</div>` : ""}
         <div class="tag">Sales-placed Order</div>`;

    const branch = hasCustomer
      ? `<div class="b">${buyer.branch || "—"}</div><div class="muted sm">${
          buyer.regional || ""
        }</div>`
      : `<div class="b">${su.branchName || "—"}</div><div class="muted sm">${
          su.regionalName || ""
        }</div>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      * { box-sizing: border-box; font-family: -apple-system, Roboto, "Helvetica Neue", sans-serif; }
      body { margin:0; color:#1A0000; font-size:12px; }
      .muted { color:#606060; } .sm { font-size:10px; } .b { font-weight:700; }
      .band { background:linear-gradient(90deg,#1A0000,#350000,#C11717); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; }
      .band .lbl { font-size:10px; text-transform:uppercase; letter-spacing:1px; opacity:.85; }
      .band .no { font-size:16px; font-weight:700; margin-top:2px; }
      .badge { background:rgba(255,255,255,.2); font-size:9px; padding:2px 6px; border-radius:4px; font-weight:700; margin-left:6px; }
      .logo { background:rgba(255,255,255,.95); border-radius:8px; padding:6px; }
      .logo img { height:32px; width:auto; display:block; }
      .body { padding:20px; }
      .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
      .pill { background:#FFF0E6; color:#E87B1E; padding:6px 12px; border-radius:999px; font-size:11px; font-weight:600; }
      .blocks { display:flex; gap:12px; margin-bottom:16px; }
      .block { flex:1; background:#FBF9F9; border:1px solid #F6F3F3; border-radius:10px; padding:10px; }
      .block .t { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#606060; margin-bottom:4px; }
      .tag { color:#B20605; font-size:10px; font-weight:700; text-transform:uppercase; margin-top:4px; }
      .table { border:1px solid #F6F3F3; border-radius:10px; overflow:hidden; }
      .thead { background:#FFF5F5; padding:8px 12px; display:grid; grid-template-columns:1fr 48px 90px; gap:8px; font-size:11px; font-weight:700; text-transform:uppercase; }
      .thead .c { text-align:center; } .thead .r { text-align:right; }
      .irow { padding:10px 12px; display:grid; grid-template-columns:1fr 48px 90px; gap:8px; border-top:1px solid #F6F3F3; }
      .irow:first-child { border-top:0; }
      .pname { font-weight:600; }
      .code { font-family:monospace; font-size:10px; color:#606060; margin-top:2px; }
      .qty { text-align:center; align-self:center; }
      .sub { text-align:right; font-weight:700; align-self:center; }
      .snwrap { margin-top:6px; padding-left:10px; border-left:2px solid #FECECE; }
      .snrow { display:flex; justify-content:space-between; font-family:monospace; font-size:11px; padding:1px 0; }
      .totals { margin-top:16px; }
      .mrow { display:flex; justify-content:space-between; padding:3px 0; }
      .total { display:flex; justify-content:space-between; font-weight:700; font-size:15px; border-top:1px dashed #ccc; padding-top:8px; margin-top:8px; }
      .total .amt { color:#B20605; }
      .notes { margin-top:16px; background:#FBF9F9; border:1px solid #F6F3F3; border-radius:10px; padding:12px; }
      .foot { margin-top:20px; padding-top:16px; border-top:1px dashed #ddd; text-align:center; font-size:11px; color:#606060; }
    </style></head><body>
      <div class="band">
        <div><div class="lbl">${docLabel}<span class="badge">${
      hasCustomer ? "CUSTOMER" : "SALES"
    }</span></div>
        <div class="no">${order.orderNumber ?? ""}</div></div>
        ${logo ? `<div class="logo"><img src="${logo}"/></div>` : ""}
      </div>
      <div class="body">
        <div class="top">
          <div><div class="muted sm">Tanggal Issue</div><div class="b" style="font-size:13px;margin-top:2px">${formatDate(
            order.createdAt
          )}</div></div>
          <span class="pill">${order.status ?? ""}</span>
        </div>
        <div class="blocks">
          <div class="block"><div class="t">${
            hasCustomer ? "Issued To" : "Sales (Issuer)"
          }</div>${issuer}</div>
          <div class="block"><div class="t">Cabang</div>${branch}
            ${
              order.deliveryMethod
                ? `<div class="muted sm">Pengiriman: ${order.deliveryMethod}</div>`
                : ""
            }
            ${
              order.paymentMethod
                ? `<div class="muted sm">Pembayaran: ${order.paymentMethod}</div>`
                : ""
            }
          </div>
        </div>
        <div class="table">
          <div class="thead"><div>Produk</div><div class="c">Qty</div><div class="r">Subtotal</div></div>
          ${itemsHtml}
        </div>
        <div class="totals">
          ${moneyRow("Subtotal Barang", baseSubtotal)}
          ${
            promoTotal > 0
              ? moneyRow("Diskon Promo Produk", -Math.abs(promoTotal))
              : ""
          }
          ${
            Math.abs(num(order.discount)) > 0
              ? moneyRow("Diskon Voucher", -Math.abs(num(order.discount)))
              : ""
          }
          ${moneyRow("Biaya Pengiriman", num(order.deliveryFee))}
          ${moneyRow("Biaya Admin", num(order.adminFee))}
          <div class="total"><span>TOTAL PEMBAYARAN</span><span class="amt">${currencyFormat(
            order.total
          )}</span></div>
        </div>
        ${
          order.notes
            ? `<div class="notes"><div class="t muted sm" style="text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Catatan</div><div>${order.notes}</div></div>`
            : ""
        }
        <div class="foot">${
          isFinalInvoice
            ? "Dokumen ini adalah <b>invoice resmi</b> setelah pesanan disetujui Admin SO. Terima kasih."
            : "Dokumen ini adalah <b>proforma invoice</b> dan bukan bukti pembayaran resmi. Terima kasih."
        }</div>
      </div>
    </body></html>`;
  };

  const safeName = () =>
    `belanjayuk-${id}-${formatDate(
      new Date(order?.createdAt),
      "DDMMYY"
    )}`.replace(/[^\w.-]+/g, "_") + ".pdf";

  // Download = generate PDF, then save to device storage (Android SAF /
  // iOS share-sheet → Save to Files).
  const handleDownload = async () => {
    if (!order || exporting) return;
    setExporting(true);
    try {
      const logo = await getLogoDataUri().catch(() => "");
      const { uri } = await htmlToPdf({ html: buildHtml(logo) });
      const fileName = safeName();

      if (Platform.OS === "android") {
        // Legacy FS API exposes Storage Access Framework + base64 read.
        const perm =
          await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted) {
          const base64 = await LegacyFS.readAsStringAsync(uri, {
            encoding: LegacyFS.EncodingType.Base64,
          });
          const dest = await LegacyFS.StorageAccessFramework.createFileAsync(
            perm.directoryUri,
            fileName,
            "application/pdf"
          );
          await LegacyFS.writeAsStringAsync(dest, base64, {
            encoding: LegacyFS.EncodingType.Base64,
          });
          toast.success("Tersimpan", "Invoice PDF tersimpan ke perangkat.");
          return;
        }
        // permission denied → fall through to share sheet
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: fileName,
        });
      } else {
        toast.info("PDF dibuat", fileName);
      }
    } catch (err) {
      toast.error("Gagal", String(err instanceof Error ? err.message : err));
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!order || exporting) return;
    setExporting(true);
    try {
      const logo = await getLogoDataUri().catch(() => "");
      const { uri } = await htmlToPdf({ html: buildHtml(logo) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: safeName(),
        });
      } else {
        toast.info("PDF dibuat", safeName());
      }
    } catch (err) {
      toast.error("Gagal", String(err instanceof Error ? err.message : err));
    } finally {
      setExporting(false);
    }
  };

  // ---- States -------------------------------------------------------------
  if (loading) {
    return (
      <View style={[screen, { backgroundColor: whiteColor }]}>
        <FocusAwareStatusBar barStyle={"dark-content"} />
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
        <View style={styles.stateContainer}>
          <Text style={[greyTextStyle, { color: primaryColor }]}>
            {error || "Invoice tidak ditemukan"}
          </Text>
        </View>
      </View>
    );
  }

  const hasCustomer = !!order.customer;
  const buyer = hasCustomer ? order.customer : null;
  const su: any = sales ?? {};
  const groups = groupOrderItems(order.items);

  const baseSubtotal = (order.items || []).reduce(
    (s: number, i: any) => s + num(i?.unitPrice) * num(i?.quantity),
    0
  );
  const promoTotal = (order.items || []).reduce(
    (s: number, i: any) => s + num(i?.discount),
    0
  );
  const voucherDiscount = Math.abs(num(order.discount));

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <FocusAwareStatusBar barStyle={"dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={6}
        >
          <ArrowLeft size={20} color={blackColor} />
        </Pressable>
        <Text style={[blackTextStyle, styles.headerTitle]}>{docLabel}</Text>
        <Pressable
          onPress={handleShare}
          style={[styles.iconBtn, { backgroundColor: pinkSecondaryColor }]}
          hitSlop={6}
        >
          <Share2 size={18} color={primaryColor} />
        </Pressable>
        <Gap width={SPACE_8} />
        <Pressable
          onPress={handleDownload}
          style={[styles.iconBtn, { backgroundColor: pinkSecondaryColor }]}
          hitSlop={6}
        >
          <Download size={18} color={primaryColor} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: whiteThirdColor }}
        contentContainerStyle={{ padding: 12, paddingBottom: 110 }}
      >
        <View style={[styles.card, shadow]}>
          {/* Gradient band */}
          <LinearGradient
            colors={["#1A0000", "#350000", "#C11717"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.band}
          >
            <View style={{ flex: 1 }}>
              <View style={[styles.row, { alignItems: "center" }]}>
                <Text style={styles.bandLabel}>{docLabel}</Text>
                <Gap width={6} />
                <View style={styles.bandBadge}>
                  <Text style={styles.bandBadgeTxt}>
                    {hasCustomer ? "CUSTOMER" : "SALES"}
                  </Text>
                </View>
              </View>
              <Text style={styles.bandNo}>{order.orderNumber}</Text>
            </View>
            <View style={styles.logoBox}>
              <Image
                source={LOGO_MODULE}
                style={{ height: 28, width: 60, resizeMode: "contain" }}
              />
            </View>
          </LinearGradient>

          <View style={{ padding: SPACE_16 }}>
            {/* Issue date + status */}
            <View
              style={[styles.row, styles.between, { marginBottom: SPACE_16 }]}
            >
              <View>
                <Text style={[greyTextStyle, { fontSize: 11 }]}>
                  Tanggal Issue
                </Text>
                <Gap height={2} />
                <Text
                  style={[
                    blackTextStyle,
                    { fontSize: 13, fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {formatDate(order.createdAt)}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillTxt}>{order.status}</Text>
              </View>
            </View>

            {/* Blocks */}
            <View style={[styles.row, { gap: 12, marginBottom: SPACE_16 }]}>
              <View style={styles.block}>
                <Text style={styles.blockTitle}>
                  {hasCustomer ? "ISSUED TO" : "SALES (ISSUER)"}
                </Text>
                {hasCustomer ? (
                  <>
                    <Text style={styles.blockStrong}>
                      {buyer.customerName || "—"}
                    </Text>
                    {buyer.customerCode ? (
                      <Text style={styles.blockMuted}>
                        Kode: {buyer.customerCode}
                      </Text>
                    ) : null}
                    {buyer.phone ? (
                      <Text style={styles.blockMuted}>{buyer.phone}</Text>
                    ) : null}
                    {buyer.email ? (
                      <Text style={styles.blockMuted}>{buyer.email}</Text>
                    ) : null}
                    {buyer.address ? (
                      <Text style={styles.blockMuted}>{buyer.address}</Text>
                    ) : null}
                  </>
                ) : (
                  <>
                    <View
                      style={[styles.row, { alignItems: "center", gap: 4 }]}
                    >
                      <Briefcase size={13} color={primaryColor} />
                      <Text style={styles.blockStrong}>
                        {su.fullName || su.username || "—"}
                      </Text>
                    </View>
                    {su.username ? (
                      <Text style={styles.blockMuted}>@{su.username}</Text>
                    ) : null}
                    {su.phone ? (
                      <Text style={styles.blockMuted}>{su.phone}</Text>
                    ) : null}
                    {su.email ? (
                      <Text style={styles.blockMuted}>{su.email}</Text>
                    ) : null}
                    <Text style={styles.salesTag}>SALES-PLACED ORDER</Text>
                  </>
                )}
              </View>

              <View style={styles.block}>
                <Text style={styles.blockTitle}>CABANG</Text>
                <Text style={styles.blockStrong}>
                  {hasCustomer ? buyer.branch || "—" : su.branchName || "—"}
                </Text>
                <Text style={styles.blockMuted}>
                  {hasCustomer ? buyer.regional || "" : su.regionalName || ""}
                </Text>
                {order.deliveryMethod ? (
                  <Text style={styles.blockMuted}>
                    Pengiriman: {order.deliveryMethod}
                  </Text>
                ) : null}
                {order.paymentMethod ? (
                  <Text style={styles.blockMuted}>
                    Pembayaran: {order.paymentMethod}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Items table */}
            <View style={styles.table}>
              <View style={styles.thead}>
                <Text style={[styles.theadTxt, { flex: 1 }]}>PRODUK</Text>
                <Text style={[styles.theadTxt, styles.colQty]}>QTY</Text>
                <Text style={[styles.theadTxt, styles.colSub]}>SUBTOTAL</Text>
              </View>

              {groups.map((g: any) => {
                if (!g.isGrouped) {
                  const it = g.rows[0];
                  const serials = Array.isArray(it.serials) ? it.serials : [];
                  const sub =
                    it.subtotal ??
                    num(it.unitPrice) * num(it.quantity) - num(it.discount);
                  return (
                    <View key={g.key} style={styles.irow}>
                      <View style={[styles.row, styles.between]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pname}>{it.productName}</Text>
                          {it.productCode ? (
                            <Text style={styles.code}>{it.productCode}</Text>
                          ) : null}
                          <Text style={[greyTextStyle, { fontSize: 10 }]}>
                            @ {currencyFormat(it.unitPrice)}
                          </Text>
                        </View>
                        <Text style={[styles.cell, styles.colQty]}>
                          {it.quantity}
                        </Text>
                        <Text
                          style={[styles.cell, styles.colSub, styles.subStrong]}
                        >
                          {currencyFormat(sub)}
                        </Text>
                      </View>
                      {serials.length > 0 ? (
                        <View style={styles.snWrap}>
                          {serials.map((sn: string, i: number) => (
                            <View
                              key={`${it.id}-${i}`}
                              style={[
                                styles.row,
                                { alignItems: "center", gap: 6 },
                              ]}
                            >
                              <Hash size={11} color={primaryColor} />
                              <Text style={styles.snTxt}>{sn}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                }
                return (
                  <View key={g.key} style={styles.irow}>
                    <View style={[styles.row, styles.between]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pname}>{g.productName}</Text>
                        <View
                          style={[
                            styles.row,
                            { alignItems: "center", gap: 6, marginTop: 2 },
                          ]}
                        >
                          <View style={styles.nomorPill}>
                            <Text style={styles.nomorPillTxt}>
                              {g.rows.length} nomor
                            </Text>
                          </View>
                          <Text style={[greyTextStyle, { fontSize: 10 }]}>
                            @ {currencyFormat(g.unitPrice)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.cell, styles.colQty]}>
                        {g.totalQuantity}
                      </Text>
                      <Text
                        style={[styles.cell, styles.colSub, styles.subStrong]}
                      >
                        {currencyFormat(g.totalSubtotal)}
                      </Text>
                    </View>
                    <View style={styles.snWrap}>
                      {g.rows.map((r: any, i: number) => {
                        const rs =
                          r.subtotal ??
                          num(r.unitPrice) * num(r.quantity) - num(r.discount);
                        return (
                          <View
                            key={r.id ?? `${g.key}-${i}`}
                            style={[styles.row, styles.between]}
                          >
                            <View
                              style={[
                                styles.row,
                                { alignItems: "center", gap: 6, flex: 1 },
                              ]}
                            >
                              <Hash size={11} color={primaryColor} />
                              <Text style={styles.snTxt} numberOfLines={1}>
                                {r.productCode || "—"}
                              </Text>
                            </View>
                            <Text style={[greyTextStyle, { fontSize: 11 }]}>
                              {currencyFormat(rs)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Totals */}
            <View style={{ marginTop: SPACE_16 }}>
              <MoneyRow label="Subtotal Barang" value={baseSubtotal} />
              {promoTotal > 0 ? (
                <MoneyRow
                  label="Diskon Promo Produk"
                  value={-Math.abs(promoTotal)}
                />
              ) : null}
              {voucherDiscount > 0 ? (
                <MoneyRow label="Diskon Voucher" value={-voucherDiscount} />
              ) : null}
              <MoneyRow
                label="Biaya Pengiriman"
                value={num(order.deliveryFee)}
              />
              <MoneyRow label="Biaya Admin" value={num(order.adminFee)} />
              <View style={styles.totalRow}>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiBold, fontSize: 15 },
                  ]}
                >
                  TOTAL PEMBAYARAN
                </Text>
                <Text
                  style={{
                    color: primaryColor,
                    fontFamily: FontFamily.satoshiBold,
                    fontSize: 15,
                  }}
                >
                  {currencyFormat(order.total)}
                </Text>
              </View>
            </View>

            {/* Notes */}
            {order.notes ? (
              <View style={styles.notes}>
                <Text style={styles.blockTitle}>CATATAN</Text>
                <Text style={[blackTextStyle, { fontSize: 12 }]}>
                  {order.notes}
                </Text>
              </View>
            ) : null}

            {/* Footer note */}
            <View style={styles.footNote}>
              <Text
                style={[greyTextStyle, { fontSize: 11, textAlign: "center" }]}
              >
                {isFinalInvoice
                  ? "Dokumen ini adalah invoice resmi setelah pesanan disetujui Admin SO. Terima kasih."
                  : "Dokumen ini adalah proforma invoice dan bukan bukti pembayaran resmi. Terima kasih."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[shadow, styles.footer]}>
        <Pressable
          onPress={handleShare}
          disabled={exporting}
          style={styles.shareBtn}
        >
          <Share2 size={16} color={primaryColor} />
          <Gap width={8} />
          <Text
            style={{
              color: primaryColor,
              fontFamily: FontFamily.satoshiMedium,
              fontSize: 16,
            }}
          >
            Bagikan
          </Text>
        </Pressable>
        <Gap width={12} />
        <View style={{ flex: 1 }}>
          <GradientButton
            title="Download"
            radius={12}
            loading={exporting}
            icon={() => <Download size={16} color={whiteColor} />}
            onPress={handleDownload}
          />
        </View>
      </View>
    </View>
  );
};

const MoneyRow = ({ label, value }: { label: string; value: number }) => {
  const neg = value < 0;
  return (
    <View style={[styles.row, styles.between, { paddingVertical: 3 }]}>
      <Text style={[greyTextStyle, { fontSize: 12 }]}>{label}</Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: FontFamily.satoshiMedium,
          color: neg ? greenColor : blackColor,
        }}
      >
        {neg ? "- " : ""}
        {currencyFormat(Math.abs(value || 0))}
      </Text>
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row" },
  between: { justifyContent: "space-between", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACE_16,
    paddingVertical: 12,
    backgroundColor: whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: whiteThirdColor,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FontFamily.satoshiBold,
    fontSize: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    overflow: "hidden",
  },
  band: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bandLabel: {
    color: whiteColor,
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.85,
    textTransform: "uppercase",
  },
  bandBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bandBadgeTxt: {
    color: whiteColor,
    fontSize: 9,
    fontFamily: FontFamily.satoshiBold,
  },
  bandNo: {
    color: whiteColor,
    fontSize: 16,
    fontFamily: FontFamily.satoshiBold,
    marginTop: 2,
  },
  logoBox: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 6,
    marginLeft: 12,
  },
  statusPill: {
    backgroundColor: orangeRGBAColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillTxt: {
    color: orangeColor,
    fontSize: 11,
    fontFamily: FontFamily.satoshiMedium,
  },
  block: {
    flex: 1,
    backgroundColor: whiteThirdColor,
    borderWidth: 1,
    borderColor: whiteThirdColor,
    borderRadius: 10,
    padding: 10,
  },
  blockTitle: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#606060",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  blockStrong: {
    color: blackColor,
    fontSize: 12,
    fontFamily: FontFamily.satoshiBold,
  },
  blockMuted: { color: "#606060", fontSize: 11, marginTop: 1 },
  salesTag: {
    color: primaryColor,
    fontSize: 10,
    fontFamily: FontFamily.satoshiBold,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  table: {
    borderWidth: 1,
    borderColor: whiteThirdColor,
    borderRadius: 12,
    overflow: "hidden",
  },
  thead: {
    backgroundColor: pinkSecondaryColor,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  theadTxt: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: blackColor,
    fontFamily: FontFamily.satoshiBold,
  },
  colQty: { width: 40, textAlign: "center" },
  colSub: { width: 90, textAlign: "right" },
  irow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: whiteThirdColor,
  },
  pname: {
    color: blackColor,
    fontSize: 12,
    fontFamily: FontFamily.satoshiMedium,
  },
  code: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 10,
    color: "#606060",
    marginTop: 2,
  },
  cell: { fontSize: 12, color: blackColor },
  subStrong: { fontFamily: FontFamily.satoshiBold },
  snWrap: {
    marginTop: 6,
    marginLeft: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: redRGBAColor,
    gap: 3,
  },
  snTxt: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11,
    color: blackColor,
    flexShrink: 1,
  },
  nomorPill: {
    backgroundColor: pinkSecondaryColor,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nomorPillTxt: {
    color: primaryColor,
    fontSize: 10,
    fontFamily: FontFamily.satoshiBold,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: lineColor,
    borderStyle: "dashed",
    paddingTop: 8,
    marginTop: 8,
  },
  notes: {
    marginTop: SPACE_16,
    backgroundColor: whiteThirdColor,
    borderWidth: 1,
    borderColor: whiteThirdColor,
    borderRadius: 10,
    padding: 12,
  },
  footNote: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lineColor,
    borderStyle: "dashed",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 12,
    paddingVertical: 12,
  },
});
