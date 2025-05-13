import { format, parse } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoalActivity, isTaskActivity } from "@/backend/shared";
import { ActivityHorizontalCard } from "@/components/ActivityHorizontalCard";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { TodaysStats } from "@/components/TodaysStats";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

type GroupedActivityData = {
  time: string;
  items: GoalActivity[];
};

interface HomeScreenContentProps {
  groupedData: GroupedActivityData[];
  selectedGoalId?: string;
  currentUserId?: string;
}

export const HomeScreenContent: React.FC<HomeScreenContentProps> = ({ groupedData, selectedGoalId, currentUserId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor({}, "border");
  const gray10 = useThemeColor({}, "gray10");
  const grayMuted = useThemeColor({}, "tint");

  const handleNavigateToActivity = (item: GoalActivity) => {
    router.push({
      pathname: "/activity/[slug]",
      params: {
        slug: item.slug || item.id,
        goalId: item.goalId,
      },
    });
  };

  const handleNavigateToGoals = () => {
    router.push(`/(tabs)/goals`);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + Spacings.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Header */}
      <View
        style={[
          styles.statsContainer,
          {
            backgroundColor: gray10,
            borderBottomColor: borderColor,
            paddingTop: insets.top + Spacings.md, // Adjusted top padding
          },
        ]}
      >
        <TodaysStats goalId={selectedGoalId} />
      </View>

      {/* Pending Activities Section */}
      <View style={styles.listContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Today&apos;s activities
        </ThemedText>

        {groupedData.map(({ time, items: groupItems }) => {
          const formattedTime =
            time === "Unscheduled" ? "Unscheduled" : format(parse(time, "HH:mm", new Date()), "h:mm a");

          return (
            <View key={time} style={styles.timeGroup}>
              <ThemedText style={[styles.timeHeader, { color: grayMuted }]}>{formattedTime}</ThemedText>
              <View style={styles.cardsContainer}>
                {groupItems.map((item) => (
                  <ActivityHorizontalCard
                    key={item.id}
                    userId={currentUserId}
                    goalId={item.goalId}
                    item={item}
                    handlePress={() => handleNavigateToActivity(item)}
                    allowCompletion={isTaskActivity(item)}
                    mode="action"
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <ThemedButton
          title="View All Goals"
          onPress={handleNavigateToGoals}
          variant="outline"
          icon="chevron.right"
          iconPlacement="right"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Allows container to grow if content is short
  },
  statsContainer: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacings.md,
    paddingBottom: Spacings.md, // Added bottom padding
  },
  listContainer: {
    paddingHorizontal: Spacings.md,
    paddingTop: Spacings.lg, // Space above the list section title
    gap: Spacings.lg, // Space between title and first group, and between groups
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  timeGroup: {
    gap: Spacings.sm, // Space between time header and cards
  },
  timeHeader: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    // color set dynamically
  },
  cardsContainer: {
    gap: Spacings.sm, // Space between cards in the same time group
  },
  footer: {
    padding: Spacings.md,
    paddingTop: Spacings.lg, // Space above the footer button
  },
});
