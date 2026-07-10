import { AnimatedPressable, FocusAwareStatusBar, Gap } from "@/components/ui";
import {
  blackColor,
  darkPrimaryColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  orangeColor,
  orangeRGBAColor,
  primaryColor,
  redTextStyle,
  screen,
  SPACE_16,
  SPACE_48,
  SPACE_8,
  whiteColor,
  whiteTextStyle,
  whiteThirdColor,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import {
  getOrderMessagesService,
  onMessagesOrderService,
} from "@/services/orders.services";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Info,
  Send,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { formatDateTime, formatTime } from "../../../utils/days";
import { isAndroid } from "../../../utils/platform";

const POLL_INTERVAL = 3000; // 3s while screen is focused

// Statuses that close the chat — history stays readable (read-only), no new
// messages. Mirrors the web rule (SalesOrder/Edit).
const CHAT_LOCKED_STATUSES = new Set([
  "Selesai",
  "Selesai Sebagian",
  "Dibatalkan",
  "Ditolak",
  "Completed",
  "Cancelled",
  "Deleted",
]);

const ME_TYPE = "sales"; // this app is the sales side

const senderLabel = (t: string) =>
  t === "customer"
    ? "Customer"
    : t === "sales"
    ? "Sales"
    : t === "admin"
    ? "Admin SO"
    : "User";

const OrderChat = () => {
  const { id, orderId, status } = useLocalSearchParams<{
    id: string;
    status?: string;
    orderId?: string;
  }>();
  const toast = useToast();

  const chatLocked = CHAT_LOCKED_STATUSES.has(String(status || ""));

  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const since = useRef<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const fetchMessages = async (incremental = true) => {
    try {
      const data = await getOrderMessagesService(id, since);
      if (!Array.isArray(data) || data.length === 0) return;

      // Track max(createdAt, readAt) so synced rows aren't re-fetched forever.
      for (const m of data) {
        if (m.createdAt && (!since.current || m.createdAt > since.current))
          since.current = m.createdAt;
        if (m.readAt && (!since.current || m.readAt > since.current))
          since.current = m.readAt;
      }

      setMessages((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]));
        for (const m of data) map.set(m.id, m);
        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (err) {
      if (__DEV__) console.log("[OrderChat] fetch", err);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await fetchMessages(false);
      if (active) setLoading(false);
    })();
    const timer = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const send = async () => {
    if (chatLocked) return; // double-guard; UI already disabled
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const data = await onMessagesOrderService(id, body);
      setDraft("");
      if (data?.id) {
        setMessages((prev) =>
          prev.some((m) => m.id === data.id) ? prev : [...prev, data]
        );
        if (data.createdAt) since.current = data.createdAt;
      } else {
        // No echo returned — pull the latest so the sent message shows up.
        await fetchMessages(true);
      }
    } catch (err) {
      toast.error("Gagal", String(err instanceof Error ? err.message : err));
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item: m }: { item: any }) => {
    if (m.senderType === "system") {
      return (
        <View style={styles.systemWrap}>
          <View style={styles.systemCard}>
            <Text style={styles.systemTitle}>
              {(m.senderName || "Riwayat Order").toUpperCase()}
            </Text>
            <Text style={styles.systemBody}>{m.body}</Text>
            <Text style={styles.systemTime}>
              {m.createdAt ? formatDateTime(m.createdAt, "DD MMM HH:mm") : ""}
            </Text>
          </View>
        </View>
      );
    }

    const mine = m.senderType === ME_TYPE;
    return (
      <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          {!mine ? (
            <Text style={styles.senderName}>
              {m.senderName || senderLabel(m.senderType)}
            </Text>
          ) : null}
          <Text style={[styles.bubbleText, mine && { color: whiteColor }]}>
            {m.body}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.metaTime,
                mine
                  ? { color: "rgba(255,255,255,0.8)" }
                  : { color: greyColor },
              ]}
            >
              {m.createdAt ? formatTime(m.createdAt) : ""}
            </Text>
            {mine ? (
              m.readAt ? (
                <CheckCheck size={13} color="#86EFAC" />
              ) : m.id ? (
                <CheckCheck size={13} color="rgba(255,255,255,0.7)" />
              ) : (
                <Check size={13} color="rgba(255,255,255,0.7)" />
              )
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[darkPrimaryColor, primaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[screen]}
    >
      <FocusAwareStatusBar barStyle={"light-content"} />
      <View style={[styles.header]}>
        <AnimatedPressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={whiteColor} />
        </AnimatedPressable>
        <Gap width={SPACE_16} />
        <Text
          style={[whiteTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          {orderId}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={8}
      >
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m, i) => String(m.id ?? i)}
            renderItem={renderItem}
            style={{ flex: 1, backgroundColor: whiteThirdColor }}
            contentContainerStyle={{ padding: SPACE_16, flexGrow: 1 }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Info size={56} color={lineColor} />
                <Gap height={SPACE_8} />
                <Text style={[greyTextStyle, { textAlign: "center" }]}>
                  Belum ada pesan. Mulai percakapan!
                </Text>
              </View>
            }
          />
        )}

        {chatLocked ? (
          <View style={styles.lockedBar}>
            <Text
              style={[greyTextStyle, { fontSize: 12, textAlign: "center" }]}
            >
              <Text style={[redTextStyle, { fontSize: 12 }]}>Chat ditutup</Text>{" "}
              — pesanan sudah{" "}
              <Text style={{ fontFamily: FontFamily.satoshiBold }}>
                {status}
              </Text>
              .
            </Text>
            <Text
              style={[greyTextStyle, { fontSize: 12, textAlign: "center" }]}
            >
              Riwayat percakapan tetap bisa dibaca.
            </Text>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Tulis pesan..."
              placeholderTextColor={greyColor}
              style={styles.input}
              multiline
            />
            <Gap width={SPACE_8} />
            <Pressable
              onPress={send}
              disabled={!draft.trim() || sending}
              style={{ opacity: !draft.trim() || sending ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#FE9F9F", primaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={styles.sendBtn}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={whiteColor} />
                ) : (
                  <Send size={18} color={whiteColor} />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default OrderChat;

const styles = StyleSheet.create({
  stateContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  bubbleRow: { width: "100%", marginBottom: SPACE_8, flexDirection: "row" },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: primaryColor,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: lineColor,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    color: primaryColor,
    fontSize: 10,
    fontFamily: FontFamily.satoshiBold,
    marginBottom: 2,
  },
  bubbleText: { color: blackColor, fontSize: 13, lineHeight: 18 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  metaTime: { fontSize: 9 },
  systemWrap: { alignItems: "center", marginVertical: 10 },
  systemCard: {
    maxWidth: "85%",
    backgroundColor: orangeRGBAColor,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  systemTitle: {
    fontSize: 10,
    letterSpacing: 1,
    color: orangeColor,
    fontFamily: FontFamily.satoshiBold,
    marginBottom: 2,
  },
  systemBody: { fontSize: 12, color: blackColor, textAlign: "left" },
  systemTime: { fontSize: 9, color: orangeColor, marginTop: 2 },
  lockedBar: {
    paddingHorizontal: SPACE_16,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: lineColor,
    backgroundColor: whiteThirdColor,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACE_16,
    paddingTop: 10,
    paddingBottom: isAndroid ? SPACE_48 : SPACE_16,
    borderTopWidth: 1,
    borderTopColor: lineColor,
    backgroundColor: whiteColor,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: whiteThirdColor,
    borderWidth: 1,
    borderColor: lineColor,
    borderRadius: 22,
    paddingHorizontal: SPACE_16,
    paddingTop: 12,
    paddingBottom: 12,
    color: blackColor,
    fontFamily: FontFamily.satoshiRegular,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
