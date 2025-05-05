import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export type ThemedButtonVariant = "solid" | "outline" | "ghost" | "primary" | "destructive" | "success";

export type ThemedButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ThemedButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: IconSymbolName;
  iconPlacement?: "left" | "right";
};

export function ThemedButton({
  title,
  onPress,
  variant = "solid",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPlacement = "left",
}: ThemedButtonProps) {
  const themeTextColor = useThemeColor({}, "text");

  const getStyles = (): { button: ViewStyle; textColor: string } => {
    switch (variant) {
      case "solid":
        return {
          button: { backgroundColor: Colors.dark.accent },
          textColor: themeTextColor,
        };
      case "outline":
        return {
          button: {
            backgroundColor: "transparent",
            borderColor: Colors.dark.border,
            borderWidth: 1.5,
          },
          textColor: themeTextColor,
        };
      case "primary":
        return {
          button: { backgroundColor: Colors.dark.accent },
          textColor: themeTextColor,
        };
      case "destructive":
        return {
          button: { backgroundColor: Colors.dark.danger },
          textColor: themeTextColor,
        };
      case "success":
        return {
          button: { backgroundColor: Colors.dark.success },
          textColor: themeTextColor,
        };

      case "ghost":
      default:
        return {
          button: { backgroundColor: "transparent" },
          textColor: themeTextColor,
        };
    }
  };

  const { button, textColor } = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.base, button, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon && iconPlacement === "left" && (
            <IconSymbol name={icon} size={18} color={textColor} style={styles.iconLeft} />
          )}
          <ThemedText style={[styles.text, { color: textColor }, textStyle]}>{title}</ThemedText>
          {icon && iconPlacement === "right" && (
            <IconSymbol name={icon} size={18} color={textColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
