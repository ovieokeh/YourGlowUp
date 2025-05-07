import { BorderRadii, Spacings } from "@/constants/Theme";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedButton, ThemedButtonProps } from "./ThemedButton";

export function ThemedFabButton(
  props: ThemedButtonProps & {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
    borderRadius?: number;
  }
) {
  return (
    <ThemedButton
      {...props}
      style={{
        ...styles.fab,
        bottom: props.bottom ?? Spacings.xl * 2,
        right: props.right ?? Spacings.md,
        left: props.left,
        top: props.top,
        borderRadius: props.borderRadius ?? BorderRadii.lg,
        ...props.style,
      }}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    paddingHorizontal: Spacings.md,
    paddingVertical: Spacings.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
