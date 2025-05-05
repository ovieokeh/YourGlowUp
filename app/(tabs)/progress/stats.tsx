import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { EXERCISES } from "@/constants/Exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getLogs, isExerciseLog, isUserLog, Log } from "@/utils/db";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;
const RANGE_OPTIONS = ["7d", "30d", "3mo", "all"];

export default function StatsScreen() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "3mo" | "all">("30d");

  const now = useMemo(() => new Date(), []);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");
  const colorScheme = backgroundColor === Colors.dark.background ? "dark" : "light";

  useFocusEffect(
    useCallback(() => {
      getLogs(setLogs);
    }, [])
  );

  const rangeStart = useMemo(() => {
    const d = new Date(now);
    if (range === "7d") d.setDate(d.getDate() - 7);
    else if (range === "30d") d.setDate(d.getDate() - 30);
    else if (range === "3mo") d.setMonth(d.getMonth() - 3);
    else return null;
    return d;
  }, [now, range]);

  const filtered = useMemo(
    () => logs.filter((l) => (rangeStart ? new Date(l.completedAt) >= rangeStart! : true)),
    [logs, rangeStart]
  );

  const streak = useMemo(() => {
    const days = new Set(logs.map((l) => new Date(l.completedAt).toDateString()));
    let count = 0;
    let d = new Date();
    while (days.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  const symmetryAvg = useMemo(() => {
    const vals = filtered.filter(isUserLog).map((l) => l.symmetryRating);
    if (!vals.length) return "N/A";
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return avg.toFixed(2);
  }, [filtered]);

  const chewingTime = useMemo(() => {
    const totalMin = filtered.filter(isUserLog).reduce((sum, l) => sum + (l.chewingDuration || 0), 0);
    return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
  }, [filtered]);

  const gumTime = useMemo(() => {
    const totalMin = filtered.filter(isUserLog).reduce((sum, l) => sum + (l.gumChewingDuration || 0), 0);
    return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
  }, [filtered]);

  const lineData = useMemo(() => {
    const map = new Map<string, number[]>();
    filtered.filter(isUserLog).forEach((l) => {
      const day = new Date(l.completedAt).toLocaleDateString();
      if (map.has(day)) {
        map.get(day)!.push(l.symmetryRating);
      } else {
        map.set(day, [l.symmetryRating]);
      }
    });
    const labels = Array.from(map.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const data = labels.map((date) => {
      const arr = map.get(date)!;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    });
    return { labels, datasets: [{ data }] };
  }, [filtered]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(isExerciseLog).forEach((l) => {
      map.set(l.exercise, (map.get(l.exercise) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => {
      const exercise = EXERCISES.find((e) => e.name === name);
      return {
        name,
        count,
        color: exercise?.color || Colors[colorScheme].text,
        legendFontColor: Colors[colorScheme].text,
        legendFontSize: 12,
      };
    });
  }, [filtered, colorScheme]);

  const chartConfig = {
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    color: (opacity = 1) =>
      `${textColor}${Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    strokeWidth: 2,
    decimalPlaces: 1,
    labelColor: () => Colors[colorScheme].icon,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.selectorRow}>
            {RANGE_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRange(r as any)}
                style={[
                  styles.rangeBtn,
                  { borderColor },
                  range === r && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
              >
                <ThemedText style={{ fontWeight: "500", color: range === r ? "#fff" : textColor }}>{r}</ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.cardGrid}>
            <StatCard label="Current Streak" value={`${streak} days`} />
            <StatCard label="Avg Symmetry" value={symmetryAvg} />
            <StatCard label="Total Chewing" value={chewingTime} />
            <StatCard label="Gum Time" value={gumTime} />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Symmetry Trend</ThemedText>
            {lineData.datasets[0].data.length ? (
              <LineChart
                data={lineData}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <ThemedText style={styles.emptyText}>No data available</ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Exercises Breakdown</ThemedText>
            {pieData.length ? (
              <View style={styles.pieWrapper}>
                <PieChart
                  data={pieData.map(({ name, count, color, legendFontColor, legendFontSize }) => ({
                    name,
                    population: count,
                    color,
                    legendFontColor,
                    legendFontSize,
                  }))}
                  width={SCREEN_WIDTH / 2}
                  height={CHART_HEIGHT}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft={`48`}
                  hasLegend={false}
                  absolute
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll}>
                  <View style={styles.legendContainer}>
                    {pieData.map((item) => (
                      <View key={item.name} style={styles.legendItem}>
                        <View style={[styles.legendMarker, { backgroundColor: item.color }]} />
                        <ThemedText style={styles.legendText}>
                          {item.name} ({item.count})
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>No data available</ThemedText>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value }: { label: string; value: string }) => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <ThemedText style={[styles.cardLabel, { color: muted }]}>{label}</ThemedText>
      <ThemedText style={[styles.cardValue, { color: textColor }]}>{value}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 92 },
  selectorRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  rangeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chart: { marginVertical: 8, borderRadius: 8 },
  emptyText: { textAlign: "center", marginVertical: 32 },
  pieWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    paddingBottom: 16,
  },
  legendScroll: {
    marginTop: 16,
    maxHeight: 50,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
