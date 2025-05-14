import { GoalActivity } from "@/backend/shared";
import { ActivityCard } from "@/components/ActivityCard";
import { ThemedText } from "@/components/ThemedText";
import { Spacings } from "@/constants/Theme";
import { format, parse } from "date-fns";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface GoalActivitiesViewProps {
  activities?: GoalActivity[];
  goalId: string;
}
export const GoalActivitiesView: React.FC<GoalActivitiesViewProps> = ({ activities, goalId }) => {
  const groupedByTime = useMemo(() => {
    const map: Record<string, GoalActivity[]> = {};
    const now = new Date();

    if (!activities) {
      return [
        {
          time: "Unscheduled",
          items: [] as GoalActivity[],
        },
      ];
    }

    for (const activity of activities) {
      let addedToGroup = false;

      if (activity.schedules && activity.schedules.length > 0) {
        for (const schedule of activity.schedules) {
          const timeKey = schedule.timeOfDay;

          const parsedTime = parse(timeKey, "HH:mm", now);
          if (!map[timeKey]) {
            map[timeKey] = [];
          }

          if (!map[timeKey].some((item) => item.id === activity.id)) {
            map[timeKey].push(activity);
            addedToGroup = true;
          }
        }
      }

      if (!addedToGroup) {
        if (!map["Unscheduled"]) {
          map["Unscheduled"] = [];
        }
        map["Unscheduled"].push(activity);
      }
    }

    return Object.entries(map)
      .sort(([keyA], [keyB]) => {
        if (keyA === "Unscheduled") return 1;
        if (keyB === "Unscheduled") return -1;
        return keyA.localeCompare(keyB);
      })
      .reduce((acc, [key, value]) => {
        if (value.length > 0) {
          acc.push({ time: key, items: value });
        }
        return acc;
      }, [] as { time: string; items: GoalActivity[] }[]);
  }, [activities]);

  return (
    <View style={styles.cards}>
      {groupedByTime.map(({ time, items }) => {
        const formattedTime =
          time === "Unscheduled" ? "Unscheduled" : format(parse(time, "HH:mm", new Date()), "h:mm a");

        return (
          <View key={time}>
            <ThemedText type="subtitle" style={{ padding: Spacings.sm }}>
              {formattedTime}
            </ThemedText>

            <View style={{ gap: Spacings.md }}>
              {items.map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  actionButtonTitle="Edit"
                  actionButtonIcon="pencil.circle"
                  handlePress={() => {
                    router.push({
                      pathname: "/(tabs)/goals/edit-activity",
                      params: {
                        activityId: item.id,
                        goalId: goalId,
                      },
                    });
                  }}
                  hiddenFields={["info"]}
                />
              ))}
            </View>
          </View>
        );
      })}
      {activities?.length === 0 && (
        <ThemedText type="default" style={{ padding: Spacings.sm }}>
          No activities available. You can add some activities to your goal using the &quot;Update Activities&quot;
          button
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cards: {
    width: "100%",
    borderRadius: 12,
    gap: Spacings.xl,
  },
});
