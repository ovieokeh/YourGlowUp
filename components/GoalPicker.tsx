import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useMemo, useState } from "react";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "./ThemedButton";
import { ThemedFabButtonProps } from "./ThemedFabButton";
import { ThemedView } from "./ThemedView";

export const GoalPicker = (props: { triggerProps?: Omit<ThemedFabButtonProps, "onPress"> }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { goals, selectedGoalId, setSelectedGoalId } = useAppContext();

  const selectedGoal = useMemo(() => {
    return goals.find((goal) => goal.id === selectedGoalId);
  }, [goals, selectedGoalId]);

  return (
    <>
      <ThemedButton
        {...props.triggerProps}
        title={selectedGoal?.name ?? "Select Goal"}
        onPress={() => setIsVisible(true)}
        icon="clock"
      />

      <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView
          style={{
            flex: 1,
            padding: 24,
          }}
        >
          <SafeAreaView>
            <ThemedButton
              onPress={() => setIsVisible(false)}
              icon="xmark"
              variant="ghost"
              style={{ marginLeft: "auto", marginBottom: Spacings.lg, paddingRight: 0 }}
            />
            {goals.map((goal) => (
              <ThemedButton
                key={goal.id}
                title={goal.name}
                active={goal.id === selectedGoalId}
                onPress={() => {
                  setSelectedGoalId(goal.id);
                  setIsVisible(false);
                }}
                style={{ width: "100%", marginBottom: Spacings.sm }}
              />
            ))}
          </SafeAreaView>
        </ThemedView>
      </Modal>
    </>
  );
};
