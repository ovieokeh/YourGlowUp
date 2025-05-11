import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { useGetActivityBySlug } from "@/backend/queries/activities";
import { useAddActivityLog } from "@/backend/queries/logs";
import { LogType } from "@/backend/shared";
import { ProgressBar } from "@/components/ProgressBar";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useActivityDuration } from "@/hooks/useActivityDuration";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSound } from "@/utils/sounds";
import { useSearchParams } from "expo-router/build/hooks";

export default function ActivitySession() {
  const { user } = useAppContext();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId") || "";
  const router = useRouter();

  const activityQuery = useGetActivityBySlug(goalId, slug as string);
  const activity = useMemo(() => {
    if (activityQuery.data) {
      return activityQuery.data;
    }
    return null;
  }, [activityQuery.data]);

  const cumulativeActivityDuration = useActivityDuration(activity);

  const [timeLeft, setTimeLeft] = useState(cumulativeActivityDuration);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = useSharedValue(0);

  const saveLogMutation = useAddActivityLog(user?.id);
  const { play } = useSound();

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const card = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const border = useThemeColor({}, "border");
  const success = useThemeColor({}, "success");
  const danger = useThemeColor({}, "danger");

  useEffect(() => {
    if (started && timeLeft > 0 && cumulativeActivityDuration > 0) {
      progress.value = withTiming((cumulativeActivityDuration - timeLeft) / cumulativeActivityDuration);
    } else if (started && timeLeft === 0 && cumulativeActivityDuration > 0) {
      progress.value = withTiming(1);
    }
  }, [cumulativeActivityDuration, progress, started, timeLeft]);

  useEffect(() => {
    let timer: number | undefined;
    let soundTimer: number | undefined;

    if (started && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
        if (timeLeft > 1) {
          play("tick");
        }
      }, 1000);
    } else if (timeLeft === 0 && started && !completed) {
      setCompleted(true);
    }

    return () => {
      clearInterval(timer);
      clearInterval(soundTimer);
    };
  }, [completed, started, timeLeft, activity?.name, cumulativeActivityDuration, play]);

  const handleStart = () => setStarted(true);

  const handleQuit = () => {
    if (!activity) return;
    const timeElapsed = cumulativeActivityDuration - timeLeft;
    const threshold = Math.floor(cumulativeActivityDuration / 3);

    if (timeElapsed >= threshold) {
      Alert.alert(
        "Quit Early?",
        `You've completed ${Math.round(
          (timeElapsed / cumulativeActivityDuration) * 100
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

  const handleComplete = useCallback(async () => {
    if (!activity || !user?.id) return;
    const finalDuration = cumulativeActivityDuration - timeLeft;
    await saveLogMutation.mutateAsync({
      type: LogType.ACTIVITY,
      userId: user.id,
      goalId,
      activityId: activity.id,
      activityType: activity.type,
      meta: { duration: finalDuration },
    });
    play("complete-exercise");

    router.replace("/");
  }, [cumulativeActivityDuration, activity, play, router, saveLogMutation, goalId, user?.id, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && started) {
      setCompleted(true);
      setStarted(false);
      setTimeLeft(cumulativeActivityDuration);
      progress.value = withTiming(0);
      handleComplete();
    }
  }, [timeLeft, started, cumulativeActivityDuration, progress, handleComplete]);

  if (!activity) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: background }]}>
        <Stack.Screen options={{ title: "Oops!" }} />

        <ThemedText style={styles.title}>Activity not found.</ThemedText>
      </ThemedView>
    );
  }

  const hasDuration = cumulativeActivityDuration > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: activity.name,
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
      {activity.featuredImage && (
        <Image source={{ uri: activity.featuredImage }} style={styles.image} resizeMode="cover" />
      )}
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
              <ThemedText style={styles.infoText}>Target Area: {activity.category}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{activity.description}</ThemedText>
          </View>
          {!!activity.steps?.length && (
            <View style={styles.instructions}>
              <ThemedText style={styles.instructionsTitle}>Steps:</ThemedText>
              {activity.steps?.map((step, idx) => (
                <ThemedText key={idx} style={styles.step}>
                  {idx + 1}. {step.content}
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
