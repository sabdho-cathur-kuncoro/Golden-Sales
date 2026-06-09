import { Button, Gap, Header } from "@/components/ui";
import {
  borderInputColor,
  greyTextStyle,
  mainContent,
  primaryColor,
  redColor,
  screen,
  whiteColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { wait } from "../../../utils/helper";

const PIN_LENGTH = 6;

type Phase = "create" | "confirm";

const PinScreen = () => {
  const toast = useToast();
  const inputRef = useRef<TextInput>(null);

  const [phase, setPhase] = useState<Phase>("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const isCreate = phase === "create";

  const handleChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    setPin(digits);
    setError(undefined);
  };

  const handleContinue = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError("Masukkan 6 digit PIN");
      return;
    }

    if (isCreate) {
      setFirstPin(pin);
      setPin("");
      setPhase("confirm");
      inputRef.current?.focus();
      return;
    }

    if (pin !== firstPin) {
      setError("PIN tidak sama, coba lagi");
      setPin("");
      return;
    }

    setLoading(true);
    try {
      // TODO: connect to real setPin(pin) endpoint once auth API is wired up
      await wait(1000);
      toast.success("Berhasil", "PIN berhasil dibuat");
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

  const handleBack = () => {
    if (!isCreate) {
      setPhase("create");
      setPin(firstPin);
      setError(undefined);
      return;
    }
    router.back();
  };

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header
        title={isCreate ? "Buat PIN" : "Konfirmasi PIN"}
        onBack={handleBack}
      />
      <View style={[mainContent]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            {isCreate
              ? "Buat 6 digit PIN keamanan untuk akun Anda"
              : "Masukkan kembali PIN untuk konfirmasi"}
          </Text>
          <Gap height={24} />

          <Pressable onPress={() => inputRef.current?.focus()}>
            <View style={styles.boxRow}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => {
                const filled = i < pin.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.box,
                      { borderColor: filled ? primaryColor : borderInputColor },
                    ]}
                  >
                    {filled ? <View style={styles.dot} /> : null}
                  </View>
                );
              })}
            </View>
            <TextInput
              ref={inputRef}
              value={pin}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              secureTextEntry
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

          <Gap height={32} />
          <Button
            title={
              loading
                ? "Menyimpan..."
                : isCreate
                ? "Lanjut"
                : "Simpan"
            }
            onPress={handleContinue}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default PinScreen;

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
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: primaryColor,
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
  },
});
