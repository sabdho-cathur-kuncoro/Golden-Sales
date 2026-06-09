import { FormPassword } from "@/components/form";
import { Button, Gap, Header } from "@/components/ui";
import { greyColor, mainContent, paddingScroll, screen, whiteColor } from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { wait } from "../../../utils/helper";

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
      nextErrors.konfirmasi = "Konfirmasi password tidak sama dengan password baru";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: connect to real change-password endpoint once auth API is wired up
      await wait(1000);
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
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Ubah Password"} onBack={() => router.back()} />
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
    </View>
  );
};

export default ChangePassword;
