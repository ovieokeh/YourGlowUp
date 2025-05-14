import { format, parse } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { LinearTransition, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoalActivity, isGuidedActivity } from "@/backend/shared";
import { ActivityCard } from "@/components/ActivityCard";
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
}

export const HomeScreenContent: React.FC<HomeScreenContentProps> = ({ groupedData }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor({}, "border");
  const gray10 = useThemeColor({}, "gray10");

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
        <TodaysStats />
      </View>

      {/* Pending Activities Section */}
      <View style={styles.listContainer}>
        <ThemedText type="subtitle">Today&apos;s activities</ThemedText>

        {groupedData.map(({ time, items: groupItems }) => {
          const formattedTime =
            time === "Unscheduled" ? "Unscheduled" : format(parse(time, "HH:mm", new Date()), "h:mm a");

          return (
            <View key={time} style={styles.timeGroup}>
              <ThemedText type="defaultSemiBold">{formattedTime}</ThemedText>
              <View style={styles.cardsContainer}>
                {groupItems.map((item) => (
                  <Animated.View
                    key={item.id}
                    entering={SlideInRight.duration(300)}
                    exiting={SlideOutLeft.duration(300)}
                    layout={LinearTransition.springify()}
                  >
                    <ActivityCard
                      item={item}
                      actionButtonTitle={isGuidedActivity(item) ? "Start" : "Complete"}
                      actionButtonIcon={isGuidedActivity(item) ? "play.circle" : "checkmark.circle"}
                      hiddenFields={["description"]}
                      handlePress={isGuidedActivity(item) ? () => handleNavigateToActivity(item) : undefined}
                    />
                  </Animated.View>
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
    gap: Spacings.xxxl, // Space between title and first group, and between groups
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
    gap: Spacings.md, // Space between cards in the same time group
  },
  footer: {
    padding: Spacings.md,
    paddingTop: Spacings.lg, // Space above the footer button
  },
});
