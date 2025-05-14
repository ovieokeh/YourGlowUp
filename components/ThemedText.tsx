import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useMemo } from "react";
import { StyleSheet, Text, type TextProps, TextStyle } from "react-native";

export type TypographyType = "default" | "defaultSemiBold" | "title" | "subtitle" | "label" | "caption" | "link";

export interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: TypographyType;
}

/**
 * Use for all text in the app. Supports semantic variants:
 *  • default        16/24
 *  • defaultSemiBold16/24, weight600
 *  • title          28/42, weight700
 *  • subtitle       18/28, weight600
 *  • label          14/22, weight600
 *  • caption        12/18, weight400
 *  • link           16/24, underline
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  allowFontScaling = true,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const typeStyle = useMemo<TextStyle>(() => typographyStyles[type] || typographyStyles.default, [type]);

  return <Text {...rest} allowFontScaling={allowFontScaling} style={[{ color }, typeStyle, style]} />;
}

const typographyStyles = StyleSheet.create<Record<TypographyType, TextStyle>>({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    lineHeight: 42,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400",
    opacity: 0.7,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
});
