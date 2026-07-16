import {
  Accordion,
  AnimatedPressable,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  borderInputColor,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  mainContent,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Headset,
  HelpCircle,
  Lock,
  MessageCircle,
  PackageCheck,
  PackageSearch,
  RotateCcw,
  ScanQrCode,
  Search,
  ShoppingCart,
  Users,
  WifiOff,
  X,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const FaqData = [
  {
    id: 1,
    icon: ShoppingCart,
    question: "Bagaimana cara membuat pesanan untuk customer?",
    answer:
      "Pilih produk dari menu Katalog atau keranjang, tentukan customer/outlet beserta alamat pengiriman, lalu periksa Rincian Order dan pilih metode pembayaran. Pesanan akan melewati tahap persetujuan sebelum diproses.",
  },
  {
    id: 2,
    icon: PackageSearch,
    question: "Bagaimana cara minta barang ke gudang?",
    answer:
      "Gunakan menu Minta Barang di Beranda: telusuri stok per kategori, tentukan jumlah yang dibutuhkan, lalu ajukan permintaan ke gudang.",
  },
  {
    id: 3,
    icon: ClipboardCheck,
    question: "Bagaimana proses approval pesanan customer?",
    answer:
      "Pesanan customer melewati beberapa tahap persetujuan yang bisa dipantau di tab Approval. Buka detailnya untuk melihat timeline, menyetujui, atau menolak dengan alasan. Selama status masih Menunggu Konfirmasi, item pesanan dapat dihapus dan stoknya dikembalikan.",
  },
  {
    id: 4,
    icon: PackageCheck,
    question: "Apa yang harus dilakukan saat pesanan berstatus Dikirim?",
    answer:
      "Buka Detail Transaksi lalu tekan Selesaikan Pesanan. Item beserta serial number-nya akan masuk ke Stock Anda dan bisa langsung dijual melalui menu Scan.",
  },
  {
    id: 5,
    icon: ScanQrCode,
    question: "Bagaimana cara menjual stok lewat menu Scan?",
    answer:
      "Tekan tombol Scan di tengah tab bar, lalu arahkan kamera ke barcode/QR produk. Sistem akan memeriksa stok Anda dan mencatat penjualan. Riwayat penjualan dapat dilihat di menu terkait.",
  },
  {
    id: 6,
    icon: PackageSearch,
    question: "Bagaimana cara mengecek status pesanan saya?",
    answer:
      "Buka menu Transaksi untuk semua pesanan beserta status terkininya, atau menu Laporan untuk pesanan yang sudah selesai/ditolak. Di Detail Transaksi tersedia Riwayat Pesanan dengan timeline lengkap tiap tahapan.",
  },
  {
    id: 7,
    icon: FileText,
    question: "Bagaimana cara melihat atau membagikan invoice?",
    answer:
      "Buka Detail Transaksi lalu pilih Lihat Invoice. Sebelum pesanan disetujui Admin SO dokumen berupa Proforma Invoice, setelahnya menjadi invoice resmi. Invoice dapat diunduh sebagai PDF atau dibagikan langsung.",
  },
  {
    id: 8,
    icon: Lock,
    question: "Kenapa kode voucher/serial number tidak terlihat?",
    answer:
      "Untuk keamanan, kode voucher dan serial number disembunyikan sampai pesanan berstatus Selesai. Setelah selesai, kode akan tampil di Detail Transaksi.",
  },
  {
    id: 9,
    icon: RotateCcw,
    question: "Bagaimana cara melakukan pengembalian barang?",
    answer:
      "Gunakan menu Pengembalian di Beranda untuk mengajukan retur. Riwayat pengembalian dapat dipantau di halaman yang sama.",
  },
  {
    id: 10,
    icon: Users,
    question: "Bagaimana cara mendaftarkan customer baru?",
    answer:
      "Buka menu Customer lalu tambah customer baru. Sistem akan memeriksa kode dan nomor telepon agar tidak duplikat. Pendaftaran menunggu persetujuan — statusnya bisa dipantau di daftar registrasi pending.",
  },
  {
    id: 11,
    icon: MessageCircle,
    question: "Bagaimana cara bertanya tentang pesanan tertentu?",
    answer:
      "Buka Detail Transaksi lalu pilih Chat Pesanan untuk mengirim pesan atau menanyakan status pesanan tersebut langsung ke admin.",
  },
  {
    id: 12,
    icon: Bell,
    question: "Kenapa saya tidak menerima notifikasi?",
    answer:
      "Pastikan izin notifikasi diberikan saat diminta aplikasi dan tidak dimatikan di pengaturan HP. Jenis notifikasi yang diterima dapat diatur melalui Preferensi Notifikasi di menu Profil.",
  },
  {
    id: 13,
    icon: WifiOff,
    question: "Apakah aplikasi bisa digunakan saat offline?",
    answer:
      "Katalog produk dan keranjang tersimpan secara lokal sehingga tetap bisa dibuka saat offline. Perubahan keranjang akan disinkronkan otomatis begitu koneksi kembali tersedia.",
  },
  {
    id: 14,
    icon: BookOpen,
    question: "Di mana saya bisa membaca panduan penggunaan aplikasi?",
    answer:
      "Buka menu Profil lalu pilih Buku Manual. Panduan tampil sebagai PDF di dalam aplikasi dan dapat diunduh atau dibagikan.",
  },
  {
    id: 15,
    icon: Headset,
    question: "Siapa yang bisa saya hubungi jika mengalami kendala?",
    answer:
      "Gunakan Chat Pesanan pada transaksi terkait, atau hubungi admin area Anda untuk bantuan lebih lanjut.",
  },
];

const Faq = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const toggleItem = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FaqData;
    return FaqData.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      {/* HEADER */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          FAQ
        </Text>
      </View>
      <View style={[mainContent]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO */}
          <LinearGradient
            colors={[darkPrimaryColor, primaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <HelpCircle size={26} color={whiteColor} />
            </View>
            <Gap height={12} />
            <Text style={[whiteTextStyle, styles.heroTitle]}>
              Ada yang bisa kami bantu?
            </Text>
            <Gap height={4} />
            <Text style={[whiteTextStyle, styles.heroSubtitle]}>
              Temukan jawaban dari pertanyaan yang sering diajukan
            </Text>
          </LinearGradient>

          {/* SEARCH */}
          <View style={styles.searchBar}>
            <Search size={18} color={greyColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari pertanyaan..."
              placeholderTextColor={greyColor}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Hapus pencarian"
              >
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
                title={item.question}
                isOpen={openId === item.id}
                onToggle={() => toggleItem(item.id)}
              >
                <Text style={[greyTextStyle, styles.answer]}>
                  {item.answer}
                </Text>
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
                Coba kata kunci lain atau hubungi tim support
              </Text>
            </View>
          )}

          {/* SUPPORT CTA */}
          {/* <Gap height={8} />
          <View style={styles.cta}>
            <View style={styles.ctaIcon}>
              <Headset size={22} color={primaryColor} />
            </View>
            <Gap height={12} />
            <Text style={[blackTextStyle, styles.ctaTitle]}>
              Masih butuh bantuan?
            </Text>
            <Text style={[greyTextStyle, styles.ctaText]}>
              Tim support kami siap membantu Anda
            </Text>
            <Gap height={16} />
            <Button
              title="Hubungi Support"
              onPress={() => router.push("/notifikasi")}
            />
          </View> */}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default Faq;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
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
  answer: {
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
  cta: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderInputColor,
    padding: 20,
    alignItems: "center",
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 16,
  },
  ctaText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
});
