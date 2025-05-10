import { router, Stack } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { RoutineItemCard } from "@/components/RoutineItemCard";
import { RoutineItemsModal } from "@/components/RoutineItemsModal";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import {
  useGetPendingItemsToday,
  useGetRoutineById,
  useGetRoutineItems,
  useUpdateRoutineItems,
} from "@/queries/routines";
import { isRoutineExerciseItem, isRoutineTaskItem } from "@/queries/routines/shared";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useMemo, useState } from "react";

const getEarliestTime = (item: { notificationTimes?: string[] | null }) => {
  if (!item.notificationTimes || item.notificationTimes.length === 0) return "99:99";
  return item.notificationTimes.slice().sort()[0];
};

export default function RoutinesSingleScreen() {
  const { id = "1" } = useLocalSearchParams<{ id: string }>();
  const updateRoutineItemsMutation = useUpdateRoutineItems(id);
  const [showSelector, setShowSelector] = useState(false);

  const routineQuery = useGetRoutineById(id);
  const { data: routine, isLoading } = routineQuery;

  const routineItemsQuery = useGetRoutineItems(id);
  const routineItems = useMemo(() => {
    return routineItemsQuery.data;
  }, [routineItemsQuery.data]);

  const pendingItemsQuery = useGetPendingItemsToday();
  const pendingItems = useMemo(() => {
    return pendingItemsQuery.data;
  }, [pendingItemsQuery.data]);

  if (isLoading) {
    // Show a loading state while fetching the routine
    return (
      <ThemedView style={{ ...styles.container, ...styles.flex }}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!routine) {
    // Handle the case where the routine is not found
    return (
      <ThemedView style={{ ...styles.container, ...styles.flex }}>
        <ThemedText type="title">Routine not found</ThemedText>
      </ThemedView>
    );
  }

  const exercises = routineItems?.filter(isRoutineExerciseItem) || [];
  const tasks = routineItems?.filter(isRoutineTaskItem) || [];

  const hasPendingItems = (pendingItems?.length ?? 0) > 0;

  exercises.sort((a, b) => getEarliestTime(a).localeCompare(getEarliestTime(b)));
  tasks.sort((a, b) => getEarliestTime(a).localeCompare(getEarliestTime(b)));

  return (
    <>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Stack.Screen options={{ title: routine.name, headerShown: true }} />
          <ThemedText>
            Customise your routine by clicking on an item to edit it or generate a routine from an AI face analysis.
          </ThemedText>

          <View style={{ gap: Spacings.sm, marginBottom: Spacings.md }}>
            <ThemedButton
              variant="outline"
              title={hasPendingItems ? "Start next exercise" : "View your progress"}
              onPress={() => {
                if (hasPendingItems) {
                  router.push({
                    pathname: "/exercise/[slug]",
                    params: { slug: encodeURIComponent(pendingItems![0].name), routineId: routine?.id },
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
              <RoutineItemCard
                key={item.id + item.slug}
                item={item}
                handlePress={() =>
                  router.push({
                    pathname: `/edit-routine-item`,
                    params: { id: item.id, routineId: routine?.id },
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
              <RoutineItemCard
                key={item.id + item.slug}
                item={item}
                handlePress={() =>
                  router.push({
                    pathname: "/edit-routine-item",
                    params: { id: item.id, routineId: routine?.id },
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
          variant="solid"
          title="Update Routine"
          onPress={() => {
            setShowSelector(true);
          }}
          icon="pencil"
          iconPlacement="right"
          bottom={96}
        />
        <RoutineItemsModal
          visible={showSelector}
          selectedSlugs={routineItems?.map((item) => item.slug) || []}
          onClose={() => setShowSelector(false)}
          onSave={(items) => {
            updateRoutineItemsMutation
              .mutateAsync(items)
              .then(() => {
                setShowSelector(false);
              })
              .catch((error) => {
                console.error("Error updating routine", error);
              });
          }}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    justifyContent: "center",
    gap: Spacings.xl,
    padding: Spacings.lg,
    paddingBottom: 152,
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
