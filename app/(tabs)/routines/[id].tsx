import { Link, router, Stack } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { ExerciseCard } from "@/components/ExerciseCard";
import { RoutineItemsModal } from "@/components/RoutineItemsModal";
import { TaskCard } from "@/components/TaskCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetPendingItemsToday, useGetRoutineById, useUpdateRoutine } from "@/queries/routines";
import { isRoutineExerciseItem, isRoutineTaskItem } from "@/queries/routines/routines";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useState } from "react";

export default function RoutinesSingleScreen() {
  const { id = "my-routine" } = useLocalSearchParams<{ id: string }>();
  const updateRoutineMutation = useUpdateRoutine(id);
  const [showSelector, setShowSelector] = useState(false);

  const routineQuery = useGetRoutineById(id);
  const { data: routine, isLoading } = routineQuery;

  const pendingItemsQuery = useGetPendingItemsToday(id);
  const { data: pendingItems } = pendingItemsQuery;

  const backgroundColor = useThemeColor({}, "background");

  if (isLoading) {
    // Show a loading state while fetching the routine
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!routine) {
    // If the routine is not found, show a 404 screen
    return (
      <>
        <Stack.Screen options={{ title: "Oops!" }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">This screen doesn&apos;t exist.</ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link">Go to home screen!</ThemedText>
          </Link>
        </ThemedView>
      </>
    );
  }

  const exercises = routine?.items?.filter(isRoutineExerciseItem) || [];
  const tasks = routine?.items?.filter(isRoutineTaskItem) || [];

  const hasPendingItems = (pendingItems?.length ?? 0) > 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ title: routine.name }} />
        <ThemedText>Customise your routine or generate a routine from a new face analysis.</ThemedText>

        <View style={{ gap: Spacings.sm, marginBottom: Spacings.md }}>
          <ThemedButton
            variant="outline"
            title="Generate AI Routine"
            onPress={() => {
              router.push("/face-analysis");
            }}
            icon="wand.and.stars"
          />
          <ThemedButton
            variant="solid"
            title={hasPendingItems ? "Start next exercise" : "View your progress"}
            onPress={() => {
              if (hasPendingItems) {
                router.push({
                  pathname: "/exercise/[slug]",
                  params: { slug: encodeURIComponent(pendingItems![0].name), routineId: routine?.routineId },
                });
              } else router.push("/(tabs)/progress");
            }}
          />
        </View>

        <View style={styles.cards}>
          <ThemedText style={styles.title} type="subtitle">
            Tasks
          </ThemedText>

          {tasks.map((item) => (
            <TaskCard
              key={item.id + item.itemId}
              item={item}
              handlePress={() =>
                router.push({
                  pathname: `/edit-routine-item`,
                  params: { id: item.itemId, routineId: routine?.routineId },
                })
              }
            />
          ))}
          {tasks.length === 0 && (
            <ThemedText type="default" style={{ padding: Spacings.sm }}>
              No tasks available.
            </ThemedText>
          )}
        </View>

        <View style={styles.cards}>
          <ThemedText style={styles.title} type="subtitle">
            Exercises
          </ThemedText>

          {exercises.map((item) => (
            <ExerciseCard
              key={item.id + item.itemId}
              item={item}
              handlePress={() =>
                router.push({
                  pathname: "/edit-routine-item",
                  params: { id: item.itemId, routineId: routine?.routineId },
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
      </ScrollView>
      <ThemedFabButton
        variant="outline"
        title="Update Routine"
        onPress={() => {
          setShowSelector(true);
        }}
        icon="pencil"
        iconPlacement="right"
        bottom={96}
        style={{
          backgroundColor: backgroundColor,
          borderColor: "transparent",
        }}
      />
      <RoutineItemsModal
        visible={showSelector}
        selectedIds={routine.items.map((item) => item.itemId)}
        onClose={() => setShowSelector(false)}
        onSave={(items) => {
          updateRoutineMutation
            .mutateAsync({
              replace: true,
              itemsIds: [...routine.items.map((item) => item.itemId), ...items.map((item) => item.itemId)],
            })
            .then(() => {
              setShowSelector(false);
            });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: Spacings.xl,
    padding: Spacings.lg,
    paddingBottom: 96,
  },
  link: {
    marginTop: Spacings.md,
    paddingVertical: Spacings.md,
  },
  cards: {
    width: "100%",
    borderRadius: 12,
    gap: Spacings.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacings.sm,
  },
});
