import { CATEGORY_ICON_MAP, Goal } from "@/backend/shared";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedButton } from "./ThemedButton";

interface GoalCardProps {
  goal: Goal;
  actionButtonTitle?: string;
  actionButtonIcon?: IconSymbolName;
  hiddenFields?: string[];
  handlePress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  actionButtonTitle,
  actionButtonIcon,
  hiddenFields = [],
  handlePress,
}) => {
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const accent = useThemeColor({}, "accent");
  const bg = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const gray10 = useThemeColor({}, "gray10");

  const progress = useMemo(() => {
    const completed = goal.progress?.completedActivities ?? 0;
    const total = goal.progress?.totalActivities ?? 0;
    return total > 0 ? Math.floor((completed / total) * 100) : 0;
  }, [goal.progress]);

  const tagString = useMemo(() => goal.tags.join(", "), [goal.tags]);

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
      {!hiddenFields.includes("info") && (
        <ThemedButton
          variant="ghost"
          onPress={() => router.push({ pathname: "/(tabs)/goals/[id]", params: { id: goal.id } })}
          icon="info.circle"
          style={styles.infoButton}
          textStyle={{ color: muted, fontSize: 12 }}
        />
      )}

      {!!goal.featuredImage && <Image source={{ uri: goal.featuredImage }} style={styles.image} contentFit="cover" />}

      <View style={styles.content}>
        <ThemedText type="title" numberOfLines={2}>
          {goal.name}
        </ThemedText>
        {!hiddenFields.includes("description") && (
          <ThemedText type="default" numberOfLines={2}>
            {goal.description}
          </ThemedText>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaRow}>
            <IconSymbol name={CATEGORY_ICON_MAP[goal.category]} size={14} color={text} />
            <ThemedText type="caption" style={{ textTransform: "capitalize" }}>
              {goal.category.replace(/-/g, " ").toLowerCase()}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText type="caption" style={{ textTransform: "capitalize" }}>
              {goal.activities.length}{" "}
              {goal.activities.length === 0 || goal.activities.length > 1 ? "activities" : "activity"}
            </ThemedText>
          </View>

          {tagString && (
            <View style={styles.metaRow}>
              <IconSymbol name="tag.circle" size={14} color={accent} />
              <ThemedText type="caption">{tagString}</ThemedText>
            </View>
          )}
          {progress > 0 && (
            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: accent }]} />
              <ThemedText type="caption" style={styles.progressText}>
                {progress}%
              </ThemedText>
            </View>
          )}
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
            marginTop: Spacings.sm,
          }}
        >
          <IconSymbol name={actionButtonIcon ?? "chevron.right"} size={18} color={text} style={{}} />
          {actionButtonTitle && <ThemedText type="caption">{actionButtonTitle}</ThemedText>}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    overflow: "hidden",
    gap: Spacings.sm,
    width: "100%",
  },
  infoButton: {
    position: "absolute",
    top: Spacings.xs,
    right: Spacings.xs,
    paddingHorizontal: 0,
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    flexDirection: "column",
    gap: Spacings.xs,
    padding: Spacings.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  progressText: {
    minWidth: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
    marginTop: Spacings.sm,
  },
});
