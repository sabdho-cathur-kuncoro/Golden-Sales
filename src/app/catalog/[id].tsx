import { Header } from "@/components/ui";
import TileItem from "@/components/ui/TileItem";
import {
  KatalogCategory,
  KatalogGlobalDetail,
  KatalogINDCategory,
  KatalogINDDetail,
} from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  mainContent,
  paddingScroll,
  primaryColor,
  screen,
  SPACE_16,
  whiteColor,
  whiteTextStyle,
} from "@/constants/theme";
import useCatalog from "@/features/catalog/hooks/useCatalog";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { wait } from "../../../utils/helper";

const itemWidth = 100;

const CatalogDetail = () => {
  const { id, name, slug } = useLocalSearchParams();
  const { detailCatalogItem, fetchDetailCatalog } = useCatalog();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [detail, setDetail] = useState<any>([]);
  const [category, setCategory] = useState<any>([]);

  const scrollViewCategoryRef = useRef<any>(null);

  useEffect(() => {
    getCategorySection();
    getDetail();
    fetchDetailCatalog(Number(id));
  }, []);

  const scrollToIndex = (index: number) => {
    const xOffset = index * itemWidth;
    scrollViewCategoryRef.current?.scrollTo({ x: xOffset, animated: true });
  };

  async function getDetail() {
    try {
      if (id === "5") {
        setDetail(KatalogINDDetail);
        return;
      }
      setDetail(KatalogGlobalDetail);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  async function getCategorySection() {
    try {
      if (id === "5") {
        setCategory(KatalogINDCategory);
        return;
      }
      setCategory(KatalogCategory);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  async function onHandleCategory(id: number) {
    try {
      const temp = category.map((data: any) => {
        if (data.id === id) {
          return {
            ...data,
            selected: !data.selected,
          };
        } else {
          return { ...data, selected: false };
        }
      });
      setCategory(temp);
    } catch (err) {
      if (__DEV__) {
        console.log(err);
      }
    }
  }
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    wait(1000).then(() => {
      fetchDetailCatalog(Number(id));
      setRefreshing(false);
    });
  }, []);

  const keyExtractor = useCallback(
    (item: any) => `${item.name}-${item.id}`,
    []
  );

  const renderItemFlatlist = useCallback(({ item }: any) => {
    return (
      <TileItem
        data={item}
        isService={id === "5" ? true : false}
        onPress={() => {}}
      />
    );
  }, []);
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={name} isIconVisible onBack={() => router.back()} />
      <View style={styles.header}>
        {/* CATEGORY */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            alignItems: "center",
          }}
        >
          {category.map((item: any) => {
            return (
              <Pressable
                onPress={() => onHandleCategory(item?.id)}
                key={item?.id}
                style={[
                  styles.categoryContainer,
                  {
                    backgroundColor: item?.selected ? primaryColor : whiteColor,
                  },
                ]}
              >
                <Text
                  style={[
                    item.selected ? whiteTextStyle : blackTextStyle,
                    { fontSize: 12, fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {item?.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={[mainContent]}>
        <FlatList
          data={detail}
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

export default CatalogDetail;

const styles = StyleSheet.create({
  header: {
    minHeight: 40,
    backgroundColor: bgColor,
    paddingHorizontal: SPACE_16,
    paddingTop: SPACE_16,
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 10,
  },
});
