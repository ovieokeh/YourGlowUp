import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { EXERCISES, TASKS } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUpdateRoutine } from "@/queries/routines";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

interface FaceAnalysisActionsViewProps {
  analysisResults: {
    symmetry: string;
    jawline: string;
    skin: string;
    recommendations: string[];
  };
}

const RecomendationsRenderer = ({
  analysisResults,
  setSelected,
  selected,
}: {
  analysisResults: FaceAnalysisActionsViewProps["analysisResults"];
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  selected: Set<string>;
}) => {
  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const accent = useThemeColor({}, "accent");
  const border = useThemeColor({}, "border");

  return (
    <View style={{ gap: Spacings.sm }}>
      {analysisResults.recommendations.map((rec) => {
        const exercise = EXERCISES.find((e) => e.slug === rec);
        const task = TASKS.find((t) => t.slug === rec);
        const item = exercise || task;

        if (!item) return null;

        return (
          <Pressable
            key={rec}
            onPress={() => toggleSelection(rec)}
            style={[
              styles.itemRow,
              {
                borderColor: border,
                backgroundColor: selected.has(rec) ? Colors.light.accent + "10" : "transparent",
              },
            ]}
          >
            <Image source={{ uri: item.featureImage }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 2 }}>
                {item.name}
              </ThemedText>
              <ThemedText type="default" style={{ fontSize: 13 }} numberOfLines={2}>
                {item.description}
              </ThemedText>
            </View>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: selected.has(rec) ? accent : border,
                  backgroundColor: selected.has(rec) ? accent : "transparent",
                },
              ]}
            >
              {selected.has(rec) && <IconSymbol name="checkmark" color="#fff" size={16} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function FaceAnalysisActionsView({ analysisResults }: FaceAnalysisActionsViewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const updateRoutineMutation = useUpdateRoutine("my-routine");

  const handleSaveRoutine = () => {
    updateRoutineMutation
      .mutateAsync({
        replace: true,
        name: "My Routine",
        slug: "my-routine",
        description: "Routine based on facial analysis on " + new Date().toLocaleDateString(),
        itemsSlugs: [...Array.from(selected)],
      })
      .then(() => {
        router.replace("/(tabs)/routines/my-routine");
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error saving routine",
          text2: error.message,
        });
      });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={{ marginHorizontal: "auto", marginBottom: Spacings.md }}>
        Recommendations
      </ThemedText>

      <ThemedText style={{ marginBottom: Spacings.lg }}>
        Based on your analysis, we recommend the following exercises and tasks to improve your facial features:
      </ThemedText>

      {!analysisResults.recommendations?.length ? (
        <ThemedText>No recommendations available. Please upload your photos and try again.</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: Spacings.xl }}>
          <RecomendationsRenderer analysisResults={analysisResults} setSelected={setSelected} selected={selected} />

          <ThemedButton
            title="Save Routine"
            onPress={handleSaveRoutine}
            disabled={selected.size === 0}
            variant="solid"
            style={{ marginTop: Spacings.lg }}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    padding: Spacings.md,
    gap: Spacings.md,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: BorderRadii.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
