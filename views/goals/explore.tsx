import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { GoalCard } from "@/components/GoalCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { DEFAULT_GOALS } from "@/constants/Goals";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

export const GoalsExploreView = () => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setAreaFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set([]));

  // const goalsQuery = useGetPublicGoals();
  // const { data: goals = [] } = goalsQuery;
  const goals = DEFAULT_GOALS;

  console.log("goals", goals);

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const areas = useMemo(() => Array.from(new Set(goals.map((i) => i.category))), [goals]);
  const fuse = useMemo(() => new Fuse(goals, { keys: ["name", "category"] }), [goals]);

  const matches = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : [...goals];
    if (categoryFilter !== "all") {
      list = list.filter((activity) => activity.category === categoryFilter);
    }
    return list;
  }, [query, fuse, categoryFilter, goals]);

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
    // @TODO: do something with selectedItems
    setSelected(new Set());
    setQuery("");
    setAreaFilter("all");
  };

  return (
    <View style={styles.container}>
      <View style={{ gap: Spacings.sm }}>
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

      {matches.map((item) => {
        const isSelected = selected.has(item.slug);
        return (
          <GoalCard
            key={item.slug}
            item={item}
            actions={["preview"]}
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
      })}

      <ThemedButton
        title={`Update Goal (${selected.size} ${selected.size === 0 || selected.size > 1 ? "activities" : "activity"})`}
        onPress={handleSave}
        style={styles.saveButton}
        disabled={selected.size === 0}
      />
    </View>
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
  },
  input: {
    borderRadius: BorderRadii.sm,
    maxWidth: "90%",
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacings.sm,
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
