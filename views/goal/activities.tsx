import { GoalActivity } from "@/backend/shared";
import { ActivityCard } from "@/components/ActivityCard";
import { ThemedText } from "@/components/ThemedText";
import { Spacings } from "@/constants/Theme";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

interface GoalActivitiesViewProps {
  activities?: GoalActivity[];
  goalId: string;
}
export const GoalActivitiesView: React.FC<GoalActivitiesViewProps> = ({ activities, goalId }) => {
  return (
    <View style={styles.cards}>
      {activities?.map((activity) => (
        <ActivityCard
          key={activity.id + activity.slug}
          item={activity}
          actionButtonTitle="Edit"
          actionButtonIcon="pencil.and.outline"
          handlePress={() =>
            router.push({
              pathname: `/edit-goal-activity`,
              params: { activityId: activity.id, goalId },
            })
          }
        />
      ))}

      {activities?.length === 0 && (
        <ThemedText type="default" style={{ padding: Spacings.sm }}>
          No tasks available.
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    justifyContent: "center",
    gap: Spacings.xl,
    padding: Spacings.lg,
    paddingBottom: 152,
    minHeight: "100%",
  },
  link: {
    marginTop: Spacings.md,
    paddingVertical: Spacings.md,
  },
  cards: {
    width: "100%",
    borderRadius: 12,
    gap: Spacings.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacings.sm,
  },
});
