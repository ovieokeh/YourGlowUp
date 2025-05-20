import { useGetActivitiesSnapshot } from "@/backend/queries/activities";
import { CATEGORY_ICON_MAP, Goal } from "@/backend/shared";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton } from "./ThemedButton";

type GoalCardAction = "view" | "preview" | "delete";

interface GoalCardProps {
  item: Goal;
  hiddenFields?: string[];
  actions?: GoalCardAction[];
  topContent?: React.ReactNode;
}

export const GoalCard: React.FC<GoalCardProps> = ({ item, hiddenFields = [], actions, topContent }) => {
  const snapshotQuery = useGetActivitiesSnapshot(item.id);
  const { data: activitiesSnapshot } = snapshotQuery;
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const accent = useThemeColor({}, "accent");
  const bg = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");

  const progress = useMemo(() => {
    const completed = item.progress?.completedActivities ?? 0;
    const total = item.progress?.totalActivities ?? 0;
    return total > 0 ? Math.floor((completed / total) * 100) : 0;
  }, [item.progress]);

  const tagString = useMemo(() => item.tags.join(", "), [item.tags]);

  const activityCount = useMemo(() => {
    return activitiesSnapshot?.count ?? item.activities.length;
  }, [activitiesSnapshot, item.activities.length]);

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
      {!hiddenFields.includes("info") && (
        <ThemedButton
          variant="ghost"
          onPress={() => router.push({ pathname: "/(tabs)/goals/[id]", params: { id: item.id } })}
          icon="info.circle"
          style={styles.infoButton}
          textStyle={{ color: muted, fontSize: 12 }}
        />
      )}
      {topContent && (
        <View
          style={{
            position: "absolute",
            alignSelf: "flex-end",
            paddingHorizontal: 0,
            right: Spacings.sm,
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
          <View style={[styles.image, { backgroundColor: border }]}>
            <IconSymbol name="photo" size={40} color={text} />
          </View>
        )}
        <View style={{ flex: 1, gap: Spacings.xs }}>
          <View style={{ maxWidth: "94%", overflow: "hidden" }}>
            <ThemedText type="subtitle" numberOfLines={2}>
              {item.name}
            </ThemedText>
            {!hiddenFields.includes("description") && <ThemedText numberOfLines={2}>{item.description}</ThemedText>}
          </View>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {/* Category */}
            <View style={styles.metadataRow}>
              <IconSymbol name={CATEGORY_ICON_MAP[item.category]} size={14} color={text} />
              <ThemedText type="caption" style={{ textTransform: "capitalize" }}>
                {item.category.replace(/-/g, " ").toLowerCase()}
              </ThemedText>
            </View>

            <View style={styles.metadataRow}>
              <ThemedText type="caption" style={{ textTransform: "capitalize" }}>
                {activityCount} {activityCount === 0 || activityCount > 1 ? "activities" : "activity"}
              </ThemedText>
            </View>
            {tagString && (
              <View style={styles.metadataRow}>
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
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText type="subtitle" numberOfLines={2}>
          {item.name}
        </ThemedText>
        {!hiddenFields.includes("description") && (
          <ThemedText numberOfLines={2} style={{ color: muted }}>
            {item.description}
          </ThemedText>
        )}

        {/* Action Buttons */}
        {actions?.length ? (
          <View style={{ flexDirection: "row", gap: Spacings.sm, marginTop: "auto", paddingVertical: Spacings.sm }}>
            {actions?.includes("view") && (
              <ThemedButton
                variant="ghost"
                title="Edit"
                icon="pencil.circle"
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/goals/[id]",
                    params: { id: item.id },
                  });
                }}
              />
            )}
            {actions?.includes("delete") && (
              <ThemedButton variant="ghost" title="Delete" icon="trash" onPress={() => {}} />
            )}

            {actions?.includes("preview") && (
              <ThemedButton
                variant="ghost"
                icon="eye"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/goals/[id]",
                    params: { id: item.id },
                  })
                }
                style={{ marginLeft: "auto" }}
              />
            )}
          </View>
        ) : null}
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
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
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
