import {
  blackTextStyle,
  borderInputColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  redTextStyle,
} from "@/constants/theme";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Gap } from "../ui";

type Props = {
  label: string;
  error?: string;
} & TextInputProps;

type eyeType = {
  icon: "eye" | "eye-off";
  pass: boolean;
};

export default function FormPassword({ label, error, ...props }: Props) {
  const [isVisiblePass, setIsVisiblePass] = useState<eyeType>({
    icon: "eye-off",
    pass: true,
  });

  const changeVisiblePass = () => {
    setIsVisiblePass((prevState) => ({
      icon: prevState.icon === "eye" ? "eye-off" : "eye",
      pass: !prevState.pass,
    }));
  };
  return (
    <View style={styles.container}>
      <Text style={[greyTextStyle, styles.label]}>{label}</Text>
      <Gap height={10} />
      <View style={styles.inputContainer}>
        <TextInput
          style={[blackTextStyle, styles.input]}
          secureTextEntry={isVisiblePass.pass}
          {...props}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={changeVisiblePass}
          style={{
            width: "10%",
            alignItems: "flex-end",
          }}
        >
          {isVisiblePass.icon === "eye" ? (
            <Eye color={greyColor} size={16} />
          ) : (
            <EyeOff color={greyColor} size={16} />
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={[redTextStyle, styles.error]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontFamily: FontFamily.satoshiBold,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: borderInputColor,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  input: {
    width: "90%",
    minHeight: 46,
    paddingVertical: 14,
  },
  error: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "300",
  },
});
