import {
  AnimatedPressable,
  FocusAwareStatusBar,
  Gap,
  TileNotif,
} from "@/components/ui";
import {
  bgColor,
  darkPrimaryColor,
  FontFamily,
  greyTextStyle,
  lineColor,
  mainContent,
  paddingScroll,
  primaryColor,
  screen,
  SPACE_16,
  SPACE_24,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import {
  getNotifService,
  onReadAllNotifService,
  onReadNotifService,
} from "@/services/notification.services";
import { useConfirmStore } from "@/stores/confirm.store";
import { useNotificationStore } from "@/stores/notification.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CheckCheck, ChevronLeft, Inbox } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const Notifikasi = () => {
  const toast = useToast();
  const [dataView, setDataView] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getData() {
    try {
      setLoading(true);
      const res = await getNotifService({ pageSize: 50 });
      setDataView(res?.data ?? res ?? []);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getData();
    } finally {
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = useCallback(
    async (item: any) => {
      console.log(item);
      const unread = item?.status
        ? item.status === "unread"
        : item?.isRead === false;
      try {
        if (unread) {
          await onReadNotifService(item);
          setDataView((prev) =>
            prev.map((n) =>
              n.id === item.id ? { ...n, status: "read", isRead: true } : n
            )
          );
          useNotificationStore.getState().refetch();
        }
        if (item?.link) {
          const orderId = item?.orderId ?? item?.order_id;
          router.push({
            pathname: "/transaksi-detail",
            params: { id: orderId },
          });
        } else {
          useConfirmStore.getState().show({
            title: item?.title ?? "Notifikasi",
            message: item?.body ?? item?.snipet ?? "-",
          });
        }
      } catch (err) {
        if (__DEV__) {
          console.log(err);
        }
        toast.warning("Perhatian", String(err));
      }
    },
    [toast]
  );

  const markAll = useCallback(async () => {
    try {
      await onReadAllNotifService();
      toast.success("Berhasil", "Semua notifikasi ditandai dibaca");
      getData();
      useNotificationStore.getState().refetch();
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
      toast.warning("Perhatian", String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const renderItemFlatlist = useCallback(
    ({ item }: any) => <TileNotif data={item} onPress={() => open(item)} />,
    [open]
  );

  const hasUnread = dataView.some((n) =>
    n?.status ? n.status === "unread" : n?.isRead === false
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <Text style={[greyTextStyle, { fontSize: 13 }]}>
            Memuat notifikasi...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.stateContainer}>
        <Inbox size={48} color={lineColor} />
        <Gap height={SPACE_16} />
        <Text style={[greyTextStyle, { fontSize: 13 }]}>
          Tidak ada notifikasi
        </Text>
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
          Notifikasi
        </Text>
      </View>
      {hasUnread ? (
        <View style={[styles.headerMark, { paddingVertical: 2 }]}>
          <AnimatedPressable onPress={markAll}>
            <View style={styles.markAllBtn}>
              <CheckCheck size={14} color={primaryColor} />
              <Gap width={6} />
              <Text
                style={[
                  { color: primaryColor },
                  { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                ]}
              >
                Tandai baca semua
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      ) : null}
      <View style={[mainContent]}>
        <FlatList
          data={dataView}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={[paddingScroll, { flexGrow: 1 }]}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </LinearGradient>
  );
};

export default Notifikasi;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: SPACE_16,
    paddingVertical: SPACE_16,
    alignItems: "center",
  },
  headerMark: {
    width: "100%",
    backgroundColor: bgColor,
    paddingVertical: SPACE_16,
    paddingHorizontal: SPACE_16,
    alignItems: "flex-end",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACE_24,
  },
});
