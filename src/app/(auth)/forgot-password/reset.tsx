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
  greyTextStyle,
  mainContent,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useLoading } from "@/hooks/useLoading";
import { useToast } from "@/hooks/useToast";
import { onForgotPasswordResetService } from "@/services/auth.services";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type FormState = {
  baru: string;
  konfirmasi: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = { baru: "", konfirmasi: "" };

const ForgotPasswordReset = () => {
  const toast = useToast();
  const loading = useLoading();
  const { resetToken, customerName } = useLocalSearchParams<{
    resetToken?: string;
    customerName?: string;
  }>();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.baru) {
      nextErrors.baru = "Password baru wajib diisi";
    } else if (form.baru.length < 4) {
      nextErrors.baru = "Password baru minimal 4 karakter";
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

    const controller = new AbortController();
    try {
      loading.show({
        message: "Menyimpan password...",
        cancellable: true,
        onCancel: () => controller.abort(),
      });
      await onForgotPasswordResetService(
        String(resetToken ?? ""),
        form.baru,
        controller
      );
      if (controller.signal.aborted) return; // user cancelled
      setForm(initialForm);
      router.replace("/(auth)/forgot-password/success");
    } catch (err) {
      if (controller.signal.aborted) return; // user cancelled — no toast
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    } finally {
      loading.hide();
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
      <View style={[styles.header]}>
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Atur Ulang Password
        </Text>
      </View>
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            {customerName ? `Halo, ${customerName}. ` : ""}Buat password baru
            untuk akun Anda
          </Text>
          <Gap height={24} />
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
          <Button title="Simpan" onPress={handleSubmit} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default ForgotPasswordReset;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
});
