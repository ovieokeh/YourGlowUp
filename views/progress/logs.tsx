import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetLogs } from "@/queries/logs";
import { ExerciseLog, isExerciseLog, isTaskLog, TaskLog } from "@/queries/logs/logs";
import { useGetRoutines } from "@/queries/routines";

const TABS = ["Tasks", "Exercises"] as const;

const renderTaskNote = (note: string) => {
  try {
    const parsedNote = JSON.parse(note);
    return JSON.stringify(parsedNote, null, 2);
  } catch {
    return note;
  }
};

export function ProgressLogsView() {
  const router = useRouter();
  const routinesQuery = useGetRoutines();
  const routines = routinesQuery.data || [];
  const logsQuery = useGetLogs();
  const logs = logsQuery.data || [];
  const params = useLocalSearchParams();
  const initialTab = params.logsTab === "Exercises" ? "Exercises" : "Tasks";
  const initialRoutineId = (params.routineId as string) || 1;

  const [selectedRoutine, setSelectedRoutine] = useState<number | null>(+initialRoutineId);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const underline = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");

  const filteredLogs = selectedRoutine ? logs.filter((log) => log.routineId === selectedRoutine) : logs;

  const exerciseLogs = filteredLogs.filter(isExerciseLog) as ExerciseLog[];
  const taskLogs = filteredLogs.filter(isTaskLog) as TaskLog[];

  const handleTabPress = (tab: (typeof TABS)[number], index: number) => {
    setActiveTab(tab);
  };

  const routineOptions = routines.map((routine) => ({
    label: routine.name,
    value: routine.id,
  }));

  return (
    <View style={{ flex: 1, paddingBottom: Spacings.xl * 2 }}>
      <View style={{ padding: Spacings.md, paddingBottom: 0 }}>
        <ThemedPicker
          items={routineOptions}
          selectedValue={selectedRoutine}
          onValueChange={(value) => setSelectedRoutine(value)}
          style={{ marginBottom: Spacings.md }}
          placeholder="Select a routine"
          disabled={routines.length === 0}
        />
      </View>
      <View style={[styles.tabBar, { borderColor: underline }]}>
        {TABS.map((tab, idx) => (
          <ThemedButton
            variant="outline"
            key={tab}
            onPress={() => handleTabPress(tab, idx)}
            active={activeTab === tab}
            title={tab}
          />
        ))}
      </View>

      {activeTab === "Tasks" ? (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={taskLogs}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No tasks completed yet.</ThemedText>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <ThemedText style={styles.rowText}>{item.slug}</ThemedText>
                {item.notes && (
                  <View
                    style={{
                      flexDirection: "row",
                      padding: Spacings.sm,
                      borderRadius: BorderRadii.sm,
                    }}
                  >
                    <IconSymbol name="pencil.and.scribble" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>{renderTaskNote(item.notes)}</ThemedText>
                  </View>
                )}
                <ThemedText style={styles.timestamp}>{new Date(item.completedAt).toLocaleString()}</ThemedText>
              </View>
            )}
          />

          <ThemedFabButton
            onPress={() => router.push("/add-photo-log")}
            icon="plus"
            iconPlacement="right"
            title="Log photo"
            variant="solid"
            bottom={96}
          />
        </>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={exerciseLogs}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No exercises logged yet.</ThemedText>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <ThemedText style={styles.exercise}>{item.slug}</ThemedText>
                <View
                  style={{
                    marginTop: Spacings.sm,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol name="clock" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>
                      Duration: <ThemedText style={styles.bold}>{item.duration} min</ThemedText>
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.timestamp}>{new Date(item.completedAt).toLocaleString()}</ThemedText>
                </View>
              </View>
            )}
          />

          <ThemedFabButton
            onPress={() => router.push("/exercises")}
            icon="plus"
            iconPlacement="right"
            title="Start an Exercise"
            variant="solid"
            bottom={96}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    gap: Spacings.sm,
    padding: Spacings.md,
  },
  list: {
    padding: Spacings.md,
    paddingTop: 0,
    paddingBottom: Spacings.xl * 2,
    gap: Spacings.md,
  },
  log: {
    padding: Spacings.md,
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadii.md,
    marginBottom: Spacings.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  rowText: {
    marginLeft: Spacings.xs,
    fontSize: 15,
  },
  bold: {
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    alignSelf: "flex-end",
  },
  exercise: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    paddingVertical: Spacings.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginBottom: Spacings.md,
  },
});
