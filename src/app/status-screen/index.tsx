import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import StatusScreen from "./StatusScreen";

type ActionType = "go-home" | "go-back" | "go-transaction" | "close";

const StatusPage = () => {
  const {
    type,
    title,
    message,
    primaryActionType,
    primaryActionTitle,
    secondaryActionType,
    secondaryActionTitle,
  } = useLocalSearchParams();

  const handleAction = (actionType?: string | string[]) => {
    switch (actionType as ActionType) {
      case "go-home":
        router.dismissAll();
        router.replace("/home");
        break;

      case "go-transaction":
        router.dismissAll();
        router.replace("/transaksi");
        break;

      case "go-back":
        router.back();
        break;

      case "close":
        router.dismissAll();
        break;

      default:
        router.back();
        break;
    }
  };
  return (
    <StatusScreen
      type={type as any}
      title={String(title)}
      message={String(message)}
      primaryAction={{
        title: String(primaryActionTitle),
        onPress: () => handleAction(primaryActionType),
      }}
      secondaryAction={
        secondaryActionType && secondaryActionTitle
          ? {
              title: String(secondaryActionTitle),
              onPress: () => handleAction(secondaryActionType),
            }
          : undefined
      }
    />
  );
};

export default StatusPage;

const styles = StyleSheet.create({});
