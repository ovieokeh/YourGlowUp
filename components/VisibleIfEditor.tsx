import { ActivityDependency, ActivityStep } from "@/backend/shared";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedButton } from "./ThemedButton";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface VisibleIfEditorProps {
  initialDependencies?: ActivityDependency[];
  possibleDependencies?: ActivityStep[];
  dependencyLabel?: string;
  onChange: (dependencies: ActivityDependency[]) => void;
}

export const VisibleIfEditor: React.FC<VisibleIfEditorProps> = ({
  initialDependencies = [],
  possibleDependencies = [],
  dependencyLabel = "Step",
  onChange,
}) => {
  const borderColor = useThemeColor({}, "border");
  const [dependencies, setDependencies] = useState<ActivityDependency[]>([]);

  useEffect(() => {
    setDependencies(
      initialDependencies.map((dep, index) => {
        return { ...dep, id: `dep-${index}-${Date.now()}` };
      })
    );
  }, [initialDependencies]);

  const updateDependency = (index: number, field: keyof ActivityDependency, value: any) => {
    const newDeps = [...dependencies];
    const depToUpdate = { ...newDeps[index], [field]: value };

    newDeps[index] = depToUpdate;
    setDependencies(newDeps);
    onChange(newDeps.map(({ ...rest }) => rest)); // Pass up the original PromptDependency structure
  };

  const addDependency = () => {
    const newDep: ActivityDependency = {
      slug: "",
    };
    const newDeps = [...dependencies, newDep];
    setDependencies(newDeps);
    onChange(newDeps.map(({ ...rest }) => rest));
  };

  const removeDependency = (index: number) => {
    const newDeps = dependencies.filter((_, i) => i !== index);
    setDependencies(newDeps);
    onChange(newDeps.map(({ ...rest }) => rest));
  };

  if (!possibleDependencies || possibleDependencies.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor }]}>
      <ThemedText type="subtitle">Does this depend on any previous {dependencyLabel}?</ThemedText>
      {dependencies.map((dep, index) => (
        <View key={dep.slug} style={[styles.dependencyItem, { borderColor }]}>
          <View style={styles.row}>
            <ThemedText style={styles.label}>{dependencyLabel}:</ThemedText>
            <ThemedPicker
              selectedValue={dep.slug}
              style={[styles.picker, styles.flexInput]}
              onValueChange={(itemValue) => updateDependency(index, "slug", itemValue)}
              items={possibleDependencies.map((item) => ({ label: item.slug, value: item.slug }))}
            />
          </View>

          <TouchableOpacity onPress={() => removeDependency(index)} style={styles.removeButton}>
            <IconSymbol name="trash" size={22} color="red" />
            <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
          </TouchableOpacity>
        </View>
      ))}
      <ThemedButton variant="outline" title={`Add required ${dependencyLabel}`} onPress={addDependency} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacings.md,
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    marginBottom: Spacings.lg,
    gap: Spacings.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacings.md,
  },
  dependencyItem: {
    padding: Spacings.sm,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: Spacings.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacings.sm,
  },
  label: {
    fontSize: 14,
    marginRight: Spacings.sm,
    width: 80, // Fixed width for labels for alignment
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: Spacings.md,
    paddingVertical: Spacings.sm,
    borderRadius: 4,
    fontSize: 14,
    alignSelf: "flex-start",
  },
  flexInput: {
    flex: 1, // Make input take remaining space
  },
  picker: {
    flex: 1, // Make picker take remaining space
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
  },
  switchAlign: {
    alignSelf: "flex-start", // Align switch to the left in its container
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacings.sm,
    marginTop: Spacings.sm,
    borderRadius: BorderRadii.sm,
  },
  removeButtonText: {
    marginLeft: Spacings.sm,
    fontSize: 14,
  },
});
