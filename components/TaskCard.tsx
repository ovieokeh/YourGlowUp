import { useThemeColor } from "@/hooks/useThemeColor";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";

import { BorderRadii, Spacings } from "@/constants/Theme";
import { useBadges } from "@/providers/BadgeContext";
import { LOG_TYPE_XP_MAP } from "@/queries/gamification/gamification";
import { useGetLogsByTask, useSaveTaskLog } from "@/queries/logs";
import { RoutineTaskItem } from "@/queries/routines/shared";
import { useSound } from "@/utils/sounds";
import Toast from "react-native-toast-message";
import { ThemedButton } from "./ThemedButton";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedText } from "./ThemedText";
import { ThemedTextInput } from "./ThemedTextInput";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface TaskCardProps {
  item: RoutineTaskItem;
  allowCompletion?: boolean;
  mode?: "display" | "action";
  handlePress: () => void;
}

export const TaskCard = ({ item, allowCompletion, mode = "display", handlePress }: TaskCardProps) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const { play } = useSound();

  const logsByTaskQuery = useGetLogsByTask(item.name);
  const logs = useMemo(() => logsByTaskQuery.data || [], [logsByTaskQuery.data]);

  const saveTaskLogMutation = useSaveTaskLog();
  const { addXP } = useBadges();

  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleTaskCompletion = async () => {
    if (item.questions && item.questions.length > 0) {
      setQuestionModalVisible(true);
      return;
    }

    await saveTaskLogMutation.mutateAsync({
      task: item.name,
      note: "",
    });
    await addXP.mutateAsync(LOG_TYPE_XP_MAP["task"]).catch((err) => {
      console.error("Error adding XP:", err);
    });

    await play("complete-task");

    Toast.show({
      type: "success",
      text1: "Task completed",
      text2: `You have completed ${item.name} today`,
      position: "bottom",
    });
  };

  const handleSubmitAnswers = async () => {
    await saveTaskLogMutation.mutateAsync({
      task: item.name,
      note: JSON.stringify(answers),
    });
    await play("complete-task");
    Toast.show({
      type: "success",
      text1: "Task completed",
      text2: `You have completed ${item.name} today`,
      position: "bottom",
    });
    setQuestionModalVisible(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleSkipQuestions = async () => {
    Alert.alert(
      "Incomplete log",
      "Are you sure you want to mark this task as completed without answering all questions?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, mark complete",
          style: "destructive",
          onPress: async () => {
            await saveTaskLogMutation.mutateAsync({
              task: item.name,
              note: "",
            });
            Toast.show({
              type: "success",
              text1: "Task completed",
              text2: `You have completed ${item.name} today`,
              position: "bottom",
            });
            setQuestionModalVisible(false);
            setAnswers({});
            setCurrentQuestionIndex(0);
          },
        },
        {
          text: "No, leave incomplete",
          style: "cancel",
          onPress: () => {
            setQuestionModalVisible(false);
          },
        },
      ]
    );
  };

  const todayLogs = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return logs.filter((log) => {
      const completed = new Date(log.completedAt).getTime();
      return completed >= startOfDay.getTime() && completed <= endOfDay.getTime();
    });
  }, [logs]);

  const hasTodayLogs = todayLogs.length > 0;

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },

        {
          ...(mode === "action"
            ? {
                borderColor: hasTodayLogs ? successColor : cardBorder,
                opacity: hasTodayLogs ? 0.5 : 1,
              }
            : {}),
        },
      ]}
      onPress={handlePress}
    >
      <View style={{ padding: Spacings.sm }}>
        <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
        <View style={styles.row}>
          {item.notificationTimes?.length ? (
            <View style={styles.row}>
              <IconSymbol name={"alarm"} size={16} color={textColor} />
              {item.notificationTimes.slice(0, 3).map((time, index) => (
                <View style={styles.row} key={time + index}>
                  {index % 2 === 0 ? null : <ThemedText>,</ThemedText>}
                  <ThemedText style={styles.description}>{time}</ThemedText>
                </View>
              ))}
              {item.notificationTimes.length > 3 ? (
                <ThemedText style={styles.description}>+{item.notificationTimes.length - 3} more</ThemedText>
              ) : null}
            </View>
          ) : null}
        </View>

        {mode === "action" && hasTodayLogs && (
          <View style={styles.row}>
            <ThemedText style={[styles.description, { opacity: 0.5 }]}>
              Completed {todayLogs.length} {todayLogs.length > 1 ? "times" : "time"} today already
            </ThemedText>
          </View>
        )}
      </View>

      {allowCompletion && (
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

      <TaskQuestionsModal
        currentQuestionIndex={currentQuestionIndex}
        item={item}
        isVisible={questionModalVisible}
        handleSkipQuestions={handleSkipQuestions}
        handleSubmitAnswers={handleSubmitAnswers}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        answers={answers}
        setAnswers={setAnswers}
      />
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
    gap: Spacings.sm,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    overflow: "hidden",
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
