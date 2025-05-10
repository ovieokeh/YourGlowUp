import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ProgressReview } from "@/components/ProgressReview";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetPhotoLogs } from "@/queries/logs";
import { PhotoLog } from "@/queries/logs/logs";

const RANGE_OPTIONS = ["7d", "30d", "3mo", "all"];

export function ProgressPhotoView({ selectedRoutine }: { selectedRoutine?: number | undefined }) {
  const router = useRouter();
  const logsQuery = useGetPhotoLogs(selectedRoutine);
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);
  const [range, setRange] = useState<"7d" | "30d" | "3mo" | "all">("30d");

  const now = useMemo(() => new Date(), []);
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");

  const rangeStart = useMemo(() => {
    const d = new Date(now);
    if (range === "7d") d.setDate(d.getDate() - 7);
    else if (range === "30d") d.setDate(d.getDate() - 30);
    else if (range === "3mo") d.setMonth(d.getMonth() - 3);
    else return null;
    return d;
  }, [now, range]);

  const filtered = useMemo(
    () => logs.filter((l) => (rangeStart ? new Date(l.createdAt) >= rangeStart! : true)) as PhotoLog[],
    [logs, rangeStart]
  );

  return (
    <View style={styles.container}>
      {filtered.length ? (
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
      ) : null}

      <ScrollView>
        <View style={{ paddingBottom: 96 }}>
          <ProgressReview photoLogs={filtered} />
        </View>
      </ScrollView>

      <ThemedFabButton
        icon="camera"
        title="Log photo"
        onPress={() => {
          router.push({
            pathname: "/routines/add-photo-log",
            params: {
              routineId: selectedRoutine,
            },
          });
        }}
        bottom={96}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.md,
    paddingBottom: Spacings.xl * 2,
  },
  selectorRow: {
    flexDirection: "row",
    gap: Spacings.md,
    marginBottom: Spacings.lg,
  },
  rangeBtn: {
    paddingVertical: Spacings.xs,
    paddingHorizontal: Spacings.md,
    borderRadius: 999,
    borderWidth: 1,
  },
  section: {
    marginTop: Spacings.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacings.sm,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: Spacings.xl,
  },
});
