import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { GoalActivity, isGuidedActivity } from "@/backend/shared";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useActivityDuration } from "@/hooks/useActivityDuration";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatScheduleEntry } from "@/utils/schedule";

export const ActivityCard = ({
  item,
  actionButtonTitle,
  actionButtonIcon,
  handlePress,
}: {
  item: GoalActivity;
  actionButtonTitle?: string;
  actionButtonIcon?: IconSymbolName;
  handlePress: () => void;
}) => {
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const gray10 = useThemeColor({}, "gray10");
  const { goals } = useAppContext();

  const duration = useActivityDuration(item);

  const itemGoal = useMemo(() => {
    return goals.find((goal) => goal.id === item.goalId);
  }, [goals, item.goalId]);

  const readableDuration = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    if (totalMinutes === 0 && remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    if (parts.length === 0 && seconds === 0) return "0m";
    return parts.join(" ");
  };

  const MAX_SCHEDULES_TO_SHOW = 2;
  const scheduleDisplayString = useMemo(() => {
    if (!item.schedules || item.schedules.length === 0) {
      return null;
    }

    const formattedSchedules = item.schedules
      .slice(0, MAX_SCHEDULES_TO_SHOW)
      .map((schedule) => formatScheduleEntry(schedule, item.recurrence))
      .join(", ");

    const remainingCount = item.schedules.length - MAX_SCHEDULES_TO_SHOW;
    const moreText = remainingCount > 0 ? ` +${remainingCount} more` : "";

    return formattedSchedules + moreText;
  }, [item.schedules, item.recurrence]);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: cardBorder,
          backgroundColor: cardBg,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: Spacings.sm, padding: Spacings.sm }}>
        {/* Image or Placeholder */}
        {!!item.featuredImage?.length ? (
          <Image source={{ uri: item.featuredImage }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: cardBorder }]}>
            <IconSymbol name="photo" size={40} color={text} />
          </View>
        )}
        <View>
          <ThemedText style={styles.activityName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.activityGoalName} numberOfLines={2}>
            {itemGoal?.name}
          </ThemedText>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {/* Category */}
            <View style={styles.metadataItem}>
              <IconSymbol name="tag.circle" size={14} color={accent} />
              <ThemedText style={styles.metadataText}>{item.category}</ThemedText>
            </View>
            {/* Schedule Info Row (if applicable) */}
            {scheduleDisplayString && (
              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <IconSymbol name="calendar.badge.clock" size={14} color={text} />
                  <ThemedText style={styles.metadataText}>{scheduleDisplayString}</ThemedText>
                </View>
              </View>
            )}
            {/* Duration (if applicable) */}
            {isGuidedActivity(item) && duration > 0 && (
              <View style={styles.metadataItem}>
                <IconSymbol name="timer" size={14} color={text} />
                <ThemedText style={styles.metadataText}>{readableDuration(duration)}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.contentContainer}>
        <ThemedText style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </View>

      {/* Action Button */}
      <Pressable
        onPress={handlePress}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: Spacings.sm,
          backgroundColor: gray10,
          paddingVertical: Spacings.sm,
          paddingHorizontal: Spacings.md,
          borderRadius: BorderRadii.md,
        }}
      >
        <IconSymbol name={actionButtonIcon ?? "chevron.right"} size={18} color={text} style={{}} />
        {actionButtonTitle && (
          <ThemedText
            style={{
              fontSize: 14,
              color: text,
            }}
          >
            {actionButtonTitle}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    width: "100%",
    gap: Spacings.sm,
  },
  image: {
    width: 60,
    aspectRatio: 1,
    borderRadius: BorderRadii.sm,
  },
  imagePlaceholder: {
    width: 60,
    aspectRatio: 1,
    borderRadius: BorderRadii.sm,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacings.xs,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityGoalName: {
    fontSize: 12,
    fontWeight: "400",
  },
  activityDescription: {
    fontSize: 14,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  metadataText: {
    fontSize: 12,
  },
});
