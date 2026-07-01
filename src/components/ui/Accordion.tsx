import {
  bgSecondaryColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  lineColor,
  primaryColor,
  whiteColor,
} from "@/constants/theme";
import { ChevronDown, LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const Accordion = ({
  icon: Icon,
  iconColor = primaryColor,
  title,
  isOpen,
  onToggle,
  children,
}: Props) => {
  const rotation = useDerivedValue(() =>
    withTiming(isOpen ? 180 : 0, { duration: 200 })
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[
        styles.card,
        isOpen && { borderColor: primaryColor, backgroundColor: whiteColor },
      ]}
    >
      <Pressable
        onPress={onToggle}
        style={styles.headerRow}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={title}
      >
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: isOpen ? primaryColor : bgSecondaryColor },
          ]}
        >
          <Icon size={20} color={isOpen ? whiteColor : iconColor} />
        </View>
        <Text style={[blackTextStyle, styles.title]}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color={isOpen ? primaryColor : greyColor} />
        </Animated.View>
      </Pressable>
      {isOpen ? (
        <>
          <View style={styles.divider} />
          <View>{children}</View>
        </>
      ) : null}
    </View>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: whiteColor,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: lineColor,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.satoshiBold,
    paddingRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: lineColor,
    marginVertical: 14,
  },
});
