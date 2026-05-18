import {
  blackTextStyle,
  borderInputColor,
  FontFamily,
  greyTextStyle,
  redTextStyle,
} from "@/constants/theme";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Gap } from "../ui";

type Props = {
  label: string;
  error?: string;
} & TextInputProps;

export default function FormInput({ label, error, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[greyTextStyle, styles.label]}>{label}</Text>
      <Gap height={10} />
      <TextInput style={[blackTextStyle, styles.input]} {...props} />
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: borderInputColor,
    borderRadius: 10,
    padding: 14,
    minHeight: 46,
  },
  error: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "300",
  },
});
