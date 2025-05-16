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

import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export type ThemedButtonVariant = "solid" | "outline" | "ghost" | "primary" | "destructive" | "success";

export type ThemedButtonProps = {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ThemedButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: IconSymbolName;
  iconPlacement?: "left" | "right";
  iconSize?: number;
};

export function ThemedButton({
  title,
  onPress,
  variant = "solid",
  loading = false,
  disabled = false,
  active = false,
  style,
  textStyle,
  icon,
  iconPlacement = "left",
  iconSize = 18,
}: ThemedButtonProps) {
  const currentTheme = useThemeColor({}, "background") === Colors.dark.background ? "dark" : "light";
  const theme = Colors[currentTheme];

  const getStyles = (): { button: ViewStyle; textColor: string } => {
    switch (variant) {
      case "solid":
      case "primary":
        return {
          button: { backgroundColor: theme.tint },
          textColor: textStyle?.color ?? currentTheme === "dark" ? Colors.dark.background : Colors.light.background,
        };
      case "outline":
        return {
          button: {
            backgroundColor: "transparent",
            borderColor: theme.border,
            borderWidth: 1.5,
          },
          textColor: (textStyle?.color as string) ?? theme.text,
        };
      case "destructive":
        return {
          button: { backgroundColor: theme.danger },
          textColor:
            (textStyle?.color as string) ?? currentTheme === "dark" ? Colors.dark.background : Colors.light.background,
        };
      case "success":
        return {
          button: { backgroundColor: theme.success },
          textColor:
            (textStyle?.color as string) ?? currentTheme === "dark" ? Colors.dark.background : Colors.light.background,
        };
      case "ghost":
      default:
        return {
          button: { backgroundColor: "transparent" },
          textColor: (textStyle?.color as string) ?? theme.text,
        };
    }
  };

  const { button, textColor } = getStyles();

  const activeStyles = {
    backgroundColor: variant === "outline" ? theme.border : theme.accent,
    borderColor: variant === "outline" ? theme.border : undefined,
    borderWidth: variant === "outline" ? 1.5 : undefined,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.base, button, disabled && styles.disabled, style, active && activeStyles]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon && iconPlacement === "left" && <IconSymbol name={icon} size={iconSize} color={textColor} style={{}} />}
          {title && (
            <ThemedText
              style={[
                styles.text,
                { color: textColor },
                textStyle,
                active && {
                  color: ["ghost"].includes(variant)
                    ? Colors.light.text
                    : ["outline"].includes(variant)
                    ? Colors.dark.accent
                    : textColor,
                },
              ]}
            >
              {title}
            </ThemedText>
          )}
          {icon && iconPlacement === "right" && <IconSymbol name={icon} size={iconSize} color={textColor} style={{}} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.md,
    borderRadius: BorderRadii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
