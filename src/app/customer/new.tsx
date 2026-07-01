import { Gap } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greenColor,
  greyColor,
  greyTextStyle,
  primaryColor,
  redColor,
  redRGBAColor,
  redStrokeColor,
  screen,
  SPACE_16,
  SPACE_8,
  strokeColor,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCreateCustomer, {
  type AvailabilityStatus,
} from "@/hooks/useCreateCustomer";
import { useToast } from "@/hooks/useToast";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  UserPlus,
  X,
} from "lucide-react-native";
import React from "react";
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

// Border color reflects availability state (neutral / valid / taken).
const borderForStatus = (status: AvailabilityStatus) =>
  status === "taken"
    ? redColor
    : status === "available"
    ? greenColor
    : strokeColor;

const messageColor = (status: AvailabilityStatus) =>
  status === "taken"
    ? redColor
    : status === "available"
    ? greenColor
    : greyColor;

// Field label — trailing "*" (required marker) rendered in red.
const LabelText = ({ label }: { label: string }) => {
  const star = label.match(/\s*\*\s*$/);
  if (!star) return <Text style={styles.label}>{label}</Text>;
  return (
    <Text style={styles.label}>
      {label.slice(0, star.index)}
      <Text style={{ color: redColor }}> *</Text>
    </Text>
  );
};

// Plain labeled text input.
const Field = ({
  label,
  value,
  onChangeText,
  hint,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  hint?: string;
} & React.ComponentProps<typeof TextInput>) => (
  <View style={styles.fieldBlock}>
    <LabelText label={label} />
    <Gap height={6} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={greyColor}
      underlineColorAndroid="transparent"
      style={styles.input}
      {...rest}
    />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

// Labeled input with a right-side availability indicator + message.
const CheckField = ({
  label,
  value,
  onChangeText,
  status,
  message,
  hint,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  status: AvailabilityStatus;
  message?: string;
  hint?: string;
} & React.ComponentProps<typeof TextInput>) => (
  <View style={styles.fieldBlock}>
    <LabelText label={label} />
    <Gap height={6} />
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={greyColor}
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          { paddingRight: 40, borderColor: borderForStatus(status) },
        ]}
        {...rest}
      />
      <View style={styles.adornment}>
        {status === "checking" ? (
          <Text style={[greyTextStyle, { fontSize: 10 }]}>cek...</Text>
        ) : status === "available" ? (
          <Check size={16} color={greenColor} />
        ) : status === "taken" ? (
          <X size={16} color={redColor} />
        ) : null}
      </View>
    </View>
    {message ? (
      <Text style={[styles.hint, { color: messageColor(status) }]}>
        {message}
      </Text>
    ) : null}
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const CreateCustomer = () => {
  const toast = useToast();
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);

  const {
    form,
    setField,
    warehouses,
    whLoading,
    codeStatus,
    codeMessage,
    onCodeChange,
    phoneStatus,
    phoneMessage,
    onPhoneChange,
    submitting,
    error,
    submit,
    canSubmit,
  } = useCreateCustomer();

  const singleWarehouse = warehouses.length === 1;
  const multiWarehouse = warehouses.length > 1;
  const selectedWarehouse = warehouses.find(
    (w) => String(w.id) === form.warehouseId
  );

  const openWarehousePicker = () => {
    if (!multiWarehouse) return;
    openSheet(
      <View style={{ paddingBottom: SPACE_16 }}>
        {warehouses.map((w) => (
          <Pressable
            key={w.id}
            onPress={() => {
              setField("warehouseId", String(w.id));
              closeSheet();
            }}
            style={styles.sheetRow}
          >
            <Text style={[blackTextStyle, { fontSize: 14 }]}>
              {w.name} {w.code ? `(${w.code})` : ""}
            </Text>
          </Pressable>
        ))}
      </View>,
      ["50%"],
      <Text style={[blackTextStyle, { fontFamily: FontFamily.satoshiBold }]}>
        Pilih Gudang
      </Text>
    );
  };

  const onSubmit = async () => {
    const msg = await submit();
    if (msg) {
      toast.info("Info", msg);
      router.back();
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
          Tambah Customer
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <CheckField
          label="Customer Code *"
          value={form.customerCode}
          onChangeText={onCodeChange}
          status={codeStatus}
          message={codeMessage}
          hint="Maks 10 karakter, harus unik di seluruh sistem."
          maxLength={10}
          autoCapitalize="characters"
          placeholder="contoh: CUST001"
        />

        <Field
          label="Nama Customer *"
          value={form.customerName}
          onChangeText={(t) => setField("customerName", t)}
          maxLength={100}
          placeholder="Nama customer"
        />
        <Field
          label="Contact Person"
          value={form.contactPerson}
          onChangeText={(t) => setField("contactPerson", t)}
          maxLength={100}
          placeholder="Nama kontak"
        />

        <CheckField
          label="Nomor HP *"
          value={form.phone}
          onChangeText={onPhoneChange}
          status={phoneStatus}
          message={phoneMessage}
          hint="Harus unik di seluruh sistem."
          keyboardType="phone-pad"
          maxLength={15}
          placeholder="08xxxxxxxxxx"
        />

        <Field
          label="Email"
          value={form.email}
          onChangeText={(t) => setField("email", t)}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={100}
          placeholder="email@contoh.com"
        />
        <Field
          label="Alamat"
          value={form.address1}
          onChangeText={(t) => setField("address1", t)}
          multiline
          placeholder="Alamat lengkap"
          style={[styles.input, { minHeight: 64, textAlignVertical: "top" }]}
        />
        <Field
          label="Kota"
          value={form.city}
          onChangeText={(t) => setField("city", t)}
          maxLength={50}
          placeholder="Kota"
        />
        <Field
          label="Kabupaten"
          value={form.regency}
          onChangeText={(t) => setField("regency", t)}
          maxLength={50}
          placeholder="Kabupaten"
        />

        {/* WAREHOUSE */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>
            Gudang{" "}
            {multiWarehouse ? <Text style={{ color: redColor }}>*</Text> : null}
          </Text>
          <Gap height={6} />
          {whLoading ? (
            <Text style={[greyTextStyle, { fontSize: 13, padding: 10 }]}>
              Memuat gudang...
            </Text>
          ) : warehouses.length === 0 ? (
            <View style={styles.noWarehouse}>
              <Text style={[greyTextStyle, { fontSize: 13, color: redColor }]}>
                Tidak ada gudang yang tersedia untuk Anda.
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={openWarehousePicker}
              disabled={singleWarehouse}
              style={[
                styles.input,
                styles.selectRow,
                singleWarehouse ? { backgroundColor: bgColor } : null,
              ]}
            >
              <Text
                style={[
                  selectedWarehouse ? blackTextStyle : greyTextStyle,
                  { fontSize: 14, flex: 1 },
                ]}
                numberOfLines={1}
              >
                {selectedWarehouse
                  ? `${selectedWarehouse.name}${
                      selectedWarehouse.code
                        ? ` (${selectedWarehouse.code})`
                        : ""
                    }`
                  : "-- Pilih Gudang --"}
              </Text>
              {multiWarehouse ? (
                <ChevronDown size={18} color={greyColor} />
              ) : null}
            </Pressable>
          )}
          {singleWarehouse ? (
            <Text style={styles.hint}>
              Gudang otomatis sesuai profil sales Anda.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* STICKY FOOTER */}
      <View style={styles.footer}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={[greyTextStyle, { fontSize: 12, color: redColor }]}>
              {error}
            </Text>
          </View>
        ) : null}
        <Gap height={SPACE_8} />
        <Pressable
          disabled={!canSubmit}
          onPress={onSubmit}
          style={[
            styles.submitBtn,
            { backgroundColor: canSubmit ? primaryColor : "#D1D5DB" },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={whiteColor} />
          ) : (
            <>
              <UserPlus size={16} color={whiteColor} />
              <Gap width={8} />
              <Text
                style={[
                  whiteTextStyle,
                  { fontFamily: FontFamily.satoshiBold, fontSize: 14 },
                ]}
              >
                Simpan Customer
              </Text>
            </>
          )}
        </Pressable>
        <Gap height={SPACE_8} />
        <Text style={[styles.hint, { textAlign: "center" }]}>
          Region & branch otomatis dari profil sales Anda.
        </Text>
      </View>
    </LinearGradient>
  );
};

export default CreateCustomer;

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
  content: {
    padding: SPACE_16,
    paddingBottom: 24,
  },
  footer: {
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: strokeColor,
  },
  fieldBlock: {
    marginBottom: 12,
  },
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
  adornment: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 11,
    fontFamily: FontFamily.satoshiRegular,
    color: greyColor,
    marginTop: 4,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  noWarehouse: {
    backgroundColor: redRGBAColor,
    borderWidth: 1,
    borderColor: redStrokeColor,
    borderRadius: 12,
    padding: 12,
  },
  errorBox: {
    backgroundColor: redRGBAColor,
    borderWidth: 1,
    borderColor: redStrokeColor,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: strokeColor,
  },
});
