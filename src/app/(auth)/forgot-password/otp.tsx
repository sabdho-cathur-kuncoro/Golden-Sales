import { Button, Gap, Header } from "@/components/ui";
import {
  borderInputColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  mainContent,
  primaryColor,
  redColor,
  screen,
  whiteColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { wait } from "../../../../utils/helper";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const ForgotPasswordOtp = () => {
  const toast = useToast();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = async () => {
    if (seconds > 0) return;
    // TODO: connect to real forgotPassword(email) resend endpoint once auth API is wired up
    await wait(500);
    setSeconds(RESEND_SECONDS);
    toast.success("Terkirim", "Kode OTP baru dikirim ke email Anda");
  };

  const validate = () => {
    if (code.length !== OTP_LENGTH) {
      setError("Masukkan 6 digit kode OTP");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: connect to real verifyOtp(email, code) endpoint once auth API is wired up
      await wait(1000);
      router.push({
        pathname: "/(auth)/forgot-password/reset",
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
      <Header title={"Verifikasi OTP"} onBack={() => router.back()} />
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            Masukkan 6 digit kode yang dikirim ke{" "}
            {email ? (
              <Text style={{ color: primaryColor }}>{email}</Text>
            ) : (
              "email Anda"
            )}
          </Text>
          <Gap height={24} />

          <Pressable onPress={() => inputRef.current?.focus()}>
            <View style={styles.boxRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                const char = code[i];
                return (
                  <View
                    key={i}
                    style={[
                      styles.box,
                      { borderColor: char ? primaryColor : borderInputColor },
                    ]}
                  >
                    <Text style={styles.boxText}>{char ?? ""}</Text>
                  </View>
                );
              })}
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(value) => {
                const digits = value
                  .replace(/[^0-9]/g, "")
                  .slice(0, OTP_LENGTH);
                setCode(digits);
                setError(undefined);
              }}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenInput}
              autoFocus
            />
          </Pressable>

          {error ? (
            <>
              <Gap height={8} />
              <Text style={{ color: redColor, fontSize: 12 }}>{error}</Text>
            </>
          ) : null}

          <Gap height={24} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[greyTextStyle, { fontSize: 13 }]}>
              Belum menerima kode?{" "}
            </Text>
            <Pressable onPress={handleResend} disabled={seconds > 0}>
              <Text
                style={{
                  fontFamily: FontFamily.satoshiMedium,
                  fontSize: 13,
                  color: seconds > 0 ? greyColor : primaryColor,
                }}
              >
                {seconds > 0 ? `Kirim ulang (${seconds}s)` : "Kirim ulang kode"}
              </Text>
            </Pressable>
          </View>

          <Gap height={32} />
          <Button
            title={loading ? "Memverifikasi..." : "Verifikasi"}
            onPress={handleSubmit}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default ForgotPasswordOtp;

const styles = StyleSheet.create({
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    backgroundColor: whiteColor,
    width: 48,
    height: 56,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: {
    fontFamily: FontFamily.satoshiBold,
    fontSize: 20,
    color: primaryColor,
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
  },
});
