import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ExerciseCard } from "@/components/ExerciseCard";
import { TaskCard } from "@/components/TaskCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodaysStats } from "@/components/TodaysStats";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAddRoutine, useGetRoutineById, useGetRoutines } from "@/queries/routines";
import { isRoutineExerciseItem, isRoutineTaskItem } from "@/queries/routines/routines";

export default function HomeScreen() {
  const router = useRouter();
  const routinesQuery = useGetRoutines();

  const routines = useMemo(() => routinesQuery.data || [], [routinesQuery.data]);
  const routineQuery = useGetRoutineById(routines[0]?.routineId || "my-routine");
  const { mutate } = useAddRoutine();
  const routine = routineQuery.data;

  useFocusEffect(
    useCallback(() => {
      if (!routine && routineQuery.isSuccess) {
        mutate({
          routineId: "my-routine",
          name: "My Routine",
          description: "Your default routine",
          steps: ["tongue-posture"],
        });
      }
    }, [mutate, routine, routineQuery.isSuccess])
  );

  const exercises = routine?.items?.filter(isRoutineExerciseItem) || [];
  const tasks = routine?.items?.filter(isRoutineTaskItem) || [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <TodaysStats />

          <View style={styles.cards}>
            <ThemedText style={styles.title} type="subtitle">
              Today&apos;s tasks
            </ThemedText>
            {tasks.map((item) => (
              <TaskCard key={item.id + item.itemId} item={item} handlePress={() => {}} allowCompletion />
            ))}
            {tasks.length === 0 && (
              <ThemedText type="default" style={{ padding: Spacings.sm }}>
                No tasks available.
              </ThemedText>
            )}
          </View>

          <View style={styles.cards}>
            <ThemedText style={styles.title} type="subtitle">
              Today&apos;s exercises
            </ThemedText>
            {exercises.map((item) => (
              <ExerciseCard
                key={item.id + item.itemId}
                item={item}
                handlePress={() =>
                  router.push({
                    pathname: "/exercise/[slug]",
                    params: { slug: encodeURIComponent(item.name), routineId: routine?.routineId },
                  })
                }
              />
            ))}
            {exercises.length === 0 && (
              <ThemedText type="default" style={{ padding: Spacings.sm }}>
                No exercises available.
              </ThemedText>
            )}
          </View>

          <ThemedButton
            title="View Routine"
            onPress={() => router.push(`/(tabs)/routines/${routine?.routineId}`)}
            variant="outline"
            icon="chevron.right"
            iconPlacement="right"
          />
        </View>
      </ScrollView>

      <ThemedFabButton
        onPress={() => router.push("/add-user-log")}
        icon="plus"
        iconPlacement="right"
        title="Add Log"
        variant="solid"
        bottom={96}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.md,
  },
  scrollContainer: {
    gap: Spacings.xl,
    paddingBottom: 96,
  },
  content: {
    flex: 1,
    gap: Spacings.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacings.sm,
  },
  cards: {
    gap: Spacings.md,
    marginVertical: Spacings.md,
  },
  horizontalCard: {
    padding: Spacings.sm,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    alignSelf: "center",
  },
  image: {
    width: 80,
    height: "auto",
    objectFit: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseArea: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
  },
});
