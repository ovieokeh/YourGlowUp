import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { Exercise, EXERCISES, Task, TASKS } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  visible: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSave: (selected: (Exercise | Task)[]) => void;
}

const allItems = [...EXERCISES, ...TASKS];
export const RoutineItemsModal = ({ visible, selectedIds, onClose, onSave }: Props) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "exercise" | "task">("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds.map((id) => id.toString())));

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const areas = useMemo(() => Array.from(new Set(allItems.map((i) => i.area))), []);
  const fuse = useMemo(() => new Fuse(allItems, { keys: ["name", "area"] }), []);

  const matches = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : [...allItems];
    if (typeFilter !== "all") {
      list = list.filter((item) => item.type === typeFilter);
    }
    if (areaFilter !== "all") {
      list = list.filter((item) => item.area === areaFilter);
    }
    return list;
  }, [query, fuse, typeFilter, areaFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSave = () => {
    const selectedItems = allItems.filter((i) => selected.has(i.itemId));
    onSave(selectedItems);
    setSelected(new Set());
    setQuery("");
    setTypeFilter("all");
    setAreaFilter("all");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.header}>
        <ThemedText type="subtitle" style={{ flex: 1 }}>
          Update Routine
        </ThemedText>
        <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <ThemedTextInput value={query} onChangeText={setQuery} placeholder="Search..." style={[styles.input]} />
        <ThemedButton
          title=""
          disabled={!query}
          onPress={() => setQuery("")}
          style={styles.clearButton}
          icon="x.circle"
          variant="ghost"
        />
      </View>

      <View style={styles.filters}>
        <ThemedPicker
          items={[
            { label: "All Types", value: "all" as const },
            { label: "Exercises", value: "exercise" as const },
            { label: "Tasks", value: "task" as const },
          ]}
          selectedValue={typeFilter}
          onValueChange={(v) => setTypeFilter(v)}
          style={styles.picker}
        />
        <ThemedPicker
          items={[{ label: "All Areas", value: "all" }, ...areas.map((area) => ({ label: area, value: area }))]}
          selectedValue={areaFilter}
          onValueChange={(v) => setAreaFilter(v)}
          style={styles.picker}
        />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.itemId}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacings.sm }}
        contentContainerStyle={{ padding: Spacings.md, paddingBottom: 96 }}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.itemId);
          return (
            <View style={[styles.item, { borderColor }]}>
              {item.featureImage && (
                <Image
                  source={item.featureImage}
                  style={{ width: "100%", height: 120, borderRadius: BorderRadii.sm }}
                  contentFit="cover"
                />
              )}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              </View>
              <ThemedText style={{ opacity: 0.6 }}>{item.area}</ThemedText>

              <View style={{ marginTop: Spacings.sm }}>
                <ThemedButton
                  variant="ghost"
                  title={isSelected ? "Remove" : "Add"}
                  onPress={() => toggleSelect(item.itemId)}
                  icon="plus.circle"
                  textStyle={{ color: isSelected ? Colors.light.danger : Colors.light.accent }}
                />
              </View>
            </View>
          );
        }}
      />

      <ThemedButton
        title={`Add ${selected.size} to Routine`}
        onPress={handleSave}
        style={styles.saveButton}
        disabled={selected.size === 0}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacings.lg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: Spacings.md,
  },
  input: {
    borderRadius: BorderRadii.sm,
    maxWidth: "90%",
  },
  clearButton: {
    position: "absolute",
    right: "2%",
    bottom: "30%",
    paddingHorizontal: Spacings.sm,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacings.sm,
    paddingHorizontal: Spacings.md,
  },
  picker: {
    flex: 1,
    height: 44,
  },
  item: {
    padding: Spacings.sm,
    marginBottom: Spacings.sm,
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    justifyContent: "space-between",
    flexGrow: 1,
  },
  saveButton: {
    margin: Spacings.md,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
