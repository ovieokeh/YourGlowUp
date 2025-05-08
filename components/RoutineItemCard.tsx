import React, { useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { LOG_TYPE_XP_MAP } from "@/queries/gamification/gamification";
import { useGetLogsByTaskOrExercise, useSaveTaskLog } from "@/queries/logs";
import { isRoutineExerciseItem, isRoutineTaskItem, RoutineItem, RoutineTaskItem } from "@/queries/routines/shared";
import { useSound } from "@/utils/sounds";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedTextInput } from "./ThemedTextInput";

export const RoutineItemCard = ({
  item,
  handlePress,
  mode = "display",
  allowCompletion = false,
}: {
  item: RoutineItem;
  handlePress: () => void;
  mode?: "display" | "action";
  allowCompletion?: boolean;
}) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const tint = useThemeColor({}, "tint");
  const successBg = useThemeColor({}, "successBg");
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const getLogsQuery = useGetLogsByTaskOrExercise(item.name);

  const logs = useMemo(() => {
    return getLogsQuery.data || [];
  }, [getLogsQuery.data]);

  const todayLogs = useMemo(() => {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0)).getTime();
    const end = new Date(now.setHours(23, 59, 59, 999)).getTime();
    return logs.filter((log) => {
      const t = new Date(log.completedAt).getTime();
      return t >= start && t <= end;
    });
  }, [logs]);

  const hasTodayLogs = todayLogs.length > 0;
  const { addXP } = useBadges();
  const { play } = useSound();
  const saveTaskLogMutation = useSaveTaskLog();

  const handleTaskCompletion = async () => {
    if (isRoutineTaskItem(item) && item.questions?.length) {
      setQuestionModalVisible(true);
      return;
    }
    await saveTaskLogMutation.mutateAsync({ task: item.name, note: "" });
    await play("complete-task");
    await addXP.mutateAsync(LOG_TYPE_XP_MAP["task"]);
    Toast.show({ type: "success", text1: "Task completed", text2: `You completed ${item.name}`, position: "bottom" });
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
      <Image source={item.featureImage} style={{ width: 40, height: 40, borderRadius: BorderRadii.sm }} />
      <View style={{ padding: Spacings.sm, width: "70%", flexWrap: "wrap" }}>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

        <View style={styles.row}>
          <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
          {isRoutineExerciseItem(item) && (
            <>
              <IconSymbol name="clock" size={14} color={textColor} />
              <ThemedText style={styles.description}>{readableDuration(item.duration)}</ThemedText>
            </>
          )}

          {item.notificationTimes?.length ? (
            <View style={styles.row}>
              <IconSymbol name="alarm" size={16} color={textColor} />
              {item.notificationTimes.slice(0, 3).map((time, i) => (
                <ThemedText key={i} style={styles.description}>
                  {time}
                  {i < 2 && i < item.notificationTimes!.length - 1 ? ", " : ""}
                </ThemedText>
              ))}
              {item.notificationTimes.length > 3 && (
                <ThemedText style={styles.description}>+{item.notificationTimes.length - 3} more</ThemedText>
              )}
            </View>
          ) : null}
        </View>

        {mode === "action" && hasTodayLogs && (
          <View
            style={[
              styles.row,
              {
                position: "absolute",
                top: 0,
                left: -12,
              },
            ]}
          >
            <ThemedText style={[styles.description, { color: tint }]}>{todayLogs.length}x</ThemedText>
          </View>
        )}
      </View>

      {mode === "display" && (
        <View style={[{ marginLeft: "auto" }]}>
          <IconSymbol name="chevron.right" size={16} color={textColor} />
        </View>
      )}

      {allowCompletion && isRoutineTaskItem(item) && (
        <ThemedButton
          onPress={handleTaskCompletion}
          variant="ghost"
          icon={hasTodayLogs ? "arrow.circlepath" : "checkmark.circle"}
          iconPlacement="right"
          style={{ marginLeft: "auto" }}
          textStyle={{ color: successColor }}
          iconSize={28}
        />
      )}

      {/* Modal for task questions */}
      {isRoutineTaskItem(item) && item.questions?.length && (
        <TaskQuestionsModal
          currentQuestionIndex={currentQuestionIndex}
          item={item}
          isVisible={questionModalVisible}
          handleSkipQuestions={() => setQuestionModalVisible(false)}
          handleSubmitAnswers={async () => {
            await saveTaskLogMutation.mutateAsync({ task: item.name, note: JSON.stringify(answers) });
            await addXP.mutateAsync(LOG_TYPE_XP_MAP["task"]);
            await play("complete-task");
            Toast.show({
              type: "success",
              text1: "Task completed",
              text2: `You completed ${item.name}`,
              position: "bottom",
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
  item: RoutineTaskItem;
  isVisible: boolean;
  handleSkipQuestions: () => void;
  handleSubmitAnswers: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  answers: { [key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}) => {
  const screenHeight = useWindowDimensions().height;

  const currentQuestion = useMemo(() => {
    const q = item.questions?.[currentQuestionIndex];
    if (!q) return null;
    if (q.reliesOn && (!answers[q.reliesOn] || answers[q.reliesOn] === "false")) {
      return null;
    }
    return q;
  }, [currentQuestionIndex, item.questions, answers]);

  const canSubmit = useMemo(() => {
    const questions = item.questions;
    if (!questions) return null;
    for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
      const q = questions[i];
      if (!q.reliesOn || (q.reliesOn && answers[q.reliesOn] && answers[q.reliesOn] !== "false")) {
        return false;
      }
    }
    return true;
  }, [currentQuestionIndex, item.questions, answers]);

  if (!item.questions || !currentQuestion) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView
        style={{
          padding: 24,
          height: screenHeight / 2, // Half screen height
        }}
      >
        <SafeAreaView>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <ThemedText type="subtitle">
              Question {currentQuestionIndex + 1} of {canSubmit ? currentQuestionIndex + 1 : item.questions.length}
            </ThemedText>
            <ThemedButton title="Exit" variant="ghost" onPress={handleSkipQuestions} />
          </View>
          <ThemedText style={{ marginBottom: 12 }}>{currentQuestion.question}</ThemedText>

          {currentQuestion.answerType === "text" ? (
            <ThemedTextInput
              placeholder="Your answer"
              value={answers[currentQuestion.questionId] || ""}
              onChangeText={(text) => setAnswers({ ...answers, [currentQuestion.questionId]: text })}
            />
          ) : currentQuestion.answerType === "boolean" ? (
            <View style={{ flexDirection: "row", gap: Spacings.sm }}>
              <ThemedButton
                title="Yes"
                onPress={() => setAnswers({ ...answers, [currentQuestion.questionId]: "true" })}
                variant={answers[currentQuestion.questionId] === "true" ? "solid" : "ghost"}
              />
              <ThemedButton
                title="No"
                onPress={() => setAnswers({ ...answers, [currentQuestion.questionId]: "false" })}
                variant={answers[currentQuestion.questionId] === "false" ? "solid" : "ghost"}
              />
            </View>
          ) : currentQuestion.answerType === "select" && currentQuestion.options ? (
            <ThemedPicker
              selectedValue={answers[currentQuestion.questionId] || ""}
              onValueChange={(val) => setAnswers({ ...answers, [currentQuestion.questionId]: val })}
              items={currentQuestion.options.map((opt) => ({ label: opt, value: opt }))}
              placeholder="Select an option"
              style={{ width: "100%" }}
            />
          ) : currentQuestion.answerType === "number" ? (
            <ThemedTextInput
              placeholder="Your answer"
              value={answers[currentQuestion.questionId] || ""}
              onChangeText={(text) => setAnswers({ ...answers, [currentQuestion.questionId]: text })}
              keyboardType="numeric"
            />
          ) : null}

          <ThemedButton
            title={canSubmit ? "Submit" : "Next"}
            onPress={() => {
              const nextIndex = (() => {
                for (let i = currentQuestionIndex + 1; i < item.questions!.length; i++) {
                  const q = item.questions![i];
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
