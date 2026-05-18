import {
  blackColor,
  blackTextStyle,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Gap from "./Gap";

const Header = ({ title, onBack }: any) => {
  return (
    <View style={styles.headerContainer}>
      <Pressable onPress={onBack} hitSlop={8}>
        <ChevronLeft size={22} color={blackColor} />
      </Pressable>
      <Gap width={10} />
      <Text style={[blackTextStyle, { fontSize: 16 }]}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },
});
