import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { ProgressReview } from "@/components/ProgressReview";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getLogs, isUserLog, Log } from "@/utils/db";

const RANGE_OPTIONS = ["7d", "30d", "3mo", "all"];

export default function TrackScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "3mo" | "all">("30d");

  const now = useMemo(() => new Date(), []);
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");

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

  const photoURIs = useMemo(() => {
    const photos = filtered
      .filter(isUserLog)
      .map((l) => l.photoUri)
      .filter(Boolean);
    return (photos.length ? photos : []).filter((uri) => !!uri) as string[];
  }, [filtered]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <ThemedView style={[styles.container]}>
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

          <ProgressReview photoURIs={photoURIs!} />
          <ThemedFabButton
            icon="camera"
            title="Add a self-report log"
            onPress={() => {
              router.push({
                pathname: "/(tabs)/add-user-log",
                params: { activeTab: "Self Reports" },
              });
            }}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 92 },
  selectorRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  rangeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: { textAlign: "center", marginVertical: 32 },
});
