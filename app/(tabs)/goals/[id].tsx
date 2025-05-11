import { router, Stack } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { useGetPendingActivitiesToday } from "@/backend/queries/activities";
import { useGetGoalById, useUpdateGoalActivities } from "@/backend/queries/goals";
import { useGetTodayLogs } from "@/backend/queries/logs";
import { GoalActivity, isActivityLog, isGuidedActivity, isTaskActivity } from "@/backend/shared";
import { ActivityHorizontalCard } from "@/components/ActivityHorizontalCard";
import { ActivityStepsModal } from "@/components/ActivityStepsModal";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useMemo, useState } from "react";

export default function GoalsSingleScreen() {
  const { user } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const { id = "1" } = useLocalSearchParams<{ id: string }>();
  const [showSelector, setShowSelector] = useState(false);

  const updateGoalActivities = useUpdateGoalActivities(currentUserId);

  const goalQuery = useGetGoalById(id);

  const goal = useMemo(() => {
    return goalQuery.data;
  }, [goalQuery.data]);

  const tasks = useMemo(() => {
    return goal?.activities?.filter(isTaskActivity) || [];
  }, [goal]);
  const guided = useMemo(() => {
    return goal?.activities?.filter(isGuidedActivity) || [];
  }, [goal]);
  const activitySlugs = useMemo(() => {
    return goal?.activities?.map((activity) => activity.slug) || [];
  }, [goal]);

  const todayLogsQuery = useGetTodayLogs(currentUserId);
  const completedActivityIds = useMemo(() => {
    return todayLogsQuery.data?.filter(isActivityLog).map((log) => log.activityId) || [];
  }, [todayLogsQuery.data]);

  const pendingItemsQuery = useGetPendingActivitiesToday(id, completedActivityIds);
  const pendingItems = useMemo(() => {
    return pendingItemsQuery.data;
  }, [pendingItemsQuery.data]);

  if (goalQuery.isLoading) {
    // Show a loading state while fetching the goal
    return (
      <ThemedView style={{ ...styles.container, ...styles.flex }}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!goal) {
    // Handle the case where the goal is not found
    return (
      <ThemedView style={{ ...styles.container, ...styles.flex }}>
        <ThemedText type="title">Goal not found</ThemedText>
      </ThemedView>
    );
  }

  const hasPendingItems = (pendingItems?.length ?? 0) > 0;

  return (
    <>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Stack.Screen options={{ title: goal.name, headerShown: true }} />
          <ThemedText>Customise your goal by clicking on an activity to edit it.</ThemedText>

          <View style={{ gap: Spacings.sm, marginBottom: Spacings.md }}>
            <ThemedButton
              variant="outline"
              title={hasPendingItems ? "Start next exercise" : "View your progress"}
              onPress={() => {
                if (hasPendingItems) {
                  router.push({
                    pathname: "/",
                    params: { slug: encodeURIComponent(pendingItems![0].name), goalId: goal?.id },
                  });
                } else router.push("/(tabs)/progress");
              }}
            />
          </View>

          <View style={styles.cards}>
            <ThemedText style={styles.title} type="subtitle">
              Tasks
            </ThemedText>

            {tasks.map((activity) => (
              <ActivityHorizontalCard
                key={activity.id + activity.slug}
                item={activity}
                handlePress={() =>
                  router.push({
                    pathname: `/edit-goal-activity`,
                    params: { activityId: activity.id, goalId: goal?.id },
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

            {guided.map((activity) => (
              <ActivityHorizontalCard
                key={activity.id + activity.slug}
                item={activity}
                handlePress={() =>
                  router.push({
                    pathname: "/edit-goal-activity",
                    params: { activityId: activity.id, goalId: goal?.id },
                  })
                }
              />
            ))}
            {guided.length === 0 && (
              <ThemedText type="default" style={{ padding: Spacings.sm }}>
                No guided activities set up.
              </ThemedText>
            )}
          </View>
        </ScrollView>
        <ThemedFabButton
          variant="solid"
          title="Update Goal"
          onPress={() => {
            setShowSelector(true);
          }}
          icon="pencil"
          iconPlacement="right"
          bottom={96}
        />
        <ActivityStepsModal
          visible={showSelector}
          selectedSlugs={activitySlugs}
          onClose={() => setShowSelector(false)}
          onSave={(activities: GoalActivity[]) => {
            updateGoalActivities
              .mutateAsync({
                goalId: goal.id,
                activities: activities,
              })
              .then(() => {
                setShowSelector(false);
              })
              .catch((error) => {
                console.error("Error updating goal", error);
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
