import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";

import { useAddActivityLog, useGetTodayLogsByActivityId } from "@/backend/queries/logs";
import {
  GoalActivity,
  hasCompletionPrompts,
  isGuidedActivity,
  LogType,
  NotificationRecurrence,
} from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useActivityDuration } from "@/hooks/useActivityDuration";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSound } from "@/utils/sounds";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { RedoBadge } from "./RedoBadge";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedTextInput } from "./ThemedTextInput";

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

  const handleTaskCompletion = async () => {
    if (!goalId) {
      Toast.show({ type: "error", text1: "Error", text2: "Goal ID is not available" });
      return;
    }
    if (!userId) {
      Toast.show({ type: "error", text1: "Error", text2: "User ID is not available" });
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

  const readableDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.card,
        {
          alignItems: "center",
          // justifyContent: "center",
          borderColor: cardBorder,
        },
        mode === "action"
          ? {
              position: "relative",
              backgroundColor: hasTodayLogs ? successBg : cardBg,
              opacity: mode === "action" && hasTodayLogs ? 0.7 : 1,
            }
          : {},
      ]}
    >
      <Image source={item.featuredImage} style={{ width: 40, height: 40, borderRadius: BorderRadii.sm }} />
      <View style={{ padding: Spacings.sm, width: "70%", flexWrap: "wrap" }}>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

        <View style={styles.row}>
          <ThemedText style={styles.exerciseArea}>{item.category}</ThemedText>
          {isGuidedActivity(item) && (
            <>
              <IconSymbol name="clock" size={14} color={textColor} />
              <ThemedText style={styles.description}>{readableDuration(duration)}</ThemedText>
            </>
          )}

          {!allowCompletion && item.scheduledTimes?.length ? (
            <View style={styles.row}>
              <IconSymbol name="alarm" size={16} color={textColor} />
              {item.recurrence === NotificationRecurrence.WEEKLY ? (
                <ThemedText style={styles.description}>Weekly</ThemedText>
              ) : (
                <>
                  {item.scheduledTimes.slice(0, 3).map((time, i) => (
                    <ThemedText key={i} style={styles.description}>
                      {time}
                      {i < 2 && i < item.scheduledTimes!.length - 1 ? ", " : ""}
                    </ThemedText>
                  ))}
                  {item.scheduledTimes.length > 3 && (
                    <ThemedText style={styles.description}>+{item.scheduledTimes.length - 3} more</ThemedText>
                  )}
                </>
              )}
            </View>
          ) : null}
        </View>
      </View>

      {mode === "display" && (
        <View style={[{ marginLeft: "auto" }]}>
          <IconSymbol name="chevron.right" size={16} color={textColor} />
        </View>
      )}

      {allowCompletion &&
        (hasTodayLogs ? (
          <Pressable
            style={{ padding: Spacings.sm, paddingRight: 0, marginLeft: "auto" }}
            onPress={handleTaskCompletion}
          >
            <RedoBadge count={logs.length} color={successColor} textColor={textColor} size={38} />
          </Pressable>
        ) : (
          <ThemedButton
            onPress={handleTaskCompletion}
            variant="ghost"
            icon={"checkmark.circle"}
            iconPlacement="right"
            style={{ marginLeft: "auto" }}
            textStyle={{ color: successColor }}
            iconSize={32}
          />
        ))}

      {/* Modal for task questions */}
      {hasCompletionPrompts(item) && item.completionPrompts?.length && (
        <TaskQuestionsModal
          currentQuestionIndex={currentQuestionIndex}
          item={item}
          isVisible={questionModalVisible}
          handleSkipQuestions={() => {
            Alert.alert(
              "Skip Questions",
              "Are you sure you want to skip the questions?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Mark as complete",
                  onPress: () => {
                    handleTaskCompletion();
                  },
                },
                {
                  text: "Exit task",
                  style: "destructive",
                  onPress: () => {
                    setQuestionModalVisible(false);
                  },
                },
              ],
              { cancelable: true }
            );
          }}
          handleSubmitAnswers={async () => {
            if (!goalId) {
              Toast.show({ type: "error", text1: "Error", text2: "Goal ID is not available" });
              return;
            }
            if (!userId) {
              Toast.show({ type: "error", text1: "Error", text2: "User ID is not available" });
              return;
            }
            await addActivityLog.mutateAsync({
              userId,
              goalId,
              activityId: item.id,
              activityType: item.type,
              type: LogType.ACTIVITY,
              meta: answers,
            });
            await play("complete-task");
            Toast.show({
              type: "success",
              text1: "Task completed",
              text2: `You completed ${item.name}`,
            });
            setQuestionModalVisible(false);
          }}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          answers={answers}
          setAnswers={setAnswers}
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
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacings.sm,
    paddingLeft: Spacings.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",

    gap: Spacings.xs,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseArea: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
  },
});
