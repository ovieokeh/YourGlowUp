import { Ionicons } from "@expo/vector-icons";
import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { Activity, GoalCategory } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { DEFAULT_ACTIVITIES } from "@/constants/Goals";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import { ActivityCard } from "../ActivityCard";
import { ThemedView } from "../ThemedView";

interface Props {
  goalId: string;
  visible: boolean;
  selectedSlugs: string[];
  defaultCategory?: GoalCategory;
  onClose: () => void;
  onSave: (selected: Omit<Activity, "goalId">[]) => void;
}

export const ActivityStepsModal = ({ goalId, visible, selectedSlugs, defaultCategory, onClose, onSave }: Props) => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setAreaFilter] = useState<string>(defaultCategory || "all");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSlugs.map((id) => id.toString())));

  const textColor = useThemeColor({}, "text");
  const areas = useMemo(() => Array.from(new Set(DEFAULT_ACTIVITIES.map((i) => i.category))), []);
  const fuse = useMemo(() => new Fuse(DEFAULT_ACTIVITIES, { keys: ["name", "category"] }), []);

  const matches = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : [...DEFAULT_ACTIVITIES];
    if (categoryFilter !== "all") {
      list = list.filter((activity) => activity.category === categoryFilter);
    }
    return list;
  }, [query, fuse, categoryFilter]);

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
    setAreaFilter("all");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <ThemedView style={styles.container}>
        <View style={{ gap: Spacings.sm }}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={{ flex: 1 }}>
              Activities
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              paddingHorizontal: Spacings.md,
              gap: Spacings.sm,
              marginBottom: Spacings.md,
              alignItems: "center",
            }}
          >
            <ThemedButton
              title="Create New Activity"
              icon="plus"
              onPress={() => {
                onClose();
                router.push({
                  pathname: "/(tabs)/goals/upsert-activity",
                  params: { goalId },
                });
              }}
            />
            <ThemedText>Or explore these suggested activities</ThemedText>
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
              items={[{ label: "All Areas", value: "all" }, ...areas.map((area) => ({ label: area, value: area }))]}
              selectedValue={categoryFilter}
              onValueChange={(v) => setAreaFilter(v)}
              style={styles.picker}
            />
          </View>
        </View>

        <FlatList
          data={matches}
          keyExtractor={(activity) => activity.slug}
          numColumns={1}
          contentContainerStyle={{ gap: Spacings.md, padding: Spacings.md, paddingBottom: 96 }}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.slug);
            return (
              <ActivityCard
                item={item as Activity}
                actions={[]}
                hiddenFields={["info"]}
                topContent={
                  <ThemedButton
                    variant="ghost"
                    icon={isSelected ? "checkmark.circle.fill" : "circle"}
                    onPress={() => toggleSelect(item.slug)}
                  />
                }
              />
            );
          }}
        />

        <ThemedButton
          title={`Update Goal (${selected.size} ${
            selected.size === 0 || selected.size > 1 ? "activities" : "activity"
          })`}
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
  saveButton: {
    margin: Spacings.md,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
