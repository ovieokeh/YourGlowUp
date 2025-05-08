import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetLogsByExercise } from "@/queries/logs";
import { RoutineExerciseItem } from "@/queries/routines/shared";

interface ExerciseCardProps {
  item: RoutineExerciseItem;
  mode?: "display" | "action";
  handlePress: () => void;
}
export const ExerciseCard = ({ item, mode = "display", handlePress }: ExerciseCardProps) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const logsQuery = useGetLogsByExercise(item.name);
  const logs = useMemo(() => {
    return logsQuery.data || [];
  }, [logsQuery.data]);

  const todayLogs = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return logs.filter((log) => {
      const completed = new Date(log.completedAt).getTime();
      return completed >= startOfDay.getTime() && completed <= endOfDay.getTime();
    });
  }, [logs]);
  const hasTodayLogs = useMemo(() => todayLogs.length > 0, [todayLogs]);

  const readableDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes === 0) {
      return `${seconds}s`;
    }
    if (seconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  };

  return (
    <Pressable
      key={item.id + item.itemId}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
        pressed && { opacity: 0.85 },
        {
          backgroundColor: cardBg,
          ...(mode === "action"
            ? {
                borderColor: hasTodayLogs ? successColor : cardBorder,
                opacity: hasTodayLogs ? 0.5 : 1,
              }
            : {}),
        },
      ]}
    >
      <Image source={{ uri: item.featureImage }} style={styles.image} contentFit="cover" />
      <View style={styles.horizontalCard}>
        <View style={styles.row}>
          <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
          <ThemedText>-</ThemedText>
          <View style={styles.row}>
            <IconSymbol name="clock" size={14} color={textColor} />
            <ThemedText style={[styles.description, { opacity: 0.7 }]}>{readableDuration(item.duration)}</ThemedText>
          </View>

          {item.notificationTimes?.length ? (
            <View style={styles.row}>
              <ThemedText>-</ThemedText>

              <IconSymbol name={"alarm"} size={16} color={textColor} />
              {item.notificationTimes.slice(0, 3).map((time, index) => (
                <View style={styles.row} key={time + index}>
                  {index % 2 === 0 ? null : <ThemedText>,</ThemedText>}
                  <ThemedText style={styles.description}>{time}</ThemedText>
                </View>
              ))}
              {item.notificationTimes.length > 3 ? (
                <ThemedText style={styles.description}>+{item.notificationTimes.length - 3} more</ThemedText>
              ) : null}
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

        {mode === "action" && hasTodayLogs && (
          <View style={styles.row}>
            <ThemedText style={[styles.description, { color: textColor }]}>
              Completed {todayLogs.length} {todayLogs.length > 1 ? "times" : "time"} today already
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacings.sm,
  },
  horizontalCard: {
    padding: Spacings.sm,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    alignSelf: "center",
  },
  image: {
    width: 80,
    height: "auto",
    objectFit: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseArea: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
  },
});
