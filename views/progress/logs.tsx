import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetLogs } from "@/queries/logs";
import { ExerciseLog, isExerciseLog, isUserLog, UserLog } from "@/queries/logs/logs";

const TABS = ["Self Reports", "Exercise Logs"] as const;

export function ProgressLogsView() {
  const router = useRouter();
  const logsQuery = useGetLogs();
  const logs = logsQuery.data || [];
  const params = useLocalSearchParams();
  const initialTab = params.logsTab === "Exercise Logs" ? "Exercise Logs" : "Self Reports";

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const underline = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const success = useThemeColor({}, "success");
  const danger = useThemeColor({}, "danger");

  const exerciseLogs = logs.filter(isExerciseLog) as ExerciseLog[];
  const userLogs = logs.filter(isUserLog) as UserLog[];

  const handleTabPress = (tab: (typeof TABS)[number], index: number) => {
    setActiveTab(tab);
  };

  return (
    <View style={{ flex: 1, paddingBottom: Spacings.xl * 2 }}>
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

      {activeTab === "Self Reports" ? (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={userLogs}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No self reports yet.</ThemedText>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.photo} />}
                <View style={styles.row}>
                  <IconSymbol name="face.smiling.fill" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Dominant side: <ThemedText style={styles.bold}>{item.dominantSide}</ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol name="clock" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Chewing duration: <ThemedText style={styles.bold}>{item.chewingDuration} min</ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol
                    name={item.gumUsed ? "checkmark.circle" : "xmark.circle"}
                    size={18}
                    color={item.gumUsed ? success : danger}
                  />
                  <ThemedText style={styles.rowText}>
                    {item.gumUsed ? `Gum: ${item.gumChewingDuration} min` : "No gum used"}
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol name="face.smiling" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Symmetry rating: <ThemedText style={styles.bold}>{item.symmetryRating}</ThemedText>
                  </ThemedText>
                </View>
                {item.notes && (
                  <View style={styles.row}>
                    <IconSymbol name="message" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>Notes: {item.notes}</ThemedText>
                  </View>
                )}
                <ThemedText style={styles.timestamp}>{new Date(item.completedAt).toLocaleString()}</ThemedText>
              </View>
            )}
          />

          <ThemedFabButton
            onPress={() => router.push("/add-user-log")}
            icon="plus"
            iconPlacement="right"
            title="Add Log"
            variant="solid"
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
                <ThemedText style={styles.exercise}>{item.exercise}</ThemedText>
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
