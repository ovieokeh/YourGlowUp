import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { EXERCISES } from "@/constants/Exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { saveExerciseLog } from "@/utils/db";

export default function ExerciseSession() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const exercise = useMemo(() => EXERCISES.find((e) => e.name === decodeURIComponent(slug)), [slug]);

  const [timeLeft, setTimeLeft] = useState(exercise?.duration || 0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = useSharedValue(0);

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const card = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const border = useThemeColor({}, "border");
  const success = useThemeColor({}, "success");
  const danger = useThemeColor({}, "danger");
  const primary = useThemeColor({}, "tint");

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
            onPress: () => {
              saveExerciseLog(exercise.name, timeElapsed);
              router.replace("/(tabs)/progress/logs?activeTab=Exercise%Logs");
            },
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
    router.replace("/(tabs)/progress/logs?activeTab=Exercise%Logs");
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

        {!started && (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow.backward" size={16} color={textColor} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  scrollView: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 220,
    marginVertical: 15,
    borderRadius: 12,
  },
  infoCard: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    width: "100%",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  descriptionContainer: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  instructions: {
    marginTop: 10,
  },
  instructionsTitle: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 16,
  },
  step: {
    fontSize: 14,
    marginVertical: 2,
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  timer: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
  },
  startButton: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  quitButton: {
    padding: 10,
    borderRadius: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  completeButton: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: 4,
  },
});
