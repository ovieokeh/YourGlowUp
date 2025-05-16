import { useAddLog } from "@/backend/queries/logs";
import { GoalActivity, LogType, PromptLog } from "@/backend/shared";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useMemo, useRef, useState } from "react";
import { Modal, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedButton } from "../ThemedButton";
import { ThemedPicker } from "../ThemedPicker";
import { ThemedText } from "../ThemedText";
import { ThemedTextInput } from "../ThemedTextInput";
import { ThemedView } from "../ThemedView";

export const ActivityCompletionModal = ({
  item,
  isVisible,
  handleSkipQuestions,
  handleSubmitAnswers,
}: {
  item: GoalActivity;
  isVisible: boolean;
  handleSkipQuestions: () => void;
  handleSubmitAnswers: (answers: { [key: string]: string }) => void;
}) => {
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const screenHeight = useWindowDimensions().height;
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const indexLogStatusMap = useRef<{ [key: string]: boolean }>({});

  const addPromptLogMutation = useAddLog(user?.id);

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

  const handleNext = () => {
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
      handleSubmitAnswers(answers);
    } else {
      if (currentQuestion) {
        if (indexLogStatusMap.current[currentQuestionIndex]) {
          return setCurrentQuestionIndex(nextIndex);
        }
        addPromptLogMutation.mutate(
          {
            type: LogType.PROMPT,
            promptId: currentQuestion.id,
            answerType: currentQuestion.type,
            answer: answers[currentQuestion.id],
            userId: user?.id,
            goalId: item.goalId,
            activityId: item.id,
          } as PromptLog,
          {
            onSuccess: () => {
              indexLogStatusMap.current[currentQuestionIndex] = true;
            },
          }
        );
      }
      setCurrentQuestionIndex(nextIndex);
    }
  };

  if (!item.completionPrompts || !currentQuestion) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView
        style={{
          flex: 1,
          padding: Spacings.md,
          paddingTop: insets.top,
          height: screenHeight / 2, // Half screen height
        }}
      >
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

        <ThemedButton title={canSubmit ? "Submit" : "Next"} onPress={handleNext} style={{ marginTop: 24 }} />
      </ThemedView>
    </Modal>
  );
};
