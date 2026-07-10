import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  orangeColor,
  orangeRGBAColor,
  orangeStrokeColor,
  primaryColor,
  redColor,
  redRGBAColor,
  redStrokeColor,
  screen,
  shadow,
  SPACE_16,
  SPACE_4,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCustomers from "@/hooks/useCustomers";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  IdCard,
  MapPin,
  Phone,
  Plus,
  Search,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Status pill — green when active, grey otherwise.
const StatusPill = ({ status }: { status?: string }) => {
  const isActive = status === "Active";
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: isActive ? "#F0FDF4" : greyTertiaryColor,
          borderColor: isActive ? "#BBF7D0" : strokeColor,
        },
      ]}
    >
      <Text
        style={[
          { fontSize: 10, fontFamily: FontFamily.satoshiMedium },
          { color: isActive ? "#15803D" : greyColor },
        ]}
      >
        {isActive ? "Aktif" : "Nonaktif"}
      </Text>
    </View>
  );
};

const Customer = () => {
  const {
    STATUS_OPTIONS,
    setSearch,
    status,
    setStatus,
    rows,
    pendingRegs,
    loading,
    refreshing,
    error,
    onRefresh,
  } = useCustomers();

  // Debounced search input → controller.
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const renderPending = ({ item: p }: any) => {
    const rejected = p.status === "Rejected";
    return (
      <View
        style={[
          styles.card,
          {
            borderColor: rejected ? redStrokeColor : orangeStrokeColor,
            flexDirection: "row",
            alignItems: "flex-start",
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: rejected ? redRGBAColor : orangeRGBAColor },
          ]}
        >
          {rejected ? (
            <AlertTriangle size={18} color={redColor} />
          ) : (
            <Clock size={18} color={orangeColor} />
          )}
        </View>
        <Gap width={12} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              blackTextStyle,
              { fontSize: 14, fontFamily: FontFamily.satoshiBold },
            ]}
            numberOfLines={1}
          >
            {p.customerName}
          </Text>
          {p.customerCode ? (
            <Text style={[greyTextStyle, { fontSize: 11 }]}>
              {p.customerCode}
            </Text>
          ) : null}
          {p.phone ? (
            <View style={styles.metaRow}>
              <Phone size={12} color={greyColor} />
              <Gap width={6} />
              <Text style={[greyTextStyle, { fontSize: 12 }]}>{p.phone}</Text>
            </View>
          ) : null}
          <Gap height={4} />
          <Text
            style={{
              fontSize: 11,
              fontFamily: FontFamily.satoshiMedium,
              color: rejected ? redColor : orangeColor,
            }}
          >
            {rejected ? "Ditolak admin" : "Menunggu approval"}
          </Text>
          {p.approvalNotes ? (
            <Text style={[greyTextStyle, { fontSize: 11 }]}>
              &quot;{p.approvalNotes}&quot;
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderCustomer = ({ item: c }: any) => (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/customer/[id]", params: { id: c.id } })
      }
      style={[styles.card, { flexDirection: "row", alignItems: "flex-start" }]}
    >
      <View style={[styles.avatar, { backgroundColor: bgColor }]}>
        <UserIcon size={18} color={primaryColor} />
      </View>
      <Gap width={12} />
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text
            style={[
              blackTextStyle,
              {
                fontSize: 14,
                fontFamily: FontFamily.satoshiBold,
                flexShrink: 1,
              },
            ]}
            numberOfLines={1}
          >
            {c.customerName}
          </Text>
          <Gap width={8} />
          <StatusPill status={c.status} />
          {c.hasPendingApproval ? (
            <>
              <Gap width={6} />
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: orangeRGBAColor,
                    borderColor: orangeStrokeColor,
                  },
                ]}
              >
                <Clock size={10} color={orangeColor} />
                <Gap width={3} />
                <Text style={{ fontSize: 10, color: orangeColor }}>
                  Pending
                </Text>
              </View>
            </>
          ) : null}
        </View>
        <Gap height={SPACE_4} />
        {c.customerCode ? (
          <View style={styles.metaRow}>
            <IdCard size={12} color={greyColor} />
            <Gap width={6} />
            <Text style={[greyTextStyle, { fontSize: 12 }]}>
              {c.customerCode}
            </Text>
          </View>
        ) : null}
        <Gap height={SPACE_4} />
        {c.phone ? (
          <View style={styles.metaRow}>
            <Phone size={12} color={greyColor} />
            <Gap width={6} />
            <Text style={[greyTextStyle, { fontSize: 12 }]}>{c.phone}</Text>
          </View>
        ) : null}
        <Gap height={SPACE_4} />
        {c.address1 || c.regency ? (
          <View style={[styles.metaRow, { alignItems: "flex-start" }]}>
            <MapPin size={12} color={greyColor} style={{ marginTop: 2 }} />
            <Gap width={6} />
            <Text
              style={[greyTextStyle, { fontSize: 12, flex: 1 }]}
              numberOfLines={3}
            >
              {c.address1 || c.regency}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.iconBtn}
        >
          <ChevronLeft size={22} color={whiteColor} />
        </Pressable>
        <Text
          style={[
            whiteTextStyle,
            {
              fontFamily: FontFamily.satoshiMedium,
            },
          ]}
        >
          Customer Saya
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: bgColor }}>
        {/* SEARCH + STATUS CHIPS */}
        <View style={styles.topContent}>
          <View style={styles.searchContainer}>
            <Search size={18} color={blackColor} />
            <Gap width={8} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari nama / HP / kode..."
              placeholderTextColor={greyColor}
              style={[blackTextStyle, { flex: 1 }]}
            />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: 48,
            alignItems: "center",
            paddingHorizontal: SPACE_16,
          }}
          style={{ flexGrow: 0, marginBottom: SPACE_8 }}
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = opt.value === status;
            return (
              <Pressable
                onPress={() => setStatus(opt.value)}
                key={opt.value || "all"}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? primaryColor : greyTertiaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    active ? whiteTextStyle : blackTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={loading ? [] : rows}
          keyExtractor={(item, i) => `${i}-${item.id}`}
          renderItem={renderCustomer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            pendingRegs.length > 0 ? (
              <View style={{ marginBottom: SPACE_16 }}>
                <Text style={styles.sectionTitle}>
                  Menunggu Approval Admin ({pendingRegs.length})
                </Text>
                {pendingRegs.map((p, i) => (
                  <View key={`${i}-${p.id}`}>{renderPending({ item: p })}</View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator color={primaryColor} />
              ) : error ? (
                <Text
                  style={[greyTextStyle, { fontSize: 13, color: redColor }]}
                >
                  {error}
                </Text>
              ) : (
                <Text
                  style={[greyTextStyle, { fontSize: 13, textAlign: "center" }]}
                >
                  Belum ada customer. Ketuk &quot;+&quot; di kanan atas untuk
                  tambah baru.
                </Text>
              )}
            </View>
          }
        />
        <AnimatedPressable
          onPress={() => router.push("/customer/new")}
          style={[shadow, styles.FAB]}
        >
          <Plus size={24} color={whiteColor} />
        </AnimatedPressable>
      </View>
    </LinearGradient>
  );
};

export default Customer;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACE_16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  topContent: {
    paddingTop: SPACE_16,
    paddingHorizontal: SPACE_16,
    marginBottom: SPACE_8,
  },
  searchContainer: {
    height: 40,
    backgroundColor: whiteColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 10,
  },
  listContent: {
    paddingHorizontal: SPACE_16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: strokeColor,
    padding: 12,
    marginBottom: SPACE_8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FontFamily.satoshiBold,
    color: primaryColor,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACE_8,
    paddingTop: SPACE_8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  FAB: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 56,
    right: 20,
    backgroundColor: primaryColor,
    borderWidth: 0,
  },
});
