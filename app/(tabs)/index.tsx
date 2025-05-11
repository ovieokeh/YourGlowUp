import { format, parse } from "date-fns"; // added isToday
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useGetAllPendingActivitiesToday } from "@/backend/queries/activities";
import { useGetTodayLogs } from "@/backend/queries/logs";
import { GoalActivity, isActivityLog, isTaskActivity } from "@/backend/shared";
import { ActivityHorizontalCard } from "@/components/ActivityHorizontalCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodaysStats } from "@/components/TodaysStats";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAppContext, useSelectedGoalId } from "@/hooks/app/context";

export default function HomeScreen() {
  const { user } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const router = useRouter();
  const goalId = useSelectedGoalId();

  const logsQuery = useGetTodayLogs(currentUserId);
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);

  const activityLogs = useMemo(() => {
    return logs?.filter(isActivityLog) || [];
  }, [logs]);

  const goalQuery = useGetAllPendingActivitiesToday();

  const items = useMemo(() => goalQuery.data || [], [goalQuery?.data]);
  console.log("items", items);

  useFocusEffect(() => {
    goalQuery.refetch();
    logsQuery.refetch();
  });

  const isActivityCompleted = useCallback(
    (item: GoalActivity) => {
      // completed if there's any log for this goalId + itemId with createdAt today
      return activityLogs.some((log) => log.activityId === item.id);
    },
    [activityLogs]
  );

  const groupedByTime = useMemo(() => {
    const map: Record<string, typeof items> = {};
    const now = new Date();

    for (const item of items) {
      const times = item.scheduledTimes || ["Unscheduled"];
      const hasLog = isActivityCompleted(item);
      for (const time of times) {
        // filter out past occurrences when the item has any log
        if (time !== "Unscheduled") {
          const parsedTime = parse(time, "HH:mm", new Date());
          if (hasLog && now > parsedTime) {
            continue;
          }
        }

        if (!map[time]) map[time] = [];
        map[time].push(item);
      }
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [time, group]) => {
        acc.push({ time, items: group });
        return acc;
      }, [] as { time: string; items: typeof items }[]);
  }, [items, isActivityCompleted]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {items.length > 0 && (
            <>
              <TodaysStats />
              <ThemedText style={styles.title} type="subtitle">
                Today&apos;s tasks
              </ThemedText>
            </>
          )}

          <View style={{ gap: Spacings.xl }}>
            {groupedByTime.map(({ time, items }) => {
              const isWeeklyTime = time.includes("-");
              let timeString = time;
              if (isWeeklyTime) {
                timeString = time.split("-")[1];
              }
              const formatted =
                time === "Unscheduled" ? "Unscheduled" : format(parse(timeString, "HH:mm", new Date()), "h:mm a");

              return (
                <View key={time} style={styles.cards}>
                  <ThemedText style={styles.title}>{formatted}</ThemedText>
                  {items.map((item) => (
                    <ActivityHorizontalCard
                      key={item.id + item.slug}
                      item={item}
                      handlePress={() => {
                        router.push({
                          pathname: "/activity/[slug]",
                          params: {
                            slug: encodeURIComponent(item.slug || item.name),
                            goalId,
                          },
                        });
                      }}
                      allowCompletion={isTaskActivity(item)}
                      mode="action"
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        {items.length === 0 ? (
          <View style={{ gap: Spacings.md }}>
            <ThemedButton
              title="Create a goal"
              onPress={() => router.push(`/(tabs)/goals/add`)}
              variant="outline"
              icon="plus.circle"
              iconPlacement="right"
            />
            <ThemedButton
              title="Generate an AI goal"
              onPress={() => router.push(`/face-analysis`)}
              variant="solid"
              icon="wand.and.stars"
              iconPlacement="right"
            />
          </View>
        ) : (
          <ThemedButton
            title="View Goals"
            onPress={() => router.push(`/(tabs)/goals`)}
            variant="outline"
            icon="chevron.right"
            iconPlacement="right"
          />
        )}
      </ScrollView>
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
    gap: Spacings.xl,
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
