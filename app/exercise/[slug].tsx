import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { ProgressBar } from "@/components/ProgressBar";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Exercise, EXERCISES, TASKS } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { LOG_TYPE_XP_MAP } from "@/queries/gamification/gamification";
import { useSaveExerciseLog } from "@/queries/logs";
import { useSound } from "@/utils/sounds";
import { useSearchParams } from "expo-router/build/hooks";

export default function ExerciseSession() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId") || "";
  const routineIdNum = parseInt(routineId, 10);
  const router = useRouter();
  const { addXP } = useBadges();

  const exercise = useMemo(
    () =>
      EXERCISES.find((e) => e.slug === slug || e.name === decodeURIComponent(slug)) ||
      TASKS.find((e) => e.slug === slug || e.name === decodeURIComponent(slug)),
    [slug]
  );

  const [timeLeft, setTimeLeft] = useState((exercise as Exercise)?.duration || 0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const duration = useMemo(() => (exercise as Exercise)?.duration || 0, [exercise]);

  const progress = useSharedValue(0);

  const saveExerciseLogMutation = useSaveExerciseLog(routineIdNum);
  const { play } = useSound();

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const card = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const border = useThemeColor({}, "border");
  const success = useThemeColor({}, "success");
  const danger = useThemeColor({}, "danger");

  useEffect(() => {
    if (started && timeLeft > 0 && duration > 0) {
      progress.value = withTiming((duration - timeLeft) / duration);
    } else if (started && timeLeft === 0 && duration > 0) {
      progress.value = withTiming(1);
    }
  }, [duration, progress, started, timeLeft]);

  useEffect(() => {
    let timer: number | undefined;
    let soundTimer: number | undefined;

    if (started && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
        play("tick");
      }, 1000);
    } else if (timeLeft === 0 && started && !completed) {
      setCompleted(true);
    }

    return () => {
      clearInterval(timer);
      clearInterval(soundTimer);
    };
  }, [completed, started, timeLeft, exercise?.name, duration, play]);

  const handleStart = () => setStarted(true);

  const handleQuit = () => {
    if (!exercise) return;
    const timeElapsed = duration - timeLeft;
    const threshold = Math.floor(duration / 3);

    if (timeElapsed >= threshold) {
      Alert.alert(
        "Quit Early?",
        `You've completed ${Math.round((timeElapsed / duration) * 100)}% of the session.\nThis will still be saved.`,
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

  const handleComplete = useCallback(async () => {
    if (!exercise) return;
    await saveExerciseLogMutation.mutateAsync({ exercise: exercise.name, duration: duration });
    play("complete-exercise");
    addXP
      .mutateAsync(LOG_TYPE_XP_MAP["exercise"] + duration)
      .catch((err) => {
        console.error("Error adding XP:", err);
      })
      .finally(() => {
        router.replace(`/exercise-complete?exercise=${exercise.name}`);
      });
  }, [addXP, duration, exercise, play, router, saveExerciseLogMutation]);

  useEffect(() => {
    if (timeLeft === 0 && started) {
      setCompleted(true);
      setStarted(false);
      setTimeLeft(duration);
      progress.value = withTiming(0);
      handleComplete();
    }
  }, [timeLeft, started, duration, progress, handleComplete]);

  if (!exercise) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <Stack.Screen options={{ title: "Oops!" }} />

        <ThemedText style={styles.title}>Exercise not found.</ThemedText>
      </ThemedView>
    );
  }

  const hasDuration = (exercise as Exercise)?.duration > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: exercise.name,
          headerRight: () => (
            <ThemedButton
              title={started ? (completed ? "" : "") : ""}
              onPress={
                !hasDuration ? handleComplete : started ? (completed ? handleComplete : handleQuit) : handleStart
              }
              variant={"ghost"}
              icon={
                !hasDuration
                  ? "checkmark"
                  : started
                  ? completed
                    ? "checkmark.rectangle.fill"
                    : "x.circle.fill"
                  : "play.fill"
              }
              iconPlacement="right"
              style={styles.startButton}
              iconSize={28}
              textStyle={{
                ...styles.startButtonText,
                ...{
                  color: started ? (completed ? success : danger) : textColor,
                },
              }}
            />
          ),
        }}
      />
      {exercise.animation && <Image source={{ uri: exercise.animation }} style={styles.image} resizeMode="cover" />}
      <View style={{ gap: Spacings.md, marginTop: Spacings.md, width: "100%" }}>
        {started && (
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
            <ThemedText style={styles.timer}>{timeLeft}s remaining</ThemedText>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: background }, styles.scrollView]}>
        <View style={[styles.infoCard, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.descriptionContainer, { backgroundColor: border }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="target" size={18} color={textColor} />
              <ThemedText style={styles.infoText}>Target Area: {exercise.area}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{exercise.description}</ThemedText>
          </View>
          {!!exercise.instructions?.length && (
            <View style={styles.instructions}>
              <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
              {exercise.instructions?.map((step, idx) => (
                <ThemedText key={idx} style={styles.step}>
                  {idx + 1}. {step}
                </ThemedText>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
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
    // height: 320,
    aspectRatio: 1,
  },
  infoCard: {
    width: "100%",
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
    paddingVertical: Spacings.xs,
    marginLeft: "auto",
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
