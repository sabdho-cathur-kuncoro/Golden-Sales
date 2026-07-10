import { FormInput, FormPassword } from "@/components/form";
import { Button, Gap } from "@/components/ui";
import {
  bgColor,
  FontFamily,
  greyColor,
  primaryTextStyle,
  shadow,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useLoading } from "@/hooks/useLoading";
import { useToast } from "@/hooks/useToast";
import { getProfileService, onLoginService } from "@/services/auth.services";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const toast = useToast();
  const loading = useLoading();

  useEffect(() => {
    if (__DEV__) {
      setUsername("ryan.juniansyah@golden.com");
      setPassword("P@ssw0rd");
    }
  }, []);

  const onLogin = async () => {
    if (username.trim().length === 0) {
      toast.info("Info", "Username/Email/Telepon tidak boleh kosong");
      return;
    }
    if (password.trim().length === 0) {
      toast.info("Info", "Password tidak boleh kosong");
      return;
    }
    const controller = new AbortController();
    try {
      loading.show({
        message: "Mencoba masuk...",
        cancellable: true,
        onCancel: () => controller.abort(),
      });
      const form = {
        username,
        password,
      };
      const res = await onLoginService(form, controller);
      if (res !== 200 || res === undefined) {
        toast.error("Wrong", "Terjadi Kesalahan");
        return;
      }
      router.replace("/home");
      toast.success("Berhasil", "Berhasil masuk ke akun!");
      getProfileService().catch(() => {}); // background profile enrich
      setUsername("");
      setPassword("");
    } catch (err) {
      if (controller.signal.aborted) return; // user cancelled — no toast
      if (__DEV__) {
        console.log("[ERR]", err);
      }
      toast.warning(
        "Perhatian",
        `${err ?? "Terjadi kesalahan saat login!"}`,
        5000
      );
    } finally {
      loading.hide();
    }
  };
  return (
    <ImageBackground
      style={styles.page}
      source={require("@/assets/images/bg-login.png")}
    >
      <StatusBar barStyle={"light-content"} />
      <View style={{ flexDirection: "row", marginBottom: 28 }}>
        <Image
          source={require("../../../assets/images/logo-golden.png")}
          style={styles.logo}
        />
        <Gap width={10} />
        <Text style={[whiteTextStyle, styles.title]}>
          Golden {"\n"}Communication
        </Text>
      </View>
      <Text
        style={[
          whiteTextStyle,
          { fontSize: 28, fontWeight: "700", letterSpacing: 2 },
        ]}
      >
        Masuk ke Akun Anda
      </Text>
      <Gap height={12} />
      <Text style={[whiteTextStyle]}>
        Masukan username/email/telepon dan password Anda
      </Text>
      <Gap height={50} />
      <View style={{ paddingHorizontal: 32, width: "100%" }}>
        <View
          style={[
            shadow,
            {
              width: "auto",
              backgroundColor: whiteColor,
              borderRadius: 10,
              padding: 24,
            },
          ]}
        >
          <FormInput
            value={username}
            onChangeText={(text) => setUsername(text)}
            label="Username/Email/Telepon"
            placeholder="Masukan username/email/telepon"
            placeholderTextColor={greyColor}
          />
          <Gap height={16} />
          <FormPassword
            value={password}
            onChangeText={(text) => setPassword(text)}
            label="Password"
            placeholderVisible="Masukkan password"
            placeholderTextColor={greyColor}
            onSubmitEditing={onLogin}
          />
          <Gap height={16} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text
              style={[
                primaryTextStyle,
                { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
              ]}
            >
              Lupa Password?
            </Text>
          </TouchableOpacity>
          <Gap height={24} />
          <Button title="Masuk" isIconVisible onPress={onLogin} />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.satoshiBold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
