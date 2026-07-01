import { Stack } from "expo-router";
import React from "react";

const ScanLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }} />
  );
};

export default ScanLayout;
