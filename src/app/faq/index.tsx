import { Accordion, Button, Gap, Header } from "@/components/ui";
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
  ClipboardCheck,
  Headset,
  HelpCircle,
  PackageSearch,
  Search,
  ShoppingCart,
  Wallet,
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

const FaqData = [
  {
    id: 1,
    icon: ShoppingCart,
    question: "Bagaimana cara melakukan pemesanan produk?",
    answer:
      "Pilih produk pada menu Katalog, tambahkan ke keranjang, lalu lanjutkan ke halaman konfirmasi order untuk menyelesaikan pemesanan.",
  },
  {
    id: 2,
    icon: Wallet,
    question: "Bagaimana cara melakukan pembayaran?",
    answer:
      "Pada halaman pembayaran, pilih metode pembayaran yang tersedia lalu ikuti instruksi yang ditampilkan hingga status order berubah menjadi terbayar.",
  },
  {
    id: 3,
    icon: PackageSearch,
    question: "Bagaimana cara mengecek status pesanan saya?",
    answer:
      "Buka menu Transaksi untuk melihat daftar pesanan beserta status terkininya, atau buka halaman Status Order untuk detail tahapan prosesnya.",
  },
  {
    id: 4,
    icon: ClipboardCheck,
    question: "Bagaimana proses approval pengajuan?",
    answer:
      "Pengajuan akan melalui beberapa tahap persetujuan. Anda dapat memantau progres tiap tahap pada menu Approval beserta detail alasannya.",
  },
  {
    id: 5,
    icon: Headset,
    question: "Siapa yang bisa saya hubungi jika mengalami kendala?",
    answer:
      "Hubungi tim support melalui menu Notifikasi bagian Chat, atau hubungi admin area Anda untuk bantuan lebih lanjut.",
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
    <View style={[screen, { backgroundColor: bgColor }]}>
      <Header title={"FAQ"} onBack={() => router.back()} />
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
          <Gap height={8} />
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
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Faq;

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
