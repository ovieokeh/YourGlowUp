import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetUserXP } from "@/queries/gamification";
import { getStreak } from "@/queries/gamification/gamification";
import { useGetLogs } from "@/queries/logs";

export default function ExerciseCompleteScreen() {
  const router = useRouter();
  const allLogsQuery = useGetLogs();
  const allLogs = useMemo(() => allLogsQuery.data || [], [allLogsQuery.data]);

  const userXPQuery = useGetUserXP();
  const xp = userXPQuery.data || 0;

  const border = useThemeColor({}, "border");
  const successBg = useThemeColor({}, "successBg");

  const streak = useMemo(() => {
    return getStreak(allLogs);
  }, [allLogs]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ ...styles.container, backgroundColor: successBg }}>
        <Image source={require("@/assets/images/congrats.gif")} style={styles.image} resizeMode="contain" />

        <ThemedText type="title" style={{ marginBottom: 8 }}>
          Great Job!
        </ThemedText>
        <ThemedText type="subtitle" style={{ textAlign: "center", marginBottom: 24 }}>
          You’ve completed your session and earned progress points.
        </ThemedText>

        <View style={[styles.card, { borderColor: border }]}>
          <ThemedText style={styles.label}>Current Streak</ThemedText>
          <ThemedText type="title" style={styles.value}>
            {streak} day{`${streak > 1 ? "s" : ""}`}
          </ThemedText>
        </View>

        <View style={[styles.card, { borderColor: border }]}>
          <ThemedText style={styles.label}>Total XP</ThemedText>
          <ThemedText type="title" style={styles.value}>
            {xp}
          </ThemedText>
        </View>

        <ThemedButton
          title="Back to Home"
          onPress={() => {
            router.replace("/(tabs)");
          }}
          style={{ marginTop: 32 }}
          variant="solid"
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "80%",
    height: 200,
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  value: {
    marginTop: 4,
  },
});
