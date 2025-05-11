import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useAddGoal, useUpdateGoalActivities } from "@/backend/queries/goals";
import { GoalCategory, GoalCompletionType } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { DEFAULT_ACTIVITIES } from "@/constants/Goals";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
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
        const item = DEFAULT_ACTIVITIES.find((activity) => activity.slug === rec);

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
            <Image source={{ uri: item.featuredImage }} style={styles.image} />
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
  const { user } = useAppContext();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addGoalMutation = useAddGoal(user?.id);
  const updateGoalActivitiesMutation = useUpdateGoalActivities(user?.id);

  const handleSaveRoutine = async () => {
    if (!user?.id) {
      Toast.show({
        type: "error",
        text1: "Error saving goal",
        text2: "User not found",
      });
      return;
    }

    const goalId = await addGoalMutation
      .mutateAsync({
        name: "My Routine",
        slug: "1",
        description: "Routine based on facial analysis on " + new Date().toLocaleDateString(),
        category: GoalCategory.CUSTOM,
        tags: ["Routine", "Face Analysis"],
        isPublic: false,
        completionType: GoalCompletionType.ACTIVITY,
        author: {
          id: user?.id,
          name: "User",
        },
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error saving goal",
          text2: error.message,
        });
      });

    if (!goalId) return;

    const activities = Array.from(selected).map((slug) => {
      const activity = DEFAULT_ACTIVITIES.find((activity) => activity.slug === slug);
      if (!activity) return null;
      return {
        ...activity,
        goalId,
      };
    });

    await updateGoalActivitiesMutation.mutateAsync({
      goalId,
      activities: activities.filter((activity) => activity !== null) as any,
    });
    Toast.show({
      type: "success",
      text1: "Routine saved successfully",
      text2: "Your goal has been saved.",
    });
    router.push(`/(tabs)/goals/${goalId}`);
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
