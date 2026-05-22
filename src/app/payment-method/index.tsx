import IconCOD from "@/assets/icons/ic-cod.svg";
import IconTransfer from "@/assets/icons/ic-payment-method.svg";
import { Gap, Header } from "@/components/ui";
import { PaymentMethodData } from "@/constants/dummy";
import {
  bgColor,
  blackTextStyle,
  FontFamily,
  greenColor,
  line,
  lineColor,
  paddingScroll,
  primaryColor,
  rowCenter,
  screen,
  SPACE_16,
  strokeColor,
  whiteColor,
} from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const PaymentMethod = () => {
  return (
    <View style={[screen, { backgroundColor: whiteColor }]}>
      <Header title={"Metode Pembayaran"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[paddingScroll]}
      >
        {PaymentMethodData.map((data: any, index: any) => {
          const isLast = index === PaymentMethodData.length - 1;
          const isBank = data?.name.includes("Bank");
          return (
            <View
              key={data.id}
              style={[
                styles.cardContainer,
                { marginBottom: isLast ? 0 : SPACE_16 },
              ]}
            >
              <View style={[rowCenter]}>
                <View
                  style={{
                    width: "85%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "15%" }}>
                    {isBank ? (
                      <IconTransfer width={24} color={primaryColor} />
                    ) : (
                      <IconCOD width={24} color={primaryColor} />
                    )}
                  </View>
                  <View style={{ width: "84%" }}>
                    <Text
                      style={[
                        blackTextStyle,
                        { fontFamily: FontFamily.satoshiMedium },
                      ]}
                    >
                      {data.name}
                    </Text>
                  </View>
                </View>
                <View style={{ width: "14%", alignItems: "flex-end" }}>
                  <View style={styles.dotContainer}>
                    {data?.is_selected ? <View style={styles.dotFill} /> : null}
                  </View>
                </View>
              </View>
              {data?.is_collapsible ? (
                <>
                  <Gap height={SPACE_16} />
                  <View style={[line]} />
                  <Gap height={SPACE_16} />
                  <View></View>
                  {data?.bank_list.map((item: any, index: any) => {
                    const isLastItem = index === data.bank_list.length - 1;
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.tileBankContainer,
                          rowCenter,
                          {
                            marginBottom: isLastItem ? 0 : SPACE_16,
                          },
                        ]}
                      >
                        <View
                          style={[
                            {
                              width: "80%",
                            },
                            rowCenter,
                          ]}
                        >
                          <View style={{ width: "20%" }}>
                            <Image
                              source={item.img}
                              style={{ width: 40, height: 20 }}
                              contentFit="contain"
                            />
                          </View>
                          <View style={{ width: "75%" }}>
                            <Text
                              style={[
                                blackTextStyle,
                                { fontFamily: FontFamily.satoshiMedium },
                              ]}
                            >
                              {item?.name}
                            </Text>
                          </View>
                        </View>
                        <View style={{ width: "19%", alignItems: "flex-end" }}>
                          {item?.is_bank_selected ? (
                            <Check size={16} color={greenColor} />
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PaymentMethod;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: whiteColor,
    padding: SPACE_16,
    marginBottom: SPACE_16,
    borderRadius: 10,
  },
  dotContainer: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: strokeColor,
    alignItems: "center",
    justifyContent: "center",
  },
  dotFill: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: greenColor,
  },
  tileBankContainer: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lineColor,
  },
});
