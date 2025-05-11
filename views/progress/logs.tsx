import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { useGetLogs } from "@/backend/queries/logs";
import { isActivityLog, isPromptLog } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

const TABS = ["Activities", "Prompts"] as const;

const renderMeta = (meta: Record<string, unknown> | string) => {
  try {
    let finalNote = "";
    const metaEntries = Object.entries(meta);
    for (const [key, value] of metaEntries) {
      if (typeof value === "string") {
        finalNote += `${key}: ${value}\n`;
      } else if (typeof value === "object") {
        finalNote += `${key}: ${JSON.stringify(value, null, 2)}\n`;
      }
    }
    return finalNote.trim();
  } catch {
    return "Error parsing meta.";
  }
};

export function ProgressLogsView({ userId, selectedGoalId }: { userId?: string; selectedGoalId?: string }) {
  const router = useRouter();
  const logsQuery = useGetLogs(userId);
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);
  const params = useLocalSearchParams();
  const initialTab = params.logsTab === "Activities" ? "Activities" : "Prompts";

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const underline = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");

  const filteredLogs = selectedGoalId ? logs.filter((log) => log.goalId === selectedGoalId) : logs;

  const activityLogs = filteredLogs.filter(isActivityLog);
  const promptLogs = filteredLogs.filter(isPromptLog);

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

      {activeTab === "Activities" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={activityLogs}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No tasks completed yet.</ThemedText>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <ThemedText style={styles.rowText}>{item.type}</ThemedText>
              {item.meta && (
                <View
                  style={{
                    flexDirection: "row",
                    padding: Spacings.sm,
                    borderRadius: BorderRadii.sm,
                  }}
                >
                  <IconSymbol name="pencil.and.scribble" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>{renderMeta(item.meta)}</ThemedText>
                </View>
              )}
              <ThemedText style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</ThemedText>
            </View>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={promptLogs}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No exercises logged yet.</ThemedText>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <ThemedText style={styles.exercise}>{item.type}</ThemedText>
              <View
                style={{
                  marginTop: Spacings.sm,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {item.meta?.duration && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol name="clock" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>
                      Duration: <ThemedText style={styles.bold}>{item.meta?.duration} min</ThemedText>
                    </ThemedText>
                  </View>
                )}
                <ThemedText style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</ThemedText>
              </View>
            </View>
          )}
        />
      )}
      <ThemedFabButton
        onPress={() => router.push("/activities")}
        icon="plus"
        iconPlacement="right"
        title="Start an Activity"
        variant="solid"
        bottom={96}
      />
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
