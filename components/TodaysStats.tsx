import { formatDistanceToNow } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Log, getLogs, isExerciseLog } from "@/utils/db";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedButton } from "./ThemedButton";
import { ThemedView } from "./ThemedView";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export const TodaysStats: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const wrapperBorder = useThemeColor({}, "border");

  useFocusEffect(
    useCallback(() => {
      getLogs(setLogs);
    }, [])
  );

  const todayLogs = useMemo(() => {
    const today = new Date().toDateString();
    return logs.filter((log) => new Date(log.completedAt).toDateString() === today);
  }, [logs]);

  const exercisesToday = todayLogs.filter(isExerciseLog);
  const lastExercise = exercisesToday.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0];

  if (!todayLogs.length) {
    return (
      <View style={[styles.wrapper, { borderColor: wrapperBorder }]}>
        <ThemedText style={styles.emptyText}>No activity yet today. Ready to crush a session?</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { borderColor: wrapperBorder }]}>
      <ThemedText style={styles.title}>Today&apos;s Activity</ThemedText>

      <View style={styles.statsGrid}>
        <StatCard
          icon="figure.walk.circle"
          label="Exercises Done"
          value={exercisesToday.length.toString()}
          color={Colors[colorScheme].success}
          colorScheme={colorScheme}
        />

        {lastExercise && (
          <StatCard
            icon="clock"
            label="Last Exercise"
            value={lastExercise.exercise}
            subValue={formatDistanceToNow(new Date(lastExercise.completedAt), {
              addSuffix: true,
            })}
            color={Colors[colorScheme].tint}
            colorScheme={colorScheme}
          />
        )}
      </View>

      <ThemedButton
        title="View Progress"
        onPress={() => router.replace("/progress/stats")}
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
  colorScheme,
}: {
  icon: IconSymbolName;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  colorScheme: "light" | "dark";
}) => (
  <ThemedView style={[styles.card]}>
    <IconSymbol name={icon} color={color} size={22} />
    <View style={{ marginLeft: 12 }}>
      <ThemedText style={styles.cardLabel}>{label}</ThemedText>
      <ThemedText style={[styles.cardValue, { color: Colors[colorScheme].text }]}>{value}</ThemedText>
      {subValue && <ThemedText style={styles.cardSubValue}>{subValue}</ThemedText>}
    </View>
  </ThemedView>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3, // Android
  },
  cardLabel: {
    fontSize: 13,
    color: "#888",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubValue: {
    fontSize: 13,
    color: "#777",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    fontStyle: "italic",
  },
  button: {
    marginTop: 20,
    alignItems: "center",
    minWidth: 160,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
