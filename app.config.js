import "dotenv/config";

export default {
  expo: {
    name: "Sales - Belanja Yuk!",
    slug: "golden-sales",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "goldensales",
    userInterfaceStyle: "automatic",
    ios: {
      infoPlist: {
        NSCameraUsageDescription:
          "Kamera digunakan untuk scan QR atau Barcode produk",
      },
      icon: "./assets/icon.png",
      bundleIdentifier: "com.rds.goldensales",
    },
    android: {
      permissions: ["CAMERA", "ACCESS_FINE_LOCATION", "POST_NOTIFICATIONS"],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        backgroundImage: "./assets/icon.png",
      },
      predictiveBackGestureEnabled: true,
      package: "com.rds.goldensales",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "react-native-permissions/app.plugin.js",
        {
          iosPermissions: ["Notifications"],
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#E6F4FE",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 1,
          },
        },
      ],
      [
        "react-native-vision-camera",
        {
          enableCodeScanner: true,
          cameraPermissionText: "Allow $(PRODUCT_NAME) to access your camera.",
          enableMicrophonePermission: false,
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#1C0867",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 1,
          },
        },
      ],
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos to attach a review image.",
          colors: {
            cropToolbarColor: "#000000",
          },
          dark: {
            colors: {
              cropToolbarColor: "#000000",
            },
          },
        },
      ],
      [
        "expo-sqlite",
        {
          enableFTS: true,
          useSQLCipher: false,
          android: {
            enableFTS: false,
            useSQLCipher: false,
          },
          ios: {
            customBuildFlags: [
              "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
            ],
          },
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
        },
      ],
      "expo-sharing",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // Tempat menampung seluruh variabel .env kustom Anda
    extra: {
      BEARER_UAT: process.env.PUBLIC_BEARER_UAT,
      BEARER_PRD: process.env.PUBLIC_BEARER_PRD,
    },
  },
};
