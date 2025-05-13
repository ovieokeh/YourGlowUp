import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

import { useGetStats } from "@/backend/queries/stats";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export const TodaysStats: React.FC<{
  goalId?: string;
}> = ({ goalId }) => {
  const statsQuery = useGetStats({
    goalId,
    // startDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    // endDate: Date.now(),
  });
  const stats = useMemo(() => {
    return statsQuery.data;
  }, [statsQuery.data]);

  const wrapperBorder = useThemeColor({}, "border");
  const muted = useThemeColor({}, "muted");
  const text = useThemeColor({}, "text");
  const danger = useThemeColor({}, "danger");
  const success = useThemeColor({}, "success");

  const last = stats?.timeSeries.at(-1)?.totalDuration ?? 0;
  const prev = stats?.timeSeries.at(-2)?.totalDuration ?? 0;
  const trend = last > prev ? "up" : last < prev ? "down" : "flat";

  const streak = stats?.consistency?.currentStreak ?? 0;

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
            icon="bolt"
            label="Current Streak"
            value={`${streak ?? 0}${streak > 1 ? " 🔥" : ""}`}
            color={text}
            muted={muted}
            text={text}
            variant="vertical"
          />
          <StatCard
            icon="bolt.heart"
            label="Longest Streak"
            value={stats?.consistency.longestStreak.toString() ?? "0"}
            color={text}
            muted={muted}
            text={text}
            variant="vertical"
          />
        </View>
        <View style={{ flexDirection: "row", gap: Spacings.sm }}>
          <StatCard
            icon={
              trend === "up"
                ? "chart.line.uptrend.xyaxis"
                : trend === "down"
                ? "chart.line.downtrend.xyaxis"
                : "chart.line.flattrend.xyaxis"
            }
            label="Activity Trend"
            value={`${trend}`}
            color={trend === "up" ? success : trend === "down" ? danger : text}
            muted={muted}
            text={text}
            variant="vertical"
          />

          <StatCard
            icon="checkmark.circle"
            label="Completed today"
            value={stats?.totalCompleted.toString() ?? "0"}
            color={text}
            muted={muted}
            text={text}
            variant="vertical"
          />
        </View>
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
    backgroundColor: "transparent",
  },
  cardLabel: {
    fontSize: 13,
    textTransform: "capitalize",
  },
  cardValue: {
    fontSize: 18,
    textTransform: "capitalize",
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
