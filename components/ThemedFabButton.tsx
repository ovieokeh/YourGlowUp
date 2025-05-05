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
      variant="solid"
      style={{
        ...styles.fab,
        bottom: props.bottom ?? 92,
        right: props.right ?? 8,
        left: props.left,
        top: props.top,
        borderRadius: 32,
      }}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 92,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
