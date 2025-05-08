import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { ProgressBar } from "@/components/ProgressBar";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { EXERCISES } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { LOG_TYPE_XP_MAP } from "@/queries/gamification/gamification";
import { useSaveExerciseLog } from "@/queries/logs";
import { useSearchParams } from "expo-router/build/hooks";

export default function ExerciseSession() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId") || "";
  const router = useRouter();
  const { addXP } = useBadges();

  const exercise = useMemo(
    () => EXERCISES.find((e) => e.itemId === slug || e.name === decodeURIComponent(slug)),
    [slug]
  );

  const [timeLeft, setTimeLeft] = useState(exercise?.duration || 0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = useSharedValue(0);

  const saveExerciseLogMutation = useSaveExerciseLog(routineId);

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
    }

    return () => clearInterval(timer);
  }, [completed, started, timeLeft, exercise?.name, exercise?.duration]);

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

  const handleComplete = async () => {
    if (!exercise) return;
    await saveExerciseLogMutation.mutateAsync({ exercise: exercise.name, duration: exercise.duration });
    addXP
      .mutateAsync(LOG_TYPE_XP_MAP["exercise"] + exercise.duration)
      .catch((err) => {
        console.error("Error adding XP:", err);
      })
      .finally(() => {
        router.replace(`/exercise-complete?exercise=${exercise.name}`);
      });
  };

  if (!exercise) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <ThemedText style={styles.title}>Exercise not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, styles.scrollView]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacings.md,
    paddingBottom: Spacings.xl,
  },
  scrollView: {
    paddingHorizontal: Spacings.lg,
    alignItems: "center",
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
