import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  bgColor,
  blackTextStyle,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  primaryColor,
  redColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { getSalesManualService } from "@/services/sale.services";
import * as LegacyFS from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  AlertTriangle,
  ChevronLeft,
  Download,
  FileText,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Pdf from "react-native-pdf";

// Buku Manual viewer (Sales) — renders the PDF in-app via react-native-pdf.
// Source: GET /manual → { base64, contentType, fileName, title?, snippet? }.
const ManualBook = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manual, setManual] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getSalesManualService();
        if (!active) return;
        setManual(data);
        if (!data?.base64) {
          setError(
            "File manual ada tapi belum di-encode base64. Hubungi admin."
          );
        }
      } catch (err) {
        if (__DEV__) console.log(err);
        if (active) {
          setError(String(err instanceof Error ? err.message : err));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDownload = async () => {
    if (!manual?.base64 || downloading) return;
    setDownloading(true);
    try {
      const fileName = manual.fileName || "buku-manual-sales.pdf";
      const mime = manual.contentType || "application/pdf";

      if (Platform.OS === "android") {
        // Storage Access Framework — save straight to a user-picked folder.
        const perm =
          await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted) {
          const dest = await LegacyFS.StorageAccessFramework.createFileAsync(
            perm.directoryUri,
            fileName,
            mime
          );
          await LegacyFS.writeAsStringAsync(dest, manual.base64, {
            encoding: LegacyFS.EncodingType.Base64,
          });
          toast.success("Tersimpan", "Buku manual tersimpan ke perangkat.");
          return;
        }
        // permission denied → fall through to share sheet
      }

      const uri = LegacyFS.cacheDirectory + fileName;
      await LegacyFS.writeAsStringAsync(uri, manual.base64, {
        encoding: LegacyFS.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: mime,
          UTI: "com.adobe.pdf",
          dialogTitle: fileName,
        });
      } else {
        toast.info("File siap", fileName);
      }
    } catch (err) {
      toast.error("Gagal", String(err instanceof Error ? err.message : err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AnimatedPressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={whiteColor} />
          </AnimatedPressable>
          <Gap width={SPACE_16} />
          <Text
            style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
          >
            Buku Manual
          </Text>
        </View>
        {manual?.base64 ? (
          <AnimatedPressable onPress={handleDownload} disabled={downloading}>
            <View style={styles.iconBtn}>
              {downloading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Download size={20} color={whiteColor} />
              )}
            </View>
          </AnimatedPressable>
        ) : null}
      </View>

      <View style={styles.mainContent}>
        {/* META BAR */}
        {manual?.title ? (
          <View style={styles.metaBar}>
            <Text style={styles.metaTitle}>{manual.title}</Text>
            {manual.snippet ? (
              <Text style={styles.metaSnippet}>{manual.snippet}</Text>
            ) : null}
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <FileText size={40} color={greyColor} />
            <Gap height={8} />
            <Text style={styles.muted}>Memuat manual…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <AlertTriangle size={40} color={orangeColor} />
            <Gap height={8} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : manual?.base64 ? (
          <Pdf
            source={{
              uri: `data:application/pdf;base64,${manual.base64}`,
              cache: true,
            }}
            style={styles.pdf}
            onError={(err) =>
              setError(String(err instanceof Error ? err.message : err))
            }
            renderActivityIndicator={() => (
              <ActivityIndicator color={primaryColor} />
            )}
          />
        ) : null}
      </View>
    </LinearGradient>
  );
};

export default ManualBook;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: bgColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    overflow: "hidden",
  },
  metaBar: {
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lineColor,
  },
  metaTitle: {
    color: blackTextStyle.color,
    fontSize: 14,
    fontFamily: FontFamily.satoshiBold,
  },
  metaSnippet: {
    color: greyTextStyle.color,
    fontSize: 11,
    marginTop: 2,
  },
  pdf: {
    flex: 1,
    width: "100%",
    backgroundColor: "#525659",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE_16,
  },
  muted: {
    color: greyColor,
    fontSize: 14,
  },
  errorText: {
    color: redColor,
    fontSize: 14,
    textAlign: "center",
  },
});
