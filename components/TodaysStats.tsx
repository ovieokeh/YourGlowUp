import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { isExerciseLog, isTaskLog } from "@/queries/logs/logs";

import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getStreak } from "@/queries/gamification/gamification";
import { useGetLogs } from "@/queries/logs";
import { ThemedButton } from "./ThemedButton";
import { ThemedView } from "./ThemedView";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export const TodaysStats: React.FC = () => {
  const logsQuery = useGetLogs();
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);

  const router = useRouter();

  const wrapperBorder = useThemeColor({}, "border");
  const muted = useThemeColor({}, "muted");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  const streak = useMemo(() => {
    return getStreak(logs);
  }, [logs]);

  const todayLogs = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter((log) => new Date(log.completedAt).toDateString() === today);
  }, [logs]);

  const exercisesToday = todayLogs.filter(isExerciseLog);
  const lastExercise = exercisesToday.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0];

  const tasksToday = todayLogs.filter((log) => isTaskLog(log));
  const lastTask = tasksToday.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  if (!exercisesToday.length && !tasksToday.length) {
    return (
      <View style={[styles.wrapper, { borderColor: wrapperBorder }]}>
        <Image
          source={require("@/assets/images/empty-today-stats.png")}
          style={{ width: 100, height: 100, marginBottom: Spacings.sm, marginHorizontal: "auto" }}
        />
        <ThemedText style={styles.emptyText}>
          No activity yet today. Ready to crush a complete a task or do an exercise?
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { borderColor: wrapperBorder }]}>
      <ThemedText type="subtitle" style={styles.title}>
        At a glance
      </ThemedText>

      <View style={styles.statsGrid}>
        <View style={{ flexDirection: "row", gap: Spacings.sm }}>
          <StatCard
            icon="figure.walk.circle"
            label="Tasks Done"
            value={tasksToday.length.toString()}
            color={tint}
            muted={muted}
            text={text}
          />
          <StatCard
            icon="figure.walk.circle"
            label="Exercises Done"
            value={exercisesToday.length.toString()}
            color={tint}
            muted={muted}
            text={text}
          />
        </View>
        <StatCard
          icon="calendar"
          label="Current Streak"
          value={`${streak} days`}
          color={tint}
          muted={muted}
          text={text}
        />

        {lastExercise && (
          <StatCard
            icon="clock"
            label="Last Exercise"
            value={lastExercise.exercise}
            subValue={formatDistanceToNow(new Date(lastExercise.completedAt), {
              addSuffix: true,
            })}
            color={tint}
            muted={muted}
            text={text}
          />
        )}

        {lastTask && (
          <StatCard
            icon="checkmark"
            label="Last Task"
            value={lastTask.task}
            subValue={formatDistanceToNow(new Date(lastTask.completedAt), {
              addSuffix: true,
            })}
            color={tint}
            muted={muted}
            text={text}
          />
        )}
      </View>

      <ThemedButton
        title="View Progress"
        onPress={() => router.replace("/progress?activeTab=Stats")}
        variant="outline"
        icon="chevron.right"
        iconPlacement="right"
        style={styles.button}
      />
    </View>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  subValue,
  color,
  muted,
  text,
}: {
  icon: IconSymbolName;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  muted: string;
  text: string;
}) => (
  <ThemedView style={styles.card}>
    <IconSymbol name={icon} color={color} size={22} />
    <View style={{ marginLeft: Spacings.sm }}>
      <ThemedText style={[styles.cardLabel, { color: muted }]}>{label}</ThemedText>
      <ThemedText style={[styles.cardValue, { color: text }]}>{value}</ThemedText>
      {subValue && <ThemedText style={[styles.cardSubValue, { color: muted }]}>{subValue}</ThemedText>}
    </View>
  </ThemedView>
);

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: Spacings.md,
    paddingHorizontal: Spacings.md,
    borderRadius: BorderRadii.md,
    borderWidth: 1,
  },
  title: {
    marginBottom: Spacings.sm,
  },
  statsGrid: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacings.sm,
    borderRadius: BorderRadii.sm,
  },
  cardLabel: {
    fontSize: 13,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubValue: {
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    fontStyle: "italic",
  },
  button: {
    marginTop: Spacings.lg,
    alignItems: "center",
    minWidth: 160,
  },
});
