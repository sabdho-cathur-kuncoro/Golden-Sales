import { FormInput } from "@/components/form";
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
import { onForgotPasswordVerifyService } from "@/services/auth.services";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = { phone: string; email: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = { phone: "", email: "" };

const ForgotPasswordVerify = () => {
  const toast = useToast();
  const loading = useLoading();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.phone) {
      nextErrors.phone = "Nomor HP wajib diisi";
    }
    if (!form.email) {
      nextErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = "Format email tidak valid";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const controller = new AbortController();
    try {
      loading.show({
        message: "Memverifikasi akun...",
        cancellable: true,
        onCancel: () => controller.abort(),
      });
      const result = await onForgotPasswordVerifyService(
        { phone: form.phone, email: form.email },
        controller
      );
      if (controller.signal.aborted) return; // user cancelled
      const data = typeof result === "object" ? result : null;
      router.push({
        pathname: "/(auth)/forgot-password/reset",
        params: {
          resetToken: String(data?.resetToken ?? ""),
          customerName: String(data?.customerName ?? ""),
        },
      });
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
          Lupa Password
        </Text>
      </View>
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            Masukkan nomor HP & email yang terdaftar untuk reset password
          </Text>
          <Gap height={24} />
          <FormInput
            label="Nomor HP"
            placeholder="08xxxxxxxxxx"
            placeholderTextColor={greyColor}
            keyboardType="phone-pad"
            value={form.phone}
            bgColor={whiteColor}
            onChangeText={setField("phone")}
            error={errors.phone}
          />
          <Gap height={16} />
          <FormInput
            label="Email"
            placeholder="email@contoh.com"
            placeholderTextColor={greyColor}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            bgColor={whiteColor}
            onChangeText={setField("email")}
            error={errors.email}
          />
          <Gap height={32} />
          <Button title="Verifikasi" onPress={handleSubmit} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default ForgotPasswordVerify;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
});
