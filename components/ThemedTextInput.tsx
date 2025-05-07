import React from "react";
import { StyleSheet, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";

import { BorderRadii, Spacings } from "@/constants/Theme";
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
      {label && (
        <ThemedText type="subtitle" style={[styles.label, labelStyle]}>
          {label}
        </ThemedText>
      )}
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
    width: "100%",
  },
  label: {
    marginBottom: Spacings.xs,
  },
  input: {
    paddingHorizontal: Spacings.md,
    paddingVertical: Spacings.sm,
    fontSize: 16,
    borderRadius: BorderRadii.md,
    borderWidth: 1,
  },
});
