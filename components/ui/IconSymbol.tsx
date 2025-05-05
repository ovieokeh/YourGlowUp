// This file is a fallback for using MaterialIcons on Android and web.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  "chevron.right": "chevron-right",
  "chart.xyaxis.line": "chart-line",
  gear: "cog",
  mouth: "emoticon-happy-outline",
  "checkmark.circle": "check-circle",
  "xmark.circle": "close-circle",
  "face.smiling": "emoticon-happy-outline",
  "face.smiling.fill": "emoticon-happy",
  "x.circle": "close-circle-outline",
  "arrow.backward": "chevron-left",
  "sun.max": "weather-sunny",
  "moon.fill": "weather-night",
  "automatic.brakesignal": "car-brake-alert",
  "arrow.triangle.2.circlepath.circle": "sync",
  "person.crop.circle.badge.checkmark": "account-check",
  "clock.arrow.2.circlepath": "clock-time-four",
  "bell.badge": "bell-alert",
  "star.circle": "star-circle",
  "person.3.sequence": "account-multiple",
} as Partial<
  Record<import("expo-symbols").SymbolViewProps["name"], React.ComponentProps<typeof MaterialCommunityIcons>["name"]>
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialCommunityIcons color={color} size={size} name={MAPPING[name]} style={style as any} />;
}
