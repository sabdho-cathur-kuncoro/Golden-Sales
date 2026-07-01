import { FormPassword } from "@/components/form";
import {
  AnimatedPressable,
  Button,
  FocusAwareStatusBar,
  Gap,
} from "@/components/ui";
import {
  darkPrimaryColor,
  FontFamily,
  greyColor,
  mainContent,
  paddingScroll,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { onChangePasswordService } from "@/services/auth.services";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type FormState = {
  lama: string;
  baru: string;
  konfirmasi: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = { lama: "", baru: "", konfirmasi: "" };

const ChangePassword = () => {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.lama) {
      nextErrors.lama = "Password lama wajib diisi";
    }

    if (!form.baru) {
      nextErrors.baru = "Password baru wajib diisi";
    } else if (form.baru.length < 8) {
      nextErrors.baru = "Password baru minimal 8 karakter";
    } else if (form.lama && form.baru === form.lama) {
      nextErrors.baru = "Password baru tidak boleh sama dengan password lama";
    }

    if (!form.konfirmasi) {
      nextErrors.konfirmasi = "Konfirmasi password wajib diisi";
    } else if (form.konfirmasi !== form.baru) {
      nextErrors.konfirmasi =
        "Konfirmasi password tidak sama dengan password baru";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const controller = new AbortController();
    try {
      await onChangePasswordService(
        { currentPassword: form.lama, newPassword: form.baru },
        controller
      );
      toast.success("Berhasil", "Password berhasil diubah");
      setForm(initialForm);
      router.back();
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    } finally {
      setLoading(false);
    }
  };

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
          Ubah Kata Sandi
        </Text>
      </View>
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={[paddingScroll]}>
          <FormPassword
            label="Password Lama"
            placeholderVisible="Masukkan password lama"
            placeholderTextColor={greyColor}
            value={form.lama}
            onChangeText={setField("lama")}
            error={errors.lama}
          />
          <Gap height={16} />
          <FormPassword
            label="Password Baru"
            placeholderVisible="Masukkan password baru"
            placeholderTextColor={greyColor}
            value={form.baru}
            onChangeText={setField("baru")}
            error={errors.baru}
          />
          <Gap height={16} />
          <FormPassword
            label="Konfirmasi Password Baru"
            placeholderVisible="Ulangi password baru"
            placeholderTextColor={greyColor}
            value={form.konfirmasi}
            onChangeText={setField("konfirmasi")}
            error={errors.konfirmasi}
          />
          <Gap height={32} />
          <Button
            title={loading ? "Menyimpan..." : "Simpan"}
            onPress={handleSubmit}
          />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
});
