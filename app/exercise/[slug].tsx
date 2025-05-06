import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { EXERCISES } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { addXP, LOG_TYPE_XP_MAP } from "@/utils/gamification";
import { saveExerciseLog } from "@/utils/logs";

export default function ExerciseSession() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const exercise = useMemo(() => EXERCISES.find((e) => e.id === slug || e.name === decodeURIComponent(slug)), [slug]);

  const [timeLeft, setTimeLeft] = useState(exercise?.duration || 0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = useSharedValue(0);

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const card = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const border = useThemeColor({}, "border");

  useEffect(() => {
    if (started && timeLeft > 0 && exercise) {
      progress.value = withTiming((exercise.duration - timeLeft) / exercise.duration);
    } else if (started && timeLeft === 0 && exercise) {
      progress.value = withTiming(1);
    }
  }, [exercise, progress, started, timeLeft]);

  useEffect(() => {
    let timer: number | undefined;

    if (started && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && started && !completed) {
      setCompleted(true);
      Alert.alert("Well done!", "You completed the session.");
    }

    return () => clearInterval(timer);
  }, [completed, started, timeLeft]);

  const handleStart = () => setStarted(true);

  const handleQuit = () => {
    if (!exercise) return;
    const timeElapsed = exercise.duration - timeLeft;
    const threshold = Math.floor(exercise.duration / 3);

    if (timeElapsed >= threshold) {
      Alert.alert(
        "Quit Early?",
        `You've completed ${Math.round(
          (timeElapsed / exercise.duration) * 100
        )}% of the session.\nThis will still be saved.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save & Quit",
            style: "default",
            onPress: handleComplete,
          },
        ]
      );
    } else {
      Alert.alert("Quit Session?", "You've completed too little to save progress.", [
        { text: "Cancel", style: "cancel" },
        { text: "Quit", style: "destructive", onPress: () => router.back() },
      ]);
    }
  };

  const handleComplete = () => {
    if (!completed || !exercise) return;
    saveExerciseLog(exercise.name, exercise.duration);
    addXP(LOG_TYPE_XP_MAP["exercise"] + exercise.duration)
      .catch((err) => {
        console.error("Error adding XP:", err);
      })
      .finally(() => {
        // router.replace("/(tabs)/progress?activeTab=Logs&logsTab=Exercise%20Logs");
        router.replace("/exercise-complete");
      });
  };

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
        <ThemedText style={styles.title}>Exercise not found.</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ThemedText type="title">{exercise.name}</ThemedText>
        <Image source={{ uri: exercise.animation }} style={styles.image} resizeMode="contain" />

        <View style={[styles.infoCard, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.descriptionContainer, { backgroundColor: border }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="target" size={18} color={textColor} />
              <ThemedText style={styles.infoText}>Target Area: {exercise.area}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{exercise.description}</ThemedText>
          </View>
          <View style={styles.instructions}>
            <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
            {exercise.instructions.map((step, idx) => (
              <ThemedText key={idx} style={styles.step}>
                {idx + 1}. {step}
              </ThemedText>
            ))}
          </View>
        </View>

        <View style={{ gap: Spacings.md, width: "100%" }}>
          {started && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
              <ThemedText style={styles.timer}>{timeLeft}s remaining</ThemedText>
            </View>
          )}

          <View style={[styles.infoRow, { justifyContent: "space-between", width: "100%" }]}>
            <Pressable style={styles.backButton} onPress={() => router.back()} disabled={started}>
              <IconSymbol name="arrow.backward" size={16} color={textColor} />
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </Pressable>

            <ThemedButton
              title={started ? (completed ? "Finish Session" : "Quit Early") : "Start Session"}
              onPress={started ? (completed ? handleComplete : handleQuit) : handleStart}
              variant={started ? (completed ? "primary" : "destructive") : "success"}
              icon={started ? (completed ? "checkmark.rectangle" : "x.circle") : "play"}
              iconPlacement="right"
              style={styles.startButton}
              textStyle={styles.startButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacings.md,
  },
  scrollView: {
    paddingHorizontal: Spacings.lg,
    alignItems: "center",
    paddingBottom: Spacings.xl,
    gap: Spacings.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadii.md,
  },
  infoCard: {
    borderWidth: 1,
    padding: Spacings.md,
    borderRadius: BorderRadii.md,
    width: "100%",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacings.xs,
  },
  infoText: {
    marginLeft: Spacings.xs,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  descriptionContainer: {
    padding: Spacings.sm,
    borderRadius: BorderRadii.sm,
    marginVertical: Spacings.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  instructions: {
    marginTop: Spacings.sm,
  },
  instructionsTitle: {
    fontWeight: "700",
    marginBottom: Spacings.xs,
    fontSize: 16,
  },
  step: {
    fontSize: 14,
    marginVertical: 2,
  },
  progressContainer: {
    alignItems: "center",
    gap: Spacings.xs,
  },
  timer: {
    fontSize: 16,
    fontWeight: "700",
  },
  startButton: {
    padding: Spacings.sm,
    borderRadius: BorderRadii.md,
    alignItems: "center",
    marginVertical: Spacings.sm,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    marginTop: Spacings.xs,
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: Spacings.xs,
  },
});
