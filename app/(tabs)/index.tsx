import { parse } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useGetPendingActivities } from "@/backend/queries/activities";
import { useGetTodayLogs } from "@/backend/queries/logs";
import { GoalActivity, isActivityLog } from "@/backend/shared";
import { useAppContext } from "@/hooks/app/context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { HomeScreenContent } from "@/views/home/content";
import { HomeScreenEmptyNoGoals } from "@/views/home/empty-no-goals";
import { HomeScreenEmptyNoPending } from "@/views/home/empty-no-pending";

export default function HomeScreen() {
  const { user, goals, selectedGoalId, isLoadingGoals } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);

  const logsQuery = useGetTodayLogs(currentUserId);
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);

  const activityLogs = useMemo(() => logs.filter(isActivityLog), [logs]);
  const completedActivityIds = useMemo(() => activityLogs.map((log) => log.activityId), [activityLogs]);

  const pendingActivitiesQuery = useGetPendingActivities(completedActivityIds /*, selectedGoalId */);
  const items = useMemo(() => pendingActivitiesQuery.data || [], [pendingActivitiesQuery.data]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        logsQuery.refetch();
      }
      pendingActivitiesQuery.refetch();
    }, [currentUserId, logsQuery, pendingActivitiesQuery])
  );

  const isActivityCompleted = useCallback(
    (item: GoalActivity) => activityLogs.some((log) => log.activityId === item.id),
    [activityLogs]
  );

  const groupedByTime = useMemo(() => {
    const map: Record<string, GoalActivity[]> = {};
    const now = new Date();

    for (const item of items) {
      const hasLog = isActivityCompleted(item);
      let addedToGroup = false;

      if (item.schedules && item.schedules.length > 0) {
        for (const schedule of item.schedules) {
          const timeKey = schedule.timeOfDay;

          const parsedTime = parse(timeKey, "HH:mm", now);

          if (hasLog && now > parsedTime) {
            continue;
          }

          if (!map[timeKey]) {
            map[timeKey] = [];
          }

          if (!map[timeKey].some((existingItem) => existingItem.id === item.id)) {
            map[timeKey].push(item);
          }
          addedToGroup = true;
        }
      }

      if (!addedToGroup) {
        if (!map["Unscheduled"]) {
          map["Unscheduled"] = [];
        }

        if (!map["Unscheduled"].some((existingItem) => existingItem.id === item.id)) {
          map["Unscheduled"].push(item);
        }
      }
    }

    return Object.entries(map)
      .sort(([timeA], [timeB]) => {
        if (timeA === "Unscheduled") return 1;
        if (timeB === "Unscheduled") return -1;

        return timeA.localeCompare(timeB);
      })
      .reduce((acc, [time, group]) => {
        if (group.length > 0) {
          acc.push({ time, items: group });
        }
        return acc;
      }, [] as { time: string; items: GoalActivity[] }[]);
  }, [items, isActivityCompleted]);

  const isLoading = isLoadingGoals || pendingActivitiesQuery.isLoading || (!!currentUserId && logsQuery.isLoading);
  if (isLoading && !goals.length) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="title" style={{ textAlign: "center" }}>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }

  const renderContent = () => {
    if (goals.length === 0) {
      return (
        <View style={{ flex: 1, padding: Spacings.md }}>
          <HomeScreenEmptyNoGoals />
        </View>
      );
    }
    if (items.length === 0) {
      return (
        <View style={{ flex: 1, padding: Spacings.md }}>
          <HomeScreenEmptyNoPending selectedGoalId={selectedGoalId} />
        </View>
      );
    }
    return <HomeScreenContent groupedData={groupedByTime} />;
  };

  return <ThemedView style={styles.flexContainer}>{renderContent()}</ThemedView>;
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
