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
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export const TodaysStats: React.FC = () => {
  const logsQuery = useGetLogs();
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);

  const router = useRouter();

  const wrapperBorder = useThemeColor({}, "border");
  const muted = useThemeColor({}, "muted");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const gray10 = useThemeColor({}, "gray10");

  const streak = useMemo(() => {
    return getStreak(logs);
  }, [logs]);

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
  const exercisesToday = todayLogs.filter(isExerciseLog);
  const lastExercise = exercisesToday.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0];

  const tasksToday = todayLogs.filter((log) => isTaskLog(log));
  const lastTask = tasksToday.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  if (!exercisesToday.length && !tasksToday.length) {
    return (
      <View style={[styles.wrapper, { backgroundColor: gray10, borderColor: wrapperBorder }]}>
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
    <View
      style={[
        styles.wrapper,
        {
          // backgroundColor: gray10,
          borderColor: wrapperBorder,
        },
      ]}
    >
      <ThemedText type="subtitle" style={styles.title}>
        At a glance
      </ThemedText>

      <View style={styles.statsGrid}>
        <View style={{ flexDirection: "row", gap: Spacings.sm }}>
          <StatCard
            icon="calendar"
            label="Streak"
            value={`${streak} days`}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
          <StatCard
            icon="figure.walk.circle"
            label="Exercises"
            value={exercisesToday.length.toString()}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
          <StatCard
            icon="figure.walk.circle"
            label="Tasks"
            value={tasksToday.length.toString()}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
        </View>

        {lastTask && (
          <StatCard
            icon="checkmark"
            label="Last Task"
            value={lastTask.task}
            subValue={formatDistanceToNow(new Date(lastTask.completedAt), {
              addSuffix: true,
            })}
            color={accent}
            muted={muted}
            text={text}
          />
        )}
        {lastExercise && (
          <StatCard
            icon="clock"
            label="Last Exercise"
            value={lastExercise.exercise}
            subValue={formatDistanceToNow(new Date(lastExercise.completedAt), {
              addSuffix: true,
            })}
            color={accent}
            muted={muted}
            text={text}
          />
        )}
        <View style={{ flexDirection: "row", gap: Spacings.sm }}></View>
      </View>

      <ThemedButton
        title="View Progress"
        onPress={() => router.replace("/progress?activeTab=Stats")}
        variant="ghost"
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
  variant = "horizontal",
}: {
  icon: IconSymbolName;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  muted: string;
  text: string;
  variant?: "horizontal" | "vertical";
}) => (
  <View
    style={[
      styles.card,
      {
        alignItems: variant === "horizontal" ? "center" : "flex-start",
      },
    ]}
  >
    <IconSymbol name={icon} color={color} size={22} />

    <View style={{ marginLeft: Spacings.sm }}>
      <ThemedText style={[styles.cardLabel, { color: muted }]}>{label}</ThemedText>
      <ThemedText style={[styles.cardValue, { color: text }]}>{value}</ThemedText>
      {subValue && <ThemedText style={[styles.cardSubValue, { color: muted }]}>{subValue}</ThemedText>}
    </View>
  </View>
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
  statsGrid: {
    gap: Spacings.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacings.sm,
    borderRadius: BorderRadii.sm,
    // maxWidth: Dimensions.get("window").width / 2.6,
    flex: 1,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    elevation: 1,
    shadowRadius: 1.0,
    backgroundColor: "transparent",
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
