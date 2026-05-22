import {
  AnimatedPressable,
  Header,
  TileChat,
  TileNotif,
} from "@/components/ui";
import { ChatData, NotifCategory, NotifData } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  lineColor,
  mainContent,
  paddingScroll,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { generateChat, wait } from "../../../utils/helper";

const Notifikasi = () => {
  const [sectionSelected, setSectionSelected] = useState("");
  const [section, setSection] = useState(NotifCategory);
  const [dataView, setDataView] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setSectionCategory();
    getData("Notifikasi");
  }, []);

  async function setSectionCategory() {
    setSection(NotifCategory);
    setSectionSelected("Notifikasi");
  }

  async function getData(sectionTitle: string) {
    try {
      if (sectionTitle === "Notifikasi") {
        setDataView(NotifData);
      } else {
        const formatChatData = generateChat(ChatData);
        setDataView(formatChatData);
      }
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }

  async function handleCategory(title: string) {
    try {
      const temp = section.map((data) => {
        if (data?.title === title) {
          return {
            ...data,
            isSelected: true,
          };
        } else {
          return { ...data, isSelected: false };
        }
      });
      setSectionSelected(title);
      setSection(temp);
      getData(title);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    wait(1000).then(() => {
      setRefreshing(false);
    });
  }, []);

  const keyExtractor = useCallback(
    (item: any) => `${item.name}-${item.id}`,
    []
  );

  const renderItemFlatlist = useCallback(
    ({ item }: any) => {
      return sectionSelected === "Notifikasi" ? (
        <TileNotif data={item} />
      ) : (
        <TileChat
          data={item}
          onPress={() =>
            router.push({
              pathname: "/notifikasi/[id]",
              params: { id: item?.order_id },
            })
          }
        />
      );
    },
    [sectionSelected]
  );
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Notifikasi"} onBack={() => router.back()} />
      <View style={styles.header}>
        <View style={[styles.tabContainer, rowCenter]}>
          {section.map((item: any) => {
            return (
              <View
                key={item.id}
                style={[
                  styles.half,
                  styles.btnWrapper,
                  {
                    backgroundColor: item?.isSelected
                      ? primaryColor
                      : whiteColor,
                  },
                ]}
              >
                <AnimatedPressable onPress={() => handleCategory(item?.title)}>
                  <View style={styles.btnContent}>
                    <Text
                      style={[
                        item?.isSelected ? whiteTextStyle : blackTextStyle,
                      ]}
                    >
                      {item?.title}
                    </Text>
                  </View>
                </AnimatedPressable>
              </View>
            );
          })}
        </View>
      </View>
      <View style={[mainContent]}>
        <FlatList
          data={dataView}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={[paddingScroll]}
        />
      </View>
    </View>
  );
};

export default Notifikasi;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: bgColor,
    paddingVertical: SPACE_16,
  },
  tabContainer: {
    width: "80%",
    minHeight: 40,
    backgroundColor: whiteColor,
    padding: 6,
    borderRadius: 57,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: lineColor,
  },
  half: {
    width: "49%",
    minHeight: 32,
  },
  btnWrapper: {
    borderRadius: 42,
    borderWidth: 1,
    borderColor: primaryColor,
    overflow: "hidden",
  },
  btnContent: {
    width: "100%",
    height: 28,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
