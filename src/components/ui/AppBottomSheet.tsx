import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { BackHandler, View } from "react-native";

import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { SPACE_48 } from "@/constants/theme";
import { useBottomSheetStore } from "@/stores/bottomSheet.store";

export type AppBottomSheetRef = {
  expand: () => void;
  collapse: () => void;
  close: () => void;
};

const AppBottomSheet = forwardRef<AppBottomSheetRef>((_, ref) => {
  const sheetRef = useRef<BottomSheet>(null);

  const isOpen = useBottomSheetStore((s) => s.isOpen);
  const header = useBottomSheetStore((s) => s.header);
  const content = useBottomSheetStore((s) => s.content);
  const footer = useBottomSheetStore((s) => s.footer);
  const snapPointsStore = useBottomSheetStore((s) => s.snapPoints);
  const closeStore = useBottomSheetStore((s) => s.close);

  const snapPoints = useMemo(() => snapPointsStore, [snapPointsStore]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isOpen) {
        closeStore();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [isOpen, closeStore]);

  useImperativeHandle(ref, () => ({
    expand: () => sheetRef.current?.expand(),
    collapse: () => sheetRef.current?.collapse(),
    close: () => closeStore(),
  }));

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        closeStore();
      }
    },
    [closeStore]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <BottomSheet
          ref={sheetRef}
          index={snapPoints.length - 1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          onChange={handleSheetChanges}
        >
          {header && (
            <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
              {header}
            </View>
          )}
          {content}
          {footer && (
            <View style={{ paddingHorizontal: 16, paddingBottom: SPACE_48 }}>
              {footer}
            </View>
          )}
        </BottomSheet>
      )}
    </>
  );
});

AppBottomSheet.displayName = "AppBottomSheet";

export default AppBottomSheet;
