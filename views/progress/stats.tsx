import spaceMono from "@/assets/fonts/SpaceMono-Regular.ttf";
import { ThemedText } from "@/components/ThemedText";
import { TodaysStats } from "@/components/TodaysStats";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetStats } from "@/queries/logs";
import { invertHex } from "@/utils/color";
import { Group, SkFont, Text, useFont } from "@shopify/react-native-skia";
import { useFocusEffect } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Easing } from "react-native-reanimated";
import { CartesianChart, Line, Pie, PieSliceData, PolarChart } from "victory-native";
const RANGE_OPTIONS = ["7d", "30d", "3mo", "all"];

export function ProgressStatsView({ selectedRoutine }: { selectedRoutine: number | undefined }) {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");
  const font = useFont(spaceMono, 12);

  const [range, setRange] = useState<"7d" | "30d" | "3mo" | "all">("30d");

  const statsQuery = useGetStats({
    routineId: Number(selectedRoutine),
    startDate:
      range === "all" ? undefined : Date.now() - (range === "7d" ? 7 : range === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
  });
  const stats = useMemo(() => {
    return statsQuery.data;
  }, [statsQuery.data]);

  useFocusEffect(() => {
    statsQuery.refetch();
  });

  const durationOverTime = useMemo(
    () =>
      stats?.timeSeries.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        duration: d.totalDuration,
      })),
    [stats]
  );
  const areaStats = useMemo(
    () =>
      stats?.areaStats
        .map((d) => ({
          area: d.area,
          totalDuration: d.totalDuration,
          color: COLORS[stats?.areaStats.indexOf(d) % COLORS.length],
        }))
        .filter((d) => d.totalDuration > 0),
    [stats]
  );

  return (
    <View style={styles.container}>
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
      {stats && (
        <>
          {/* 1. Metric Summary */}
          <TodaysStats />

          {/* 2. Pie Chart: Area Distribution */}
          <ThemedText style={styles.chartTitle}>Focus Areas</ThemedText>
          <View style={{ height: 280 }}>
            {areaStats && areaStats.length > 0 ? (
              <PolarChart
                data={areaStats.map((d) => ({
                  x: d.area,
                  y: d.totalDuration,
                  color: d.color,
                }))}
                labelKey="x"
                valueKey="y"
                colorKey="color"
              >
                <Pie.Chart>
                  {({ slice }) => {
                    return (
                      <Pie.Slice key={slice.label}>
                        <Pie.Label radiusOffset={0.6}>
                          {(position) => <PieChartCustomLabel position={position} slice={slice} font={font} />}
                        </Pie.Label>
                      </Pie.Slice>
                    );
                  }}
                </Pie.Chart>
              </PolarChart>
            ) : (
              <ThemedText style={{ textAlign: "center", color: textColor }}>No data available</ThemedText>
            )}
          </View>

          {/* 3. Line Chart: Total Duration Over Time */}
          <ThemedText style={styles.chartTitle}>Activity Over Time</ThemedText>
          <View style={{ height: 280 }}>
            {durationOverTime && durationOverTime.length > 0 ? (
              <CartesianChart
                data={durationOverTime}
                xKey="date"
                yKeys={["duration"]}
                axisOptions={{
                  font,
                  lineColor: borderColor,
                  labelColor: textColor,
                  formatXLabel(label) {
                    return label ?? "";
                  },
                }}
              >
                {({ points }) => {
                  return (
                    <Line
                      points={points.duration}
                      color={"#fafafa"}
                      strokeWidth={3}
                      animate={{
                        type: "timing",
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                      }}
                      connectMissingData
                    />
                  );
                }}
              </CartesianChart>
            ) : (
              <ThemedText style={{ textAlign: "center", color: textColor }}>No data available</ThemedText>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

export const PieChartCustomLabel = ({
  slice,
  font,
  position,
}: {
  slice: PieSliceData;
  font: SkFont | null;
  position: { x: number; y: number };
}) => {
  const { x, y } = position;
  const fontSize = font?.getSize() ?? 0;
  const getLabelWidth = (text: string) =>
    font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((sum, value) => sum + value, 0) ?? 0;

  const label = slice.label;
  const value = `${slice.value} UNITS`;
  const centerLabel = (font?.getSize() ?? 0) / 2;

  return (
    <Group transform={[{ translateY: -centerLabel }]}>
      <Text x={x - getLabelWidth(label) / 2} y={y} text={label} font={font} color={"white"} />
      <Group>
        <Text
          x={x - getLabelWidth(value) / 2}
          y={y + fontSize}
          text={value}
          font={font}
          color={invertHex(slice.color.toString())}
          strokeWidth={3}
        />
      </Group>
    </Group>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacings.md,
  },
  selectorRow: {
    flexDirection: "row",
    gap: Spacings.md,
  },
  rangeBtn: {
    paddingVertical: Spacings.xs,
    paddingHorizontal: Spacings.md,
    borderRadius: 999,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 24,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacings.lg,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacings.sm,
    borderRadius: 12,
    marginHorizontal: Spacings.xs,
  },
});
