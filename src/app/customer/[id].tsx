import { Gap } from "@/components/ui";
import {
  bgColor,
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
  primaryTextStyle,
  redColor,
  screen,
  SPACE_16,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCustomerDetail from "@/hooks/useCustomerDetail";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
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
        style={{
          fontSize: 11,
          fontFamily: FontFamily.satoshiMedium,
          color: isActive ? "#15803D" : greyColor,
        }}
      >
        {isActive ? "Aktif" : "Nonaktif"}
      </Text>
    </View>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={{ marginTop: 2 }}>{icon}</View>
    <Gap width={10} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[blackTextStyle]}>{value}</Text>
    </View>
  </View>
);

const CustomerDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, submitting, error, submitStatusRequest } =
    useCustomerDetail(id);

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");

  if (loading) {
    return (
      <View style={[screen, styles.center, { backgroundColor: whiteColor }]}>
        <ActivityIndicator color={primaryColor} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[screen, styles.center, { backgroundColor: whiteColor }]}>
        <Text style={[greyTextStyle, { color: redColor, textAlign: "center" }]}>
          {error || "Customer tidak ditemukan"}
        </Text>
      </View>
    );
  }

  const pending = data.pending;
  const isActive = data.status === "Active";
  const targetStatus = isActive ? "Inactive" : "Active";
  const address = [data.address1, data.city, data.regency]
    .filter(Boolean)
    .join(", ");

  const onSubmit = async () => {
    const ok = await submitStatusRequest(targetStatus, reason);
    if (ok) {
      setShowForm(false);
      setReason("");
    }
  };

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <StatusBar barStyle={"light-content"} />
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
          Detail Customer
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* AVATAR + NAME */}
        <View style={styles.profileRow}>
          <View style={styles.bigAvatar}>
            <UserIcon size={28} color={primaryColor} />
          </View>
          <Gap width={12} />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                blackTextStyle,
                { fontSize: 18, fontFamily: FontFamily.satoshiBold },
              ]}
              numberOfLines={1}
            >
              {data.customerName ?? "-"}
            </Text>
            {data.customerCode ? (
              <Text style={[greyTextStyle]}>{data.customerCode ?? "-"}</Text>
            ) : null}
          </View>
          <Gap width={8} />
          <StatusPill status={data.status} />
        </View>

        {/* INFO CARD */}
        <View style={styles.card}>
          {data.contactPerson ? (
            <InfoRow
              icon={<IdCard size={22} color={primaryColor} />}
              label="Contact"
              value={data.contactPerson}
            />
          ) : null}
          {data.phone ? (
            <InfoRow
              icon={<Phone size={22} color={primaryColor} />}
              label="HP"
              value={data.phone}
            />
          ) : null}
          {data.email ? (
            <InfoRow
              icon={<Mail size={22} color={primaryColor} />}
              label="Email"
              value={data.email}
            />
          ) : null}
          {address ? (
            <InfoRow
              icon={<MapPin size={22} color={primaryColor} />}
              label="Alamat"
              value={address}
            />
          ) : null}
        </View>

        {/* PENDING NOTICE */}
        {pending ? (
          <View style={styles.pendingCard}>
            <Clock size={20} color={orangeColor} />
            <Gap width={10} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: FontFamily.satoshiBold,
                  color: orangeColor,
                }}
              >
                Menunggu approval admin
              </Text>
              <Text style={{ fontSize: 12, color: orangeColor, marginTop: 2 }}>
                Ubah ke{" "}
                <Text style={{ fontFamily: FontFamily.satoshiBold }}>
                  {pending?.newStatus === "Active" ? "Aktif" : "Nonaktif"}
                </Text>
              </Text>
              {pending?.reason ? (
                <Text
                  style={{ fontSize: 11, color: orangeColor, marginTop: 2 }}
                >
                  &quot;{pending?.reason}&quot;
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ACTION AREA */}
        {!showForm ? (
          <Pressable
            disabled={!!pending}
            onPress={() => setShowForm(true)}
            style={[
              styles.actionBtn,
              pending
                ? { backgroundColor: greyTertiaryColor }
                : isActive
                ? {
                    backgroundColor: whiteColor,
                    borderWidth: 1,
                    borderColor: primaryColor,
                  }
                : { backgroundColor: primaryColor },
            ]}
          >
            {isActive ? (
              <AlertTriangle
                size={16}
                color={pending ? greyColor : primaryColor}
              />
            ) : (
              <CheckCircle size={16} color={pending ? greyColor : whiteColor} />
            )}
            <Gap width={8} />
            <Text
              style={[
                {
                  fontSize: 14,
                  fontFamily: FontFamily.satoshiBold,
                },
                pending
                  ? { color: greyColor }
                  : isActive
                  ? primaryTextStyle
                  : whiteTextStyle,
              ]}
            >
              {isActive
                ? "Request Nonaktifkan Customer"
                : "Request Aktifkan Customer"}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.card}>
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
            >
              Alasan ubah status ke{" "}
              <Text style={{ fontFamily: FontFamily.satoshiBold }}>
                {targetStatus === "Active" ? "Aktif" : "Nonaktif"}
              </Text>
            </Text>
            <Gap height={SPACE_8} />
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              placeholder="Tulis alasan singkat untuk admin..."
              placeholderTextColor={greyColor}
              underlineColorAndroid="transparent"
              style={styles.textarea}
            />
            <Gap height={SPACE_8} />
            <View style={{ flexDirection: "row" }}>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setReason("");
                }}
                style={[
                  styles.formBtn,
                  {
                    backgroundColor: whiteColor,
                    borderWidth: 1,
                    borderColor: strokeColor,
                  },
                ]}
              >
                <Text
                  style={[
                    greyTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  Batal
                </Text>
              </Pressable>
              <Gap width={SPACE_8} />
              <Pressable
                disabled={submitting || !reason.trim()}
                onPress={onSubmit}
                style={[
                  styles.formBtn,
                  {
                    backgroundColor:
                      submitting || !reason.trim()
                        ? greyTertiaryColor
                        : primaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    whiteTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  {submitting ? "Mengirim..." : "Kirim Request"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default CustomerDetail;

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
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
  content: {
    padding: SPACE_16,
    paddingBottom: 120,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACE_16,
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: strokeColor,
    padding: SPACE_16,
  },
  bigAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: strokeColor,
    padding: SPACE_16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoLabel: {
    fontFamily: FontFamily.satoshiBold,
    color: greyColor,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pendingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: orangeRGBAColor,
    borderWidth: 1,
    borderColor: orangeStrokeColor,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: strokeColor,
    borderRadius: 12,
    padding: 12,
    fontFamily: FontFamily.satoshiRegular,
    color: "#202020",
  },
  formBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
});
