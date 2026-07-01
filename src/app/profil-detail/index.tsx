import { AnimatedPressable, Gap } from "@/components/ui";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  borderInputColor,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greyColor,
  greyTertiaryColor,
  greyTextStyle,
  line,
  paddingH,
  primaryColor,
  redColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_24,
  SPACE_4,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { onUpdateProfileService } from "@/services/auth.services";
import { useAuthStore } from "@/stores/auth.store";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";
import { TypeUser } from "@/type/user.type";
import { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  Command,
  IdCard,
  Mail,
  Map,
  MapPin,
  Pencil,
  Phone,
  User,
  Warehouse,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { getInitials } from "../../../utils/helper";

// Labeled input wired for use inside the gorhom bottom sheet.
const Field = ({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof BottomSheetTextInput>) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={formStyles.label}>{label}</Text>
    <Gap height={6} />
    <BottomSheetTextInput
      placeholderTextColor={greyColor}
      underlineColorAndroid="transparent"
      style={formStyles.input}
      {...rest}
    />
  </View>
);

type ContactFormProps = {
  initial: TypeUser | null;
  onDone: (
    result: { phone: string; email: string; userName: string } | null
  ) => void;
};

const ContactForm = ({ initial, onDone }: ContactFormProps) => {
  const toast = useToast();
  const [phone, setPhone] = useState(initial?.phone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [username, setUsername] = useState(initial?.userName || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    const p = phone.trim();
    const e = email.trim();
    const u = username.trim();

    const changed =
      p !== (initial?.phone || "") ||
      e !== (initial?.email || "") ||
      u !== (initial?.userName || "");
    if (!changed) {
      setErr("Tidak ada perubahan.");
      return;
    }
    if (p && !p.startsWith("0")) {
      setErr("No. HP harus diawali '0' (mis. 08xxxxxxx).");
      return;
    }
    if (p && !/^\d+$/.test(p)) {
      setErr("No. HP hanya boleh angka.");
      return;
    }
    if (e && !/^\S+@\S+\.\S+$/.test(e)) {
      setErr("Format email tidak valid.");
      return;
    }
    if (u && (u.length < 3 || u.length > 32)) {
      setErr("Username 3-32 karakter.");
      return;
    }
    if (u && /\s/.test(u)) {
      setErr("Username tidak boleh mengandung spasi.");
      return;
    }

    setLoading(true);
    try {
      const data = await onUpdateProfileService({
        phone: p,
        email: e,
        username: u,
      });
      const msg =
        data && typeof data.message === "string"
          ? data.message
          : "Profil diperbarui";
      toast.success("Berhasil", msg);
      onDone({ phone: p, email: e, userName: u });
    } catch (ex: any) {
      setErr(ex?.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetView style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
        Ubah Kontak
      </Text>
      <Gap height={SPACE_16} />
      <Field
        label="No. HP"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="08xxxxxxx"
        maxLength={15}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="nama@domain.com"
        maxLength={100}
      />
      <Field
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="username"
        maxLength={32}
      />

      {err ? (
        <Text style={[formStyles.msg, { color: redColor }]}>{err}</Text>
      ) : null}

      <View style={[rowCenter, { gap: 8, marginTop: 8 }]}>
        <View style={{ width: "48%" }}>
          <AnimatedPressable onPress={() => onDone(null)}>
            <View style={[formStyles.btn, formStyles.btnCancel]}>
              <Text
                style={[greyTextStyle, { fontFamily: FontFamily.satoshiBold }]}
              >
                Batal
              </Text>
            </View>
          </AnimatedPressable>
        </View>
        <View style={{ width: "48%" }}>
          <AnimatedPressable onPress={loading ? undefined : save}>
            <View
              style={[
                formStyles.btn,
                { backgroundColor: primaryColor, opacity: loading ? 0.6 : 1 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={whiteColor} />
              ) : (
                <Text
                  style={[
                    whiteTextStyle,
                    { fontFamily: FontFamily.satoshiBold },
                  ]}
                >
                  Simpan
                </Text>
              )}
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </BottomSheetView>
  );
};

const ProfilDetail = () => {
  const { user } = useAuthStore();
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);
  const { width, height } = useWindowDimensions();

  const openContactEdit = () => {
    openSheet(
      <ContactForm
        initial={user}
        onDone={(result) => {
          if (result) {
            const cur = useAuthStore.getState().user;
            useAuthStore.getState().setUser({
              ...(cur ?? {}),
              phone: result.phone || cur?.phone,
              email: result.email || cur?.email,
              userName: result.userName || cur?.userName,
            });
          }
          closeSheet();
        }}
      />,
      ["60%"],
      <></>
    );
  };
  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      {/* HEADER */}
      <View style={[rowCenter, paddingH]}>
        <AnimatedPressable onPress={() => router.back()}>
          <View style={{ width: "12%" }}>
            <ChevronLeft size={32} color={whiteColor} />
          </View>
        </AnimatedPressable>
        <View style={{ width: "87%" }}>
          <Text
            style={[
              whiteTextStyle,
              { fontSize: 16, fontFamily: FontFamily.satoshiBold },
            ]}
          >
            Profil Detail
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[{ width, minHeight: height * 0.31, paddingTop: 10 }]}>
          <View
            style={{
              width,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* IMAGE */}
            {user?.avatar ? (
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${user?.avatar}`,
                }}
                style={[styles.imgContainer]}
                contentFit={"cover"}
              />
            ) : (
              <View style={styles.imgContainer}>
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[
                      whiteTextStyle,
                      { fontSize: 48, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {getInitials(user?.fullName ?? "")}
                  </Text>
                </View>
                <View style={styles.btnVerifBadge}>
                  <BadgeCheck size={16} color={primaryColor} />
                </View>
              </View>
            )}
            <Gap height={SPACE_24} />
            <Text
              style={[
                whiteTextStyle,
                { fontSize: 32, fontFamily: FontFamily.satoshiBold },
              ]}
            >
              {user?.fullName ?? "-"}
            </Text>
            <Gap height={SPACE_4} />
            <Text style={[whiteTextStyle, { fontSize: 16, opacity: 0.8 }]}>
              {user?.role ?? "-"}
            </Text>
            <Gap height={SPACE_16} />
            <View style={styles.overlayStatus}>
              <View
                style={[styles.dotStatus, { backgroundColor: "#6FFBBE" }]}
              />
              <Gap width={10} />
              <Text style={[whiteTextStyle]}>ACTIVE</Text>
            </View>
          </View>
        </View>
        <View
          style={{ flexGrow: 1, backgroundColor: bgColor, paddingBottom: 120 }}
        >
          {/* <View style={[rowCenter, paddingH, { marginTop: -40 }]}>
          <View style={[shadow, styles.cardAchieve]}>
            <Text style={[greyTextStyle, { fontSize: 16 }]}>MTD REVENUE</Text>
            <Text style={[blackTextStyle, { fontSize: 16 }]}>
              {currencyFormat(250_000_000)}
            </Text>
            <Gap height={SPACE_8} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TrendingUp size={14} color={greenColor} />
              <Gap width={SPACE_4} />
              <Text style={[greenTextStyle, { fontSize: 16 }]}>+12%</Text>
            </View>
          </View>
          <View style={[shadow, styles.cardAchieve]}>
            <Text style={[greyTextStyle, { fontSize: 16 }]}>ACHIEVEMENT</Text>
            <Text style={[primaryTextStyle, { fontSize: 16 }]}>85%</Text>
            <Gap height={6} />
            <View style={styles.achievementBarContainer}>
              <View style={styles.achievementBarFill} />
            </View>
          </View>
        </View> */}
          <Gap height={SPACE_24} />
          <View style={[paddingH]}>
            {/* CONTACT */}
            <View style={[shadow, styles.cardContainer]}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <User size={16} color={blackColor} />
                <Gap width={10} />
                <Text style={[blackTextStyle, { fontSize: 16, flex: 1 }]}>
                  KONTAK DETAIL
                </Text>
                <AnimatedPressable onPress={openContactEdit}>
                  <View style={styles.editBtn}>
                    <Pencil size={14} color={primaryColor} />
                  </View>
                </AnimatedPressable>
              </View>
              <Gap height={10} />
              <View style={line} />
              <Gap height={10} />
              <View style={[rowCenter]}>
                <View style={{ width: "10%" }}>
                  <IdCard size={24} color={blackColor} />
                </View>
                <View style={{ width: "89%" }}>
                  <Text style={[blackTextStyle]}>USERNAME</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.userName ?? "-"}
                  </Text>
                </View>
              </View>
              <Gap height={SPACE_16} />
              <View style={[rowCenter]}>
                <View style={{ width: "10%" }}>
                  <Mail size={24} color={blackColor} />
                </View>
                <View style={{ width: "89%" }}>
                  <Text style={[blackTextStyle]}>EMAIL</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.email ?? "-"}
                  </Text>
                </View>
              </View>
              <Gap height={SPACE_16} />
              <View style={[rowCenter]}>
                <View style={{ width: "10%" }}>
                  <Phone size={24} color={blackColor} />
                </View>
                <View style={{ width: "89%" }}>
                  <Text style={[blackTextStyle]}>TELEPON</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.phone ?? "-"}
                  </Text>
                </View>
              </View>
            </View>
            <Gap height={SPACE_24} />
            {/* WAREHOUSE */}
            <View style={[shadow, styles.cardContainer]}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Warehouse size={16} color={blackColor} />
                <Gap width={10} />
                <Text style={[blackTextStyle, { fontSize: 16 }]}>
                  WAREHOUSE
                </Text>
              </View>
              <Gap height={10} />
              <View style={line} />
              <Gap height={10} />
              <Text
                style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}
              >
                {user?.warehouseName ?? "-"}
              </Text>
            </View>
            <Gap height={SPACE_24} />
            {/* REGION */}
            <View style={[shadow, styles.cardContainer]}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Command size={16} color={blackColor} />
                <Gap width={10} />
                <Text style={[blackTextStyle, { fontSize: 16 }]}>REGIONAL</Text>
              </View>
              <Gap height={10} />
              <View style={line} />
              <Gap height={10} />
              <View style={styles.regionContainer}>
                <View
                  style={{
                    width: "15%",
                  }}
                >
                  <View style={styles.iconContainer}>
                    <Map size={24} color={blackColor} />
                  </View>
                </View>
                <View style={{ width: "84%" }}>
                  <Text style={[greyTextStyle]}>REGIONAL</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.regionalName ?? "-"}
                  </Text>
                </View>
              </View>
              <Gap height={SPACE_16} />
              <View style={styles.regionContainer}>
                <View
                  style={{
                    width: "15%",
                  }}
                >
                  <View style={styles.iconContainer}>
                    <Building2 size={24} color={blackColor} />
                  </View>
                </View>
                <View style={{ width: "84%" }}>
                  <Text style={[greyTextStyle]}>BRANCH</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.branchName ?? "-"}
                  </Text>
                </View>
              </View>
              <Gap height={SPACE_16} />
              <View style={styles.regionContainer}>
                <View
                  style={{
                    width: "15%",
                  }}
                >
                  <View style={styles.iconContainer}>
                    <MapPin size={24} color={blackColor} />
                  </View>
                </View>
                <View style={{ width: "84%" }}>
                  <Text style={[greyTextStyle]}>ADDRESS</Text>
                  <Text
                    style={[
                      blackTextStyle,
                      { fontSize: 16, fontFamily: FontFamily.satoshiBold },
                    ]}
                  >
                    {user?.address ?? "-"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfilDetail;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    padding: SPACE_16,
    backgroundColor: whiteColor,
    borderRadius: 8,
  },
  cardAchieve: {
    width: "48%",
    height: 130,
    padding: SPACE_24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: whiteColor,
    borderRadius: 8,
  },
  achievementBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5EEFF",
    borderRadius: 12,
  },
  achievementBarFill: {
    width: "80%",
    height: 6,
    backgroundColor: "#4648D4",
    borderRadius: 12,
  },
  imgContainer: {
    width: 128,
    height: 128,
    borderRadius: 12,
    backgroundColor: greenColor,
  },
  imgContent: {
    width: 88,
    height: 88,
    backgroundColor: greyColor,
    borderRadius: 16,
  },
  btnVerifBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 4,
    backgroundColor: "#6FFBBE",
    borderColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayStatus: {
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  dotStatus: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  regionContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: strokeColor,
    backgroundColor: borderInputColor,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: greyTertiaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
});

const formStyles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: FontFamily.satoshiBold,
    color: "#202020",
  },
  input: {
    width: "100%",
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: strokeColor,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
    fontFamily: FontFamily.satoshiRegular,
    color: "#202020",
  },
  msg: {
    fontSize: 12,
    fontFamily: FontFamily.satoshiRegular,
    marginBottom: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: strokeColor,
    backgroundColor: whiteColor,
  },
});
