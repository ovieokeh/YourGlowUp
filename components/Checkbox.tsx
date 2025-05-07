import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface CheckboxProps {
  onPress: () => void;
  checked: boolean;
  label?: string;
  style?: {
    width?: number;
    height?: number;
    borderRadius?: number;
  };
}

export const Checkbox = ({ onPress, checked, label, style = {} }: CheckboxProps) => {
  const inputTextColor = useThemeColor({}, "text");
  const backgroundActive = useThemeColor({ light: Colors.light.accent, dark: Colors.dark.accent }, "accent");

  return (
    <Pressable onPress={onPress} style={styles.checkbox}>
      <View
        style={{
          width: style?.width || 18,
          height: style?.height || 18,
          borderRadius: style?.borderRadius || BorderRadii.xs,
          borderWidth: 1,
          borderColor: checked ? "transparent" : inputTextColor,
          backgroundColor: checked ? backgroundActive : "transparent",
        }}
      />
      {label && <ThemedText>{label}</ThemedText>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
  },
});
