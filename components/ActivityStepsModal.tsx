import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { ActivityType, GoalActivity } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { DEFAULT_ACTIVITIES } from "@/constants/Goals";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";

interface Props {
  visible: boolean;
  selectedSlugs: string[];
  onClose: () => void;
  onSave: (selected: GoalActivity[]) => void;
}

export const ActivityStepsModal = ({ visible, selectedSlugs, onClose, onSave }: Props) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ActivityType>("all");
  const [categoryFilter, setAreaFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSlugs.map((id) => id.toString())));

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const areas = useMemo(() => Array.from(new Set(DEFAULT_ACTIVITIES.map((i) => i.category))), []);
  const fuse = useMemo(() => new Fuse(DEFAULT_ACTIVITIES, { keys: ["name", "category"] }), []);

  const matches = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : [...DEFAULT_ACTIVITIES];
    if (typeFilter !== "all") {
      list = list.filter((activity) => activity.type === typeFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((activity) => activity.category === categoryFilter);
    }
    return list;
  }, [query, fuse, typeFilter, categoryFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleSave = () => {
    const selectedItems = DEFAULT_ACTIVITIES.filter((i) => selected.has(i.slug));
    onSave(selectedItems);
    setSelected(new Set());
    setQuery("");
    setTypeFilter("all");
    setAreaFilter("all");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <ThemedView style={styles.container}>
        <ThemedView style={{ gap: Spacings.sm }}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={{ flex: 1 }}>
              Update Goal
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
                ...Object.values(ActivityType).map((type) => ({ label: type, value: type })),
              ]}
              selectedValue={typeFilter}
              onValueChange={(v) => setTypeFilter(v)}
              style={styles.picker}
            />
            <ThemedPicker
              items={[{ label: "All Areas", value: "all" }, ...areas.map((area) => ({ label: area, value: area }))]}
              selectedValue={categoryFilter}
              onValueChange={(v) => setAreaFilter(v)}
              style={styles.picker}
            />
          </View>
        </ThemedView>

        <FlatList
          data={matches}
          keyExtractor={(activity) => activity.slug}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacings.sm }}
          contentContainerStyle={{ padding: Spacings.md, paddingBottom: 96 }}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.slug);
            return (
              <View style={[styles.activity, { borderColor }]}>
                {item.featuredImage && (
                  <Image
                    source={item.featuredImage}
                    style={{ width: "100%", height: 120, borderRadius: BorderRadii.sm }}
                    contentFit="cover"
                  />
                )}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                </View>
                <ThemedText style={{ opacity: 0.6 }}>{item.category}</ThemedText>

                <View style={{ marginTop: Spacings.sm }}>
                  <ThemedButton
                    variant="ghost"
                    title={isSelected ? "Remove" : "Add"}
                    onPress={() => toggleSelect(item.slug)}
                    icon="plus.circle"
                    textStyle={{ color: isSelected ? Colors.light.danger : Colors.light.accent }}
                  />
                </View>
              </View>
            );
          }}
        />

        <ThemedButton
          title={`Update Goal (${selected.size} activitys)`}
          onPress={handleSave}
          style={styles.saveButton}
          disabled={selected.size === 0}
        />
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Spacings.xl * 2,
    gap: Spacings.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacings.lg,
  },
  clearButton: {
    position: "absolute",
    right: 0,
    bottom: "8%",
    paddingHorizontal: Spacings.sm,
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
  activity: {
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
