import { format, parse } from "date-fns";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";
import Toast from "react-native-toast-message";

import { useAddActivityLog, useGetTodayLogsByActivityId } from "@/backend/queries/logs";
import {
  ActivityScheduleEntry,
  GoalActivity,
  hasCompletionPrompts,
  isGuidedActivity,
  LogType,
  NotificationRecurrence,
} from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useActivityDuration } from "@/hooks/useActivityDuration";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSound } from "@/utils/sounds";
import { RedoBadge } from "./RedoBadge";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedTextInput } from "./ThemedTextInput";
import { ThemedView } from "./ThemedView";

const formatDayOfWeek = (dayOfWeek?: number): string => {
  if (dayOfWeek === undefined || dayOfWeek === null) return "";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days[dayOfWeek - 1] || "";
};

const formatScheduleEntry = (schedule: ActivityScheduleEntry, recurrence?: NotificationRecurrence): string => {
  try {
    const timePart = format(parse(schedule.timeOfDay, "HH:mm", new Date()), "h:mm a");
    if (recurrence === NotificationRecurrence.WEEKLY && schedule.dayOfWeek) {
      const dayPart = formatDayOfWeek(schedule.dayOfWeek);
      return `${dayPart} ${timePart}`;
    }
    return timePart;
  } catch (e) {
    console.error("Error formatting schedule entry:", schedule, e);
    return recurrence === NotificationRecurrence.WEEKLY
      ? `${formatDayOfWeek(schedule.dayOfWeek)} ${schedule.timeOfDay}`
      : schedule.timeOfDay;
  }
};

export const ActivityHorizontalCard = ({
  userId,
  goalId,
  item,
  handlePress,
  mode = "display",
  allowCompletion = false,
}: {
  userId?: string;
  goalId?: string;
  item: GoalActivity;
  handlePress: () => void;
  mode?: "display" | "action";
  allowCompletion?: boolean;
}) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "muted");
  const successColor = useThemeColor({}, "success");
  const successBg = useThemeColor({}, "successBg");
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const getLogsQuery = useGetTodayLogsByActivityId(userId, item?.id);
  const duration = useActivityDuration(item);

  const logs = useMemo(() => {
    return getLogsQuery.data || [];
  }, [getLogsQuery.data]);

  const hasTodayLogs = logs.length > 0;
  const { play } = useSound();
  const addActivityLog = useAddActivityLog(userId);

  const MAX_SCHEDULES_TO_SHOW = 2;
  const scheduleDisplayString = useMemo(() => {
    if (!item.schedules || item.schedules.length === 0) {
      return null;
    }
    const formattedSchedules = item.schedules
      .slice(0, MAX_SCHEDULES_TO_SHOW)
      .map((schedule) => formatScheduleEntry(schedule, item.recurrence))
      .join(", ");
    const remainingCount = item.schedules.length - MAX_SCHEDULES_TO_SHOW;
    const moreText = remainingCount > 0 ? ` +${remainingCount} more` : "";
    return formattedSchedules + moreText;
  }, [item.schedules, item.recurrence]);

  const handleTaskCompletion = async () => {
    if (!goalId || !userId) {
      console.error("Goal ID or User ID is missing");
      return;
    }
    if (hasCompletionPrompts(item) && item.completionPrompts?.length) {
      setQuestionModalVisible(true);
      return;
    }
    await addActivityLog.mutateAsync({
      userId,
      goalId,
      activityId: item.id,
      activityType: item.type,
      type: LogType.ACTIVITY,
      meta: {},
    });

    await play("complete-task");

    Toast.show({ type: "success", text1: "Task completed", text2: `You completed ${item.name}` });
  };

  const readableDuration = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (totalMinutes === 0 && remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    if (parts.length === 0 && seconds === 0) return "0m";
    return parts.join(" ");
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.card,
        {
          borderColor: cardBorder,
          backgroundColor: hasTodayLogs && mode === "action" ? successBg : cardBg,
          opacity: hasTodayLogs && mode === "action" ? 0.7 : 1,
        },
      ]}
    >
      {/* Image */}
      <Image
        source={{ uri: item.featuredImage }}
        style={styles.image}
        contentFit="cover"
        placeholder={require("@/assets/images/icon.png")}
      />

      {/* Text Content */}
      <View style={styles.contentContainer}>
        <ThemedText style={styles.exerciseName} numberOfLines={1}>
          {item.name}
        </ThemedText>

        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          {/* Category */}
          <View style={styles.metadataItem}>
            <IconSymbol name="tag" size={12} color={mutedTextColor} />
            <ThemedText style={styles.metadataText} numberOfLines={1}>
              {item.category}
            </ThemedText>
          </View>
          {/* Duration */}
          {isGuidedActivity(item) && duration > 0 && (
            <View style={styles.metadataItem}>
              <IconSymbol name="timer" size={12} color={mutedTextColor} />
              <ThemedText style={styles.metadataText}>{readableDuration(duration)}</ThemedText>
            </View>
          )}
          {/* --- UPDATED Schedule Info --- */}
          {!allowCompletion && scheduleDisplayString && (
            <View style={styles.metadataItem}>
              <IconSymbol name="calendar.badge.clock" size={12} color={mutedTextColor} />
              <ThemedText style={styles.metadataText} numberOfLines={1}>
                {scheduleDisplayString}
              </ThemedText>
            </View>
          )}
          {/* --- End Schedule Info --- */}
        </View>
      </View>

      {/* Action/Indicator */}
      <View style={styles.actionContainer}>
        {mode === "display" && <IconSymbol name="chevron.right" size={16} color={mutedTextColor} />}
        {allowCompletion &&
          (hasTodayLogs ? (
            <Pressable onPress={handleTaskCompletion} hitSlop={10}>
              <RedoBadge count={logs.length} color={successColor} textColor={textColor} size={38} />
            </Pressable>
          ) : (
            <ThemedButton
              onPress={handleTaskCompletion}
              variant="ghost"
              icon={"checkmark.circle"}
              style={styles.completeButton}
              textStyle={{
                color: successColor,
              }}
              iconSize={32}
            />
          ))}
      </View>

      {/* Modal remains unchanged */}
      {hasCompletionPrompts(item) && item.completionPrompts?.length && (
        <TaskQuestionsModal
          /* ... props ... */
          isVisible={questionModalVisible}
          item={item}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          answers={answers}
          setAnswers={setAnswers}
          handleSkipQuestions={() => {
            /* ... */ setQuestionModalVisible(false);
          }}
          handleSubmitAnswers={async () => {
            /* ... */ setQuestionModalVisible(false);
          }}
        />
      )}
    </Pressable>
  );
};
const TaskQuestionsModal = ({
  currentQuestionIndex,
  item,
  isVisible,
  handleSkipQuestions,
  handleSubmitAnswers,
  setCurrentQuestionIndex,
  answers,
  setAnswers,
}: {
  currentQuestionIndex: number;
  item: GoalActivity;
  isVisible: boolean;
  handleSkipQuestions: () => void;
  handleSubmitAnswers: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  answers: { [key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}) => {
  const screenHeight = useWindowDimensions().height;

  const currentQuestion = useMemo(() => {
    const q = item.completionPrompts?.[currentQuestionIndex];

    if (!q) return null;
    if (q.reliesOn && (!answers[q.reliesOn] || answers[q.reliesOn] === "false")) {
      return null;
    }

    return q;
  }, [currentQuestionIndex, item.completionPrompts, answers]);

  const canSubmit = useMemo(() => {
    const questions = item.completionPrompts;

    if (!questions) return null;
    for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
      const q = questions[i];

      if (!q.reliesOn || (q.reliesOn && answers[q.reliesOn] && answers[q.reliesOn] !== "false")) {
        return false;
      }
    }

    return true;
  }, [currentQuestionIndex, item.completionPrompts, answers]);

  if (!item.completionPrompts || !currentQuestion) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView
        style={{
          flex: 1,
          padding: 24,
          height: screenHeight / 2, // Half screen height
        }}
      >
        <SafeAreaView>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <ThemedText type="subtitle">
              Question {currentQuestionIndex + 1} of{" "}
              {canSubmit ? currentQuestionIndex + 1 : item.completionPrompts.length}
            </ThemedText>
            <ThemedButton title="Exit" variant="ghost" onPress={handleSkipQuestions} />
          </View>

          <ThemedText style={{ marginBottom: 12 }}>{currentQuestion.prompt}</ThemedText>

          {currentQuestion.type === "text" ? (
            <ThemedTextInput
              placeholder="Your answer"
              value={answers[currentQuestion.id] || ""}
              onChangeText={(text) => setAnswers({ ...answers, [currentQuestion.id]: text })}
            />
          ) : currentQuestion.type === "boolean" ? (
            <View style={{ flexDirection: "row", gap: Spacings.sm }}>
              <ThemedButton
                title="Yes"
                onPress={() => setAnswers({ ...answers, [currentQuestion.id]: "true" })}
                variant={answers[currentQuestion.id] === "true" ? "solid" : "ghost"}
              />

              <ThemedButton
                title="No"
                onPress={() => setAnswers({ ...answers, [currentQuestion.id]: "false" })}
                variant={answers[currentQuestion.id] === "false" ? "solid" : "ghost"}
              />
            </View>
          ) : currentQuestion.type === "select" && currentQuestion.options ? (
            <ThemedPicker
              selectedValue={answers[currentQuestion.id] || ""}
              onValueChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
              items={currentQuestion.options.map((opt) => ({ label: opt.label, value: opt.value }))}
              placeholder="Select an option"
              style={{ width: "100%" }}
            />
          ) : currentQuestion.type === "number" ? (
            <ThemedTextInput
              placeholder="Your answer"
              value={answers[currentQuestion.id] || ""}
              onChangeText={(text) => setAnswers({ ...answers, [currentQuestion.id]: text })}
              keyboardType="numeric"
            />
          ) : null}

          <ThemedButton
            title={canSubmit ? "Submit" : "Next"}
            onPress={() => {
              const nextIndex = (() => {
                for (let i = currentQuestionIndex + 1; i < item.completionPrompts!.length; i++) {
                  const q = item.completionPrompts![i];

                  if (!q.reliesOn || (q.reliesOn && answers[q.reliesOn] && answers[q.reliesOn] !== "false")) {
                    return i;
                  }
                }

                return -1;
              })();

              if (nextIndex === -1) {
                handleSubmitAnswers();
              } else {
                setCurrentQuestionIndex(nextIndex);
              }
            }}
            style={{ marginTop: 24 }}
          />
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    padding: Spacings.xs,
    overflow: "hidden",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: BorderRadii.sm,
    marginRight: Spacings.sm,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacings.xs / 2,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacings.sm,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs / 2,
  },
  metadataText: {
    fontSize: 12,
    color: "#666",
  },
  actionContainer: {
    marginLeft: "auto",
    paddingLeft: Spacings.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  completeButton: {
    padding: 0,
    margin: 0,
  },
});
