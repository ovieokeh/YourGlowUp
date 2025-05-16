import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useAddLog } from "@/backend/queries/logs";
import { Activity, LogCreateInput, LogType } from "@/backend/shared";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useActivityDuration } from "@/hooks/useActivityDuration";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSound } from "@/utils/sounds";
import { router } from "expo-router";
import { ActivityCompletionModal } from "./modals/ActivityCompletionModal";
import { ThemedButton } from "./ThemedButton";

type ActivityCardAction = "view" | "edit" | "delete" | "complete";
interface ActivityCardProps {
  item: Activity;
  hiddenFields?: string[];
  actions?: ActivityCardAction[];
  topContent?: React.ReactNode;
}
export const ActivityCard = ({ item, actions, hiddenFields = [], topContent }: ActivityCardProps) => {
  const { user } = useAppContext();
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const muted = useThemeColor({}, "muted");

  const { goals } = useAppContext();

  const [isCompletionModalVisible, setIsCompletionModalVisible] = useState(false);

  const duration = useActivityDuration(item);

  const saveLogMutation = useAddLog(user?.id);
  const { play } = useSound();

  const itemGoal = useMemo(() => {
    return goals.find((goal) => goal.id === item.goalId);
  }, [goals, item.goalId]);

  const handleComplete = useCallback(async () => {
    if (!itemGoal || !user?.id) return;

    await saveLogMutation.mutateAsync({
      type: LogType.ACTIVITY,
      userId: user.id,
      goalId: itemGoal?.id,
      activityId: item.id,
    } as LogCreateInput);
    play("complete-exercise");
  }, [item, play, saveLogMutation, itemGoal, user?.id]);

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

  const numOfSteps = item.steps.length;

  return (
    <View
      style={[
        styles.card,
        {
          borderWidth: 1,
          borderRadius: BorderRadii.sm,
          borderColor: cardBorder,
          backgroundColor: cardBg,
        },
      ]}
    >
      {topContent && (
        <View
          style={{
            position: "absolute",
            alignSelf: "flex-end",
            paddingHorizontal: 0,
            right: Spacings.sm,
            // paddingVertical: 0,
          }}
        >
          {topContent}
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: Spacings.sm }}>
        {/* Image or Placeholder */}
        {!!item.featuredImage?.length ? (
          <Image source={{ uri: item.featuredImage }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: cardBorder }]}>
            <IconSymbol name="photo" size={40} color={text} />
          </View>
        )}
        <View style={{ flex: 1, gap: Spacings.xs }}>
          <View style={{ maxWidth: "94%", overflow: "hidden" }}>
            <ThemedText type="subtitle" numberOfLines={2}>
              {item.name}
            </ThemedText>
            <ThemedText type="caption" numberOfLines={2}>
              {itemGoal?.name}
            </ThemedText>
          </View>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {/* Category */}
            <View style={styles.metadataItem}>
              <IconSymbol name="tag.circle" size={14} color={accent} />
              <ThemedText type="caption" style={{ textTransform: "capitalize" }}>
                {item.category}
              </ThemedText>
            </View>
            {/* Schedule Info Row (if applicable) */}
            {numOfSteps > 0 && (
              <View style={styles.metadataItem}>
                <ThemedText type="caption">-</ThemedText>
                <ThemedText type="caption">
                  {numOfSteps} {numOfSteps === 0 || numOfSteps > 1 ? "steps" : "step"}
                </ThemedText>
              </View>
            )}
            {/* Duration (if applicable) */}
            {duration > 0 && (
              <View style={styles.metadataItem}>
                <ThemedText type="caption">-</ThemedText>
                <IconSymbol name="timer" size={14} color={text} />
                <ThemedText type="caption">{readableDuration(duration)}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Text Content */}

      {!hiddenFields.includes("description") && (
        <ThemedText numberOfLines={2} style={{ color: muted }}>
          {item.description}
        </ThemedText>
      )}

      {/* Action Buttons */}
      {actions?.length ? (
        <View style={{ flexDirection: "row", gap: Spacings.sm, marginTop: "auto", paddingVertical: Spacings.sm }}>
          {actions?.includes("complete") && (
            <ThemedButton
              variant="ghost"
              title="Complete"
              icon="checkmark.circle.fill"
              onPress={() => {
                if (item.completionPrompts?.length) {
                  setIsCompletionModalVisible(true);
                } else {
                  handleComplete();
                }
              }}
            />
          )}
          {actions?.includes("edit") && (
            <ThemedButton
              variant="ghost"
              title="Edit"
              icon="pencil.circle"
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/goals/upsert-activity",
                  params: { activityId: item.id, goalId: item.goalId },
                });
              }}
            />
          )}
          {actions?.includes("delete") && (
            <ThemedButton variant="ghost" title="Delete" icon="trash" onPress={() => {}} />
          )}

          {actions?.includes("view") && (
            <ThemedButton
              variant="ghost"
              icon="chevron.right"
              onPress={() =>
                router.push({
                  pathname: "/activity/[slug]",
                  params: { slug: item.slug || item.id, goalId: item.goalId },
                })
              }
              style={{ marginLeft: "auto" }}
            />
          )}
        </View>
      ) : null}

      {/* Modals */}
      <ActivityCompletionModal
        item={item}
        isVisible={isCompletionModalVisible}
        handleSkipQuestions={() => {
          setIsCompletionModalVisible(false);
          handleComplete();
        }}
        handleSubmitAnswers={() => {
          setIsCompletionModalVisible(false);
          handleComplete();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    width: "100%",
    padding: Spacings.sm,
    gap: Spacings.sm,
  },
  image: {
    width: 64,
    aspectRatio: 1,
    borderRadius: BorderRadii.sm,
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
});
