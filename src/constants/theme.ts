/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const SPACE_4 = 4;
export const SPACE_8 = 8;
export const SPACE_16 = 16;
export const SPACE_24 = 24;
export const SPACE_32 = 32;
export const SPACE_48 = 48;
export const SPACE_64 = 64;

export const primaryColor = "#1C0867";
export const secondaryColor = "#B0A8BA";
export const bgColor = "#F2F3F5";
export const bgSecondaryColor = "#F4F1FE";
export const bgTertiaryColor = "#F0ECFE";
export const blackColor = "#202020";
export const blackRBGAColor = "rgba(0,0,0,0.2)";
export const whiteColor = "#FFFFFF";
export const whiteSecondaryColor = "#EEEEEE";
export const whiteThirdColor = "#F6F7F8";
export const greyColor = "#6C7278";
export const greySecondaryColor = "#606060";
export const greyTertiaryColor = "#E6E6E6";
export const yellowColor = "#FFB34A";
export const yellowSecondaryColor = "#FFD499";
export const darkBlueColor = "#0D042F";
export const darkBlueRGBAColor = "#F7F6FE";
export const pinkColor = "#FE9F9F";
export const pinkSecondaryColor = "#FFF5F5";
export const lightBlueColor = "#A4C0FE";
export const blueColor = "#003E97";
export const blueRGBAColor = "#E6EEFF";
export const blueSecondaryColor = "#155DFC";
export const blueStrokeColor = "#719DFF";
export const redColor = "#FD131F";
export const redRGBAColor = "#FFE2E2";
export const redStrokeColor = "#FFC9C9";
export const orangeColor = "#F38A1A";
export const orangeRGBAColor = "#FFEDD4";
export const orangeSecondaryColor = "#CA3500";
export const orangeStrokeColor = "#FFD7A8";
export const purpleColor = "#7956BF";
export const purpleRGBAColor = "#F0ECF9";
export const purpleStrokeColor = "#8B6DCF";
export const greenColor = "#0DB561";
export const greenSecondaryColor = "#005245";
export const greenRGBAColor = "#F0FDF4";
export const greenSecondaryRGBAColor = "#E5FFFA";
export const strokeColor = "#CCD7EB";
export const lineColor = "#D4D7DE";
export const borderColor = "#B2C2FF";
export const borderInputColor = "#EDF1F3";
export const tabBarColor = "#B0A8BA";
export const inactiveColor = "#B4BED4";

export const primaryTextStyle = {
  fontFamily: "satoshiRegular",
  color: primaryColor,
};
export const whiteTextStyle = {
  fontFamily: "satoshiRegular",
  color: whiteColor,
};
export const blackTextStyle = {
  fontFamily: "satoshiRegular",
  color: blackColor,
};
export const greyTextStyle = {
  fontFamily: "satoshiRegular",
  color: greyColor,
};
export const inactiveTextStyle = {
  fontFamily: "satoshiRegular",
  color: inactiveColor,
};
export const redTextStyle = {
  fontFamily: "satoshiRegular",
  color: redColor,
};
export const greenTextStyle = {
  fontFamily: "satoshiRegular",
  color: greenColor,
};
export const greenSecTextStyle = {
  fontFamily: "satoshiRegular",
  color: greenSecondaryColor,
};
export const yellowTextStyle = {
  fontFamily: "satoshiRegular",
  color: yellowColor,
};
export const orangeTextStyle = {
  fontFamily: "satoshiRegular",
  color: orangeColor,
};
export const blueTextStyle = {
  fontFamily: "satoshiRegular",
  color: blueColor,
};
export const purpleTextStyle = {
  fontFamily: "satoshiRegular",
  color: purpleColor,
};

export const FontFamily = {
  satoshiRegular: "satoshiRegular",
  satoshiMedium: "satoshiMedium",
  satoshiLight: "satoshiLight",
  satoshiBold: "satoshiBold",
};

export const mainContent = { flex: 1, backgroundColor: bgColor };

export const shadow = {
  shadowColor: blackColor,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.34,
  shadowRadius: 6.27,

  elevation: 10,
};

export const screen = {
  flex: 1,
  backgroundColor: bgColor,
  paddingTop: 48,
};

export const footerStyle = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  alignItems: "center",
  paddingHorizontal: SPACE_16,
  paddingBottom: SPACE_24,
  minHeight: 96,
} as const;

export const rowCenter = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

export const paddingH = {
  paddingHorizontal: SPACE_16,
};

export const dot = {
  width: 6,
  height: 6,
  borderRadius: 6,
  backgroundColor: redColor,
};

export const line = {
  width: "100%",
  height: 1,
  backgroundColor: lineColor,
} as const;

export const lineDash = {
  width: "100%",
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: lineColor,
} as const;

export const paddingScroll = {
  paddingTop: 20,
  paddingBottom: 120,
  paddingHorizontal: SPACE_16,
};
