import { format, parse } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { RoutineItemCard } from "@/components/RoutineItemCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodaysStats } from "@/components/TodaysStats";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAddRoutine, useGetRoutineById, useGetRoutines } from "@/queries/routines";
import { isRoutineTaskItem } from "@/queries/routines/shared";

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
          itemsIds: ["tongue-posture", "cleanse", "moisturize", "hydrate"],
        });
      }
    }, [mutate, routine, routineQuery.isSuccess])
  );

  const items = useMemo(() => routine?.items || [], [routine?.items]);

  const groupedByTime = useMemo(() => {
    const map: Record<string, typeof items> = {};

    for (const item of items) {
      const times = item.notificationTimes || ["Unscheduled"];

      for (const time of times) {
        if (!map[time]) map[time] = [];
        map[time].push(item);
      }
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort time keys
      .reduce((acc, [time, group]) => {
        acc.push({ time, items: group });
        return acc;
      }, [] as { time: string; items: typeof items }[]);
  }, [items]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <TodaysStats />

          <ThemedText style={styles.title} type="subtitle">
            Today&apos;s tasks
          </ThemedText>

          <View
            style={{
              gap: Spacings.xl,
            }}
          >
            {groupedByTime.map(({ time, items }) => {
              const formatted =
                time === "Unscheduled" ? "Unscheduled" : format(parse(time, "HH:mm", new Date()), "h:mm a");

              return (
                <View key={time} style={styles.cards}>
                  <ThemedText style={styles.title}>{formatted}</ThemedText>
                  {items.map((item) => (
                    <RoutineItemCard
                      key={item.id + item.itemId}
                      item={item}
                      handlePress={() => {
                        router.push({
                          pathname: "/exercise/[slug]",
                          params: {
                            slug: encodeURIComponent(item.itemId || item.name),
                            routineId: routine?.routineId,
                          },
                        });
                      }}
                      allowCompletion={isRoutineTaskItem(item)}
                      mode="action"
                    />
                  ))}
                </View>
              );
            })}
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
        onPress={() => router.push("/add-photo-log")}
        icon="plus"
        iconPlacement="right"
        title="Log photo"
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
    paddingBottom: 96,
  },
  content: {
    flex: 1,
    gap: Spacings.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacings.sm,
  },
  cards: {
    gap: Spacings.sm,
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
