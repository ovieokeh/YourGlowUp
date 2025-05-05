import React from "react";
import { StyleSheet, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";

type ThemedTextInputProps = TextInputProps & {
  label?: string;
  lightColor?: string;
  darkColor?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
};

export function ThemedTextInput({
  label,
  lightColor,
  darkColor,
  style,
  containerStyle,
  labelStyle,
  ...rest
}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const borderColor = useThemeColor({}, "border");
  const placeholderColor = useThemeColor({}, "muted");

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>}
      <TextInput
        style={[styles.input, { backgroundColor, color: textColor, borderColor }, style]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
