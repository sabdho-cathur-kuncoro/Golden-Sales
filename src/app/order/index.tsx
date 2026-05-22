import { Button, Gap, Header } from "@/components/ui";
import { OutletData } from "@/constants/dummy";
import {
  bgColor,
  blackColor,
  blackTextStyle,
  FontFamily,
  greyColor,
  greyTextStyle,
  lineColor,
  paddingScroll,
  primaryColor,
  primaryTextStyle,
  rowCenter,
  screen,
  SPACE_16,
  whiteColor,
} from "@/constants/theme";
import { useBottomSheetStore } from "@/features/shared/store/bottomSheet.store";
import { useGlobalStore } from "@/features/shared/store/global.store";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ChevronRight, MapPin, Search } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Order = () => {
  const openSheet = useBottomSheetStore((s) => s.open);
  const closeSheet = useBottomSheetStore((s) => s.close);
  const { setAddress } = useGlobalStore();

  const handleOpen = (outlet: any) => {
    const address = outlet?.list_address;
    const snapPoints = address?.length <= 2 ? ["55%"] : ["80%"];

    openSheet(
      <BottomSheetFlatList
        style={{ flex: 1 }}
        data={address}
        keyExtractor={(item: any) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setAddress(item);
              router.push({
                pathname: "/order/product",
                params: { address: JSON.stringify(item) },
              });
              closeSheet();
            }}
            style={[
              rowCenter,
              {
                width: "100%",
                borderWidth: 1,
                borderColor: lineColor,
                borderRadius: 10,
                padding: 10,
                marginBottom: 20,
              },
            ]}
          >
            <View
              style={{
                width: "15%",
                alignItems: "center",
              }}
            >
              <MapPin size={24} color={primaryColor} />
            </View>

            <View style={{ width: "83%" }}>
              <Text
                style={[
                  primaryTextStyle,
                  {
                    fontSize: 18,
                    fontFamily: FontFamily.satoshiMedium,
                  },
                ]}
              >
                {item?.name}
              </Text>

              <Gap height={4} />

              <Text style={[greyTextStyle, { fontSize: 12 }]}>
                {item?.address}
              </Text>
            </View>
          </Pressable>
        )}
      />,
      snapPoints,
      // header
      <>
        <Text
          style={[
            blackTextStyle,
            {
              fontFamily: FontFamily.satoshiMedium,
            },
          ]}
        >
          Pilih Alamat Tujuan
        </Text>

        <Gap height={10} />

        <Text style={[greyTextStyle, { fontSize: 12 }]}>
          Silakan tentukan alamat pengiriman untuk {outlet?.name}
        </Text>

        <Gap height={16} />
      </>,
      // footer
      <Button
        title="Batalkan"
        titleColor={greyTextStyle}
        border={1}
        borderColor={greyColor}
        bgColor={"transparent"}
        onPress={closeSheet}
      />
    );
  };

  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Buat Order"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[paddingScroll]}
      >
        <Text
          style={[blackTextStyle, { fontFamily: FontFamily.satoshiMedium }]}
        >
          Silakan Pilih Outlet
        </Text>
        <Gap height={SPACE_16} />
        <View style={[rowCenter, styles.searchInputContainer]}>
          <View style={{ width: "10%" }}>
            <Search size={18} color={blackColor} />
          </View>
          <TextInput
            placeholder="Cari nama outlet"
            placeholderTextColor={greyColor}
            numberOfLines={1}
            style={[blackTextStyle, { width: "88%" }]}
          />
        </View>
        <Gap height={SPACE_16} />
        {OutletData.map((item: any) => {
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                handleOpen(item);
              }}
              style={[
                rowCenter,
                {
                  width: "100%",
                  backgroundColor: whiteColor,
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: SPACE_16,
                },
              ]}
            >
              <View style={{ width: "85%" }}>
                <Text
                  style={[
                    blackTextStyle,
                    { fontFamily: FontFamily.satoshiMedium },
                  ]}
                >
                  {item.name}
                </Text>
                <Gap height={10} />
                <Text style={[greyTextStyle, { fontSize: 12 }]}>
                  {item.count_address} alamat
                </Text>
              </View>
              <View style={{ width: "12%", alignItems: "flex-end" }}>
                <ChevronRight size={28} color={blackColor} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Order;

const styles = StyleSheet.create({
  searchInputContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 40,
  },
});
