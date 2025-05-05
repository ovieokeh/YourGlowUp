import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useCallback, useState } from "react";
import { FlatList, Modal, Pressable, StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { IconSymbol } from "./ui/IconSymbol";

export interface PickerItem<T> {
  label: string;
  value: T;
}

export interface CustomPickerProps<T> {
  items: PickerItem<T>[];
  selectedValue: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function ThemedPicker<T extends unknown>({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select…",
  style,
  itemStyle,
  labelStyle,
}: CustomPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");

  const selectedItem = items.find((i) => i.value === selectedValue);
  const displayLabel = selectedItem?.label ?? placeholder;

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const select = useCallback(
    (value: T) => {
      onValueChange(value);
      setOpen(false);
    },
    [onValueChange]
  );

  return (
    <>
      <Pressable
        onPress={toggle}
        style={[
          styles.input,
          { backgroundColor: background, borderColor: border },
          open && { borderColor: accent },
          style,
        ]}
      >
        <ThemedText style={[styles.inputLabel, { color: text }, labelStyle]}>{displayLabel}</ThemedText>
        <IconSymbol name={open ? "chevron.up" : "chevron.down"} size={20} color={text} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[styles.dropdown, { backgroundColor: background, borderColor: border }]}
          >
            <FlatList
              data={items}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item.value)}
                  style={[
                    styles.option,
                    { backgroundColor: item.value === selectedValue ? accent : background },
                    itemStyle,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      { color: item.value === selectedValue ? Colors.dark.background : text },
                      labelStyle,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              )}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.md,
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    alignSelf: "center",
    gap: Spacings.sm,
  },
  inputLabel: {
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
  },
  dropdown: {
    marginHorizontal: Spacings.lg,
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    maxHeight: "50%",
    overflow: "hidden",
  },
  option: {
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.md,
  },
  optionLabel: {
    fontSize: 16,
  },
});
