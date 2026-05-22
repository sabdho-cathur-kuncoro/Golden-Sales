import { FormInput, FormPassword } from "@/components/form";
import { Button, Gap } from "@/components/ui";
import {
  bgColor,
  blueTextStyle,
  FontFamily,
  greyColor,
  shadow,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const Login = () => {
  const width = useWindowDimensions().width;
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
      <Text style={[whiteTextStyle]}>Masukan username dan password Anda</Text>
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
            label="Username"
            placeholder="Masukan username"
            placeholderTextColor={greyColor}
          />
          <Gap height={16} />
          <FormPassword
            label="Password"
            placeholder="********"
            placeholderTextColor={greyColor}
          />
          <Gap height={16} />
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={[
                blueTextStyle,
                { fontFamily: FontFamily.satoshiMedium, fontSize: 12 },
              ]}
            >
              Lupa Password?
            </Text>
          </TouchableOpacity>
          <Gap height={24} />
          <Button
            title="Masuk"
            isIconVisible
            onPress={() => router.replace("/home")}
          />
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
