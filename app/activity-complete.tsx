import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetStats } from "@/backend/queries/stats";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ActivityCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const goalId = params.goalId as string;

  const statsQuery = useGetStats(goalId);
  const stats = useMemo(() => statsQuery.data, [statsQuery.data]);

  const border = useThemeColor({}, "border");
  const successBg = useThemeColor({}, "successBg");

  const streak = stats?.consistency.currentStreak ?? 0;
  const activeDays = stats?.consistency.totalActiveDays ?? 0;

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
          <ThemedText style={styles.label}>Active Days</ThemedText>
          <ThemedText type="title" style={styles.value}>
            {activeDays}
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
