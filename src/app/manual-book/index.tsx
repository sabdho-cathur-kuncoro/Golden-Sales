import { Accordion, Gap, Header } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  borderInputColor,
  darkBlueColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  mainContent,
  primaryColor,
  screen,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookOpenText,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  Package,
  Search,
  ShoppingCart,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ManualData = [
  {
    id: 1,
    icon: Package,
    title: "Cara Meminta Barang ke Gudang",
    steps: [
      "Buka menu Minta Barang.",
      "Pilih kategori barang yang dibutuhkan.",
      "Pilih barang dan tentukan jumlah yang diminta.",
      "Lengkapi rincian permintaan lalu kirim ke gudang.",
    ],
  },
  {
    id: 2,
    icon: ShoppingCart,
    title: "Cara Membuat Pesanan untuk Pelanggan (Canvassing)",
    steps: [
      "Buka menu Order, lalu pilih outlet/pelanggan dan alamat pengiriman.",
      "Pilih produk yang ingin dipesan beserta jumlahnya.",
      "Periksa rincian pesanan pada halaman Rincian.",
      "Pilih metode pembayaran lalu lanjutkan ke halaman pembayaran.",
      "Selesaikan pesanan hingga muncul status berhasil dibuat.",
    ],
  },
  {
    id: 3,
    icon: FileText,
    title: "Cara Melihat Laporan Pesanan",
    steps: [
      "Buka menu Transaksi untuk melihat seluruh riwayat pesanan apapun statusnya.",
      "Buka menu Laporan untuk melihat khusus pesanan yang sudah selesai atau ditolak.",
      "Ketuk salah satu pesanan untuk melihat detail lengkapnya.",
    ],
  },
  {
    id: 4,
    icon: LayoutGrid,
    title: "Cara Melihat Katalog Produk",
    steps: [
      "Buka menu Katalog dari beranda.",
      "Telusuri daftar produk yang tersedia.",
      "Ketuk salah satu produk untuk melihat detail dan informasinya.",
    ],
  },
  {
    id: 5,
    icon: ClipboardCheck,
    title: "Cara Melakukan Approval Pesanan Pelanggan",
    steps: [
      "Buka menu Approval untuk melihat daftar pesanan yang menunggu persetujuan.",
      "Ketuk salah satu pesanan untuk membuka halaman detail approval.",
      "Periksa setiap tahapan pada alur persetujuan.",
      "Setujui pesanan, atau tolak dengan menyertakan alasan penolakan.",
    ],
  },
];

const ManualBook = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const toggleItem = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ManualData;
    return ManualData.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.steps.some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <View style={[screen, { backgroundColor: bgColor }]}>
      <Header title={"Buku Manual"} onBack={() => router.back()} />
      <View style={[mainContent]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO */}
          <LinearGradient
            colors={[primaryColor, darkBlueColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <BookOpenText size={26} color={whiteColor} />
            </View>
            <Gap height={12} />
            <Text style={[whiteTextStyle, styles.heroTitle]}>
              Panduan Penggunaan
            </Text>
            <Gap height={4} />
            <Text style={[whiteTextStyle, styles.heroSubtitle]}>
              Pelajari langkah demi langkah cara menggunakan aplikasi
            </Text>
          </LinearGradient>

          {/* SEARCH */}
          <View style={styles.searchBar}>
            <Search size={18} color={greyColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari panduan..."
              placeholderTextColor={greyColor}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={18} color={greyColor} />
              </Pressable>
            ) : null}
          </View>

          <Gap height={16} />

          {/* LIST */}
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Accordion
                key={item.id}
                icon={item.icon}
                title={item.title}
                isOpen={openId === item.id}
                onToggle={() => toggleItem(item.id)}
              >
                {item.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNumber}>{i + 1}</Text>
                    </View>
                    <Text style={[greyTextStyle, styles.stepText]}>{step}</Text>
                  </View>
                ))}
              </Accordion>
            ))
          ) : (
            <View style={styles.empty}>
              <Search size={32} color={greyColor} />
              <Gap height={12} />
              <Text style={[blackTextStyle, styles.emptyTitle]}>
                Tidak ditemukan
              </Text>
              <Text style={[greyTextStyle, styles.emptyText]}>
                Coba kata kunci lain untuk menemukan panduan
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default ManualBook;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  hero: {
    borderRadius: 16,
    padding: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 20,
  },
  heroSubtitle: {
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 18,
  },
  searchBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderInputColor,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontFamily: FontFamily.satoshiRegular,
    fontSize: 14,
    color: blackTextStyle.color,
    padding: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  stepNumber: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 12,
    color: whiteColor,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 15,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
