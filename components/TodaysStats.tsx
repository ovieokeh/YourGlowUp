import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetStats } from "@/queries/logs";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export const TodaysStats: React.FC<{
  routineId?: number;
}> = ({ routineId }) => {
  const statsQuery = useGetStats({
    routineId: Number(routineId),
    startDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
  });
  const stats = useMemo(() => {
    return statsQuery.data;
  }, [statsQuery.data]);

  const wrapperBorder = useThemeColor({}, "border");
  const muted = useThemeColor({}, "muted");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const gray10 = useThemeColor({}, "gray10");

  const last = stats?.timeSeries.at(-1)?.totalDuration ?? 0;
  const prev = stats?.timeSeries.at(-2)?.totalDuration ?? 0;
  const trend = last > prev ? "up" : last < prev ? "down" : "flat";

  const mostCompleted = stats?.itemStats.slice().sort((a, b) => b.count - a.count)[0];
  const mostActiveDay = stats?.timeSeries.slice().sort((a, b) => b.totalDuration - a.totalDuration)[0];
  const mostActiveDayDate = mostActiveDay
    ? new Date(mostActiveDay?.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";
  const mostActiveDayDuration = mostActiveDay?.totalDuration ?? 0;
  const mostActiveDayDurationFormatted = `${Math.floor(mostActiveDayDuration / 60)}h ${mostActiveDayDuration % 60}m`;

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
            value={`${stats?.consistency.currentStreak} 🔥`}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
          <StatCard
            icon={
              trend === "up"
                ? "chart.line.uptrend.xyaxis"
                : trend === "down"
                ? "chart.line.downtrend.xyaxis"
                : "chart.xyaxis.line"
            }
            label="Trend"
            value={`${trend}`}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
        </View>
        <View style={{ flexDirection: "row", gap: Spacings.sm }}>
          <StatCard
            icon="figure.walk.circle"
            label="Longest Streak"
            value={stats?.consistency.longestStreak.toString() ?? "0"}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
          <StatCard
            icon="figure.walk.circle"
            label="Completed"
            value={stats?.totalCompleted.toString() ?? "0"}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
        </View>
        {mostCompleted && (
          <StatCard
            icon="star.circle"
            label="Top Exercise"
            value={`${mostCompleted.name} (${mostCompleted.count})`}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
        )}
        {mostActiveDay && (
          <StatCard
            icon="calendar"
            label="Most Active Day"
            value={`${mostActiveDayDate} (${mostActiveDayDurationFormatted})`}
            color={accent}
            muted={muted}
            text={text}
            variant="vertical"
          />
        )}

        <View style={{ flexDirection: "row", gap: Spacings.sm }}></View>
      </View>
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
    paddingVertical: Spacings.xl,
    paddingHorizontal: Spacings.md,
    gap: Spacings.sm,
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
