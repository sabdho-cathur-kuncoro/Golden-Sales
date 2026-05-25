import {
  AnimatedPressable,
  Button,
  Gap,
  Header,
  TileCart,
} from "@/components/ui";
import { CartOrderDetail } from "@/constants/dummy";
import {
  blackTextStyle,
  blueColor,
  FontFamily,
  greyColor,
  greyTextStyle,
  line,
  lineColor,
  mainContent,
  orangeColor,
  paddingScroll,
  primaryColor,
  purpleRGBAColor,
  rowCenter,
  screen,
  shadow,
  SPACE_16,
  SPACE_24,
  SPACE_4,
  SPACE_8,
  whiteColor,
} from "@/constants/theme";
import { useConfirmStore } from "@/features/shared/store/confirm.store";
import { useInputModalStore } from "@/features/shared/store/input.store";
import { Info, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { currencyFormat } from "../../../utils/currencyFormat";
import { handleBack, wait } from "../../../utils/helper";

const Cart = () => {
  const { show } = useConfirmStore();
  const { showInput } = useInputModalStore();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [cartData, setCartData] = useState<any>([]);

  useEffect(() => {
    getCartData();
  }, []);

  async function getCartData() {
    setCartData(CartOrderDetail);
  }

  const handleDelete = (itemId: any, product: any) => {
    show({
      title: "Hapus Item",
      message: `Yakin ingin menghapus order ini? (${product?.name})`,
      type: "danger",
      onConfirm: async () => {
        // await deleteItem();
        console.log("DELETE", itemId);
      },
    });
  };

  const onHandleInputNote = () => {
    showInput({
      title: "Catatan Produk",
      placeholder: "Isi catatan...",
      onConfirm: async (value) => {
        console.log("Input:", value);

        // contoh API call
        // await saveNote(value);
      },
    });
  };

  const onHandleSelectAllItem = (catId: any) => {
    const temp = cartData.map((d: any) => {
      const isSameCategory = d?.id === catId;
      if (isSameCategory) {
        const item = d?.product.map((i: any) => {
          return {
            ...i,
            isProductSelected: !d?.isCategorySelected,
          };
        });
        return {
          ...d,
          isCategorySelected: !d?.isCategorySelected,
          product: item,
        };
      } else {
        return d;
      }
    });
    setCartData(temp);
  };
  const onHandleSelectItem = (catId: any, itemId: any) => {
    const temp = cartData.map((d: any) => {
      const isSameCategory = d?.id === catId;
      if (isSameCategory) {
        const item = d?.product.map((i: any) => {
          const isSameItem = i?.id === itemId;
          if (isSameItem) {
            return {
              ...i,
              isProductSelected: !i.isProductSelected,
            };
          } else {
            return i;
          }
        });
        const isAllItemSelected = item.every(
          (o: any) => o.isProductSelected === true
        );
        return {
          ...d,
          isCategorySelected: isAllItemSelected,
          product: item,
        };
      } else {
        return d;
      }
    });
    setCartData(temp);
  };

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
      const isItemSelected = item?.isCategorySelected;
      return (
        <>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AnimatedPressable onPress={() => onHandleSelectAllItem(item?.id)}>
              <View style={styles.radioContainer}>
                {isItemSelected ? (
                  <View style={[styles.radioFillContainer]} />
                ) : (
                  <></>
                )}
              </View>
            </AnimatedPressable>
            <Gap width={10} />
            <Text
              style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
            >
              {item?.categoryName} - {item?.subCategoryName}
            </Text>
          </View>
          <Gap height={SPACE_8} />
          {item?.product.map((p: any) => {
            return (
              <TileCart
                key={p?.id}
                data={p}
                onPressDelete={() => handleDelete(item?.id, p)}
                onTapNote={onHandleInputNote}
                onSelect={() => onHandleSelectItem(item?.id, p?.id)}
              />
            );
          })}
        </>
      );
    },
    [onHandleSelectItem, cartData]
  );

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={{ alignSelf: "center" }}>
          <Info size={72} color={blueColor} />
        </View>
        <Gap height={SPACE_8} />
        <Text style={[blackTextStyle, { fontSize: 18, textAlign: "center" }]}>
          Tidak ada pesanan di keranjang
        </Text>
        <Gap height={SPACE_24} />
        <View style={{ alignSelf: "center" }}>
          <Text style={[blackTextStyle]}>Tambah Keranjang</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Keranjang"} isCart onBack={() => handleBack("/home")} />
      <View style={[mainContent]}>
        {/* DELETE ALL */}
        <View
          style={[
            rowCenter,
            {
              paddingHorizontal: SPACE_16,
              paddingTop: SPACE_16,
              paddingBottom: SPACE_4,
            },
          ]}
        >
          <View style={styles.inputContainer}>
            <View style={styles.iconSearchContainer}>
              <Search size={18} color={primaryColor} />
            </View>
            <Gap width={16} />
            <TextInput
              style={[
                blackTextStyle,
                {
                  width: "80%",
                  height: 40,
                },
              ]}
              placeholder="Cari produk..."
              placeholderTextColor={greyColor}
            />
          </View>
          {/* <View
            style={{
              width: "14%",
              alignItems: "flex-end",
            }}
          >
            <Text style={[blackTextStyle]}>Filter</Text>
          </View> */}
        </View>
        <FlatList
          data={cartData}
          keyExtractor={keyExtractor}
          renderItem={renderItemFlatlist}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={[paddingScroll]}
        />
      </View>
      {cartData.length > 0 && (
        <View style={[shadow, styles.footer]}>
          <View
            style={{
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={[
                blackTextStyle,
                {
                  fontSize: 16,
                  fontFamily: FontFamily.satoshiBold,
                },
              ]}
            >
              {currencyFormat(600_000)}
            </Text>
          </View>
          <Gap height={10} />
          <View style={line} />
          <Gap height={10} />
          <View style={[rowCenter]}>
            <View
              style={{
                width: "25%",
              }}
            >
              <AnimatedPressable onPress={() => setSelectAll((prev) => !prev)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={[styles.radioContainer]}>
                    {selectAll ? (
                      <View style={[styles.radioFillContainer]} />
                    ) : (
                      <></>
                    )}
                  </View>
                  <Gap width={SPACE_8} />
                  <Text style={[greyTextStyle]}>Semua</Text>
                </View>
              </AnimatedPressable>
            </View>
            <View style={{ width: "74%" }}>
              <Button title="Buat Pesanan" />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  radioContainer: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: greyColor,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  radioFillContainer: {
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: orangeColor,
  },
  inputContainer: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: whiteColor,
    overflow: "hidden",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
    padding: 4,
  },
  iconSearchContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: purpleRGBAColor,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingTop: SPACE_24,
  },
  footer: {
    backgroundColor: whiteColor,
    paddingHorizontal: SPACE_16,
    paddingBottom: 40,
    paddingVertical: 10,
  },
});
