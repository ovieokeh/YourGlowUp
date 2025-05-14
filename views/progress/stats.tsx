import spaceMono from "@/assets/fonts/SpaceMono-Regular.ttf";
import { useGetStats } from "@/backend/queries/stats";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { invertHex } from "@/utils/color";
import { Group, SkFont, Text, useFont } from "@shopify/react-native-skia";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Easing } from "react-native-reanimated";
import { CartesianChart, Line, Pie, PieSliceData, PolarChart } from "victory-native";
const RANGE_OPTIONS = ["7d", "30d", "3mo", "all"];

export function ProgressStatsView({ selectedGoalId }: { selectedGoalId: string | undefined }) {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");
  const font = useFont(spaceMono, 12);

  const [now, setNow] = useState(Date.now());
  useFocusEffect(
    useCallback(() => {
      const newNow = Date.now();
      setNow(newNow);
    }, [])
  );

  const [range, setRange] = useState<"7d" | "30d" | "3mo" | "all">("30d");

  const statsQuery = useGetStats(
    undefined,
    range === "all" ? undefined : now - (range === "7d" ? 7 : range === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000,
    now
  );

  const stats = useMemo(() => {
    return statsQuery.data;
  }, [statsQuery.data]);

  useFocusEffect(
    useCallback(() => {
      statsQuery.refetch();
    }, [statsQuery])
  );

  const durationOverTime = useMemo(
    () =>
      stats?.timeSeries.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        duration: Number(d.totalDuration.toPrecision(2)),
      })),
    [stats]
  );
  console.log("durationOverTime", durationOverTime);
  const categoryStats = useMemo(
    () =>
      stats?.categoryStats
        .filter((d) => d.totalDuration > 0)
        .map((d) => ({
          category: d.category,
          totalDuration: Number(d.totalDuration.toPrecision(2)),
          color: COLORS[stats?.categoryStats.indexOf(d) % COLORS.length],
        })),
    [stats]
  );

  console.log("stats", stats);
  console.log("categoryStats", categoryStats);
  console.log("durationOverTime", durationOverTime);

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
          {/* 1. Pie Chart: Area Distribution */}
          <ThemedText type="subtitle" style={styles.chartTitle}>
            Focus Areas
          </ThemedText>
          <View style={{ height: 280 }}>
            {categoryStats && categoryStats.length > 0 ? (
              <PolarChart
                data={categoryStats.map((d) => ({
                  x: d.category,
                  y: d.totalDuration,
                  color: d.color,
                }))}
                labelKey="x"
                valueKey="y"
                colorKey="color"
              >
                <Pie.Chart>
                  {({ slice }) => {
                    const labelFormat = (value: string) => {
                      // replace dashes with spaces
                      const cleanedLabel = value.replace(/-/g, " ");
                      // capitalize the first letter of each word
                      const capitalizedLabel = cleanedLabel
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                      return capitalizedLabel;
                    };

                    const valueFormat = (value: number) => {
                      // since this is a duration in seconds, we need to convert it to a readable format
                      const hours = Math.floor(value / 3600);
                      const minutes = Math.floor((value % 3600) / 60);
                      const seconds = Math.floor(value % 60);
                      return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`;
                    };

                    return (
                      <Pie.Slice key={slice.label}>
                        <Pie.Label radiusOffset={0.6}>
                          {(position) => (
                            <PieChartCustomLabel
                              position={position}
                              slice={slice}
                              font={font}
                              labelFormat={labelFormat}
                              valueFormat={valueFormat}
                            />
                          )}
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

          {/* 2. Line Chart: Total Duration Over Time */}
          <ThemedText type="subtitle" style={styles.chartTitle}>
            Activity Over Time
          </ThemedText>
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
                      color={textColor}
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
  labelFormat,
  valueFormat,
}: {
  slice: PieSliceData;
  font: SkFont | null;
  position: { x: number; y: number };
  labelFormat?: (value: string) => string;
  valueFormat?: (value: typeof slice.value) => string;
}) => {
  const { x, y } = position;
  const fontSize = font?.getSize() ?? 0;
  const getLabelWidth = (text: string) =>
    font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((sum, value) => sum + value, 0) ?? 0;

  let readableLabel = labelFormat ? labelFormat(slice.label) : slice.label;
  let readableValue = valueFormat ? valueFormat(slice.value) : slice.value.toString();

  const centerLabel = (font?.getSize() ?? 0) / 2;

  return (
    <Group transform={[{ translateY: -centerLabel }]}>
      <Text x={x - getLabelWidth(readableLabel) / 2} y={y} text={readableLabel} font={font} color={"white"} />
      <Group>
        <Text
          x={x - getLabelWidth(readableValue) / 2}
          y={y + fontSize}
          text={readableValue}
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
    marginBottom: Spacings.sm,
    marginTop: Spacings.xl,
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
    borderRadius: BorderRadii.md,
    marginHorizontal: Spacings.xs,
  },
});
