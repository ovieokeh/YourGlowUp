import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ExerciseLog, getLogsByExercise } from "@/queries/logs/logs";
import { RoutineExerciseItem } from "@/queries/routines/routines";

interface ExerciseCardProps {
  item: RoutineExerciseItem;
  handlePress: () => void;
}
export const ExerciseCard = ({ item, handlePress }: ExerciseCardProps) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const [logs, setLogs] = useState<ExerciseLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLogsByExercise(item.name, (res) => {
        setLogs(res);
      });
    }, [item.name])
  );

  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return logs.filter((log) => log.completedAt.startsWith(today));
  }, [logs]);

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
        todayLogs.length > 0 && {
          opacity: 0.5,
          borderColor: successColor,
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

          {item.notificationTime ? (
            <>
              <View style={styles.row}>
                <IconSymbol name={"alarm"} size={16} color={textColor} />
                <ThemedText style={styles.description}>{item.notificationTime}</ThemedText>
              </View>
              <ThemedText>-</ThemedText>
            </>
          ) : null}
        </View>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

        {todayLogs.length > 0 && (
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
