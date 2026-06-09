import { FormInput } from "@/components/form";
import { Button, Gap, Header } from "@/components/ui";
import {
  greyColor,
  greyTextStyle,
  mainContent,
  screen,
  whiteColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { wait } from "../../../../utils/helper";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordEmail = () => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email wajib diisi");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: connect to real forgotPassword(email) endpoint once auth API is wired up
      await wait(1000);
      toast.success("Terkirim", "Kode OTP dikirim ke email Anda");
      router.push({
        pathname: "/(auth)/forgot-password/otp",
        params: { email },
      });
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
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Lupa Password"} onBack={() => router.back()} />
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            Masukkan email Anda untuk menerima kode verifikasi
          </Text>
          <Gap height={24} />
          <FormInput
            label="Email"
            placeholder="Masukkan email"
            placeholderTextColor={greyColor}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            bgColor={whiteColor}
            onChangeText={(value) => {
              setEmail(value);
              setError(undefined);
            }}
            error={error}
          />
          <Gap height={32} />
          <Button
            title={loading ? "Mengirim..." : "Kirim"}
            onPress={handleSubmit}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default ForgotPasswordEmail;
