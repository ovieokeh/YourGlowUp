import { GetGoalsOptions } from "@/backend/goals";
import { useGetGoals } from "@/backend/queries/goals";
import { Spacings } from "@/constants/Theme";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { ThemedPicker } from "./ThemedPicker";

interface GoalPickerProps {
  userId: string | undefined;
  opts: GetGoalsOptions;
  value: string | undefined;
  onChange: (value: string) => void;
}
export const GoalPicker = ({ userId, opts, value, onChange }: GoalPickerProps) => {
  const goalsQuery = useGetGoals(userId, opts);
  const goalOptions = useMemo(
    () =>
      goalsQuery.data?.map((goal) => ({
        label: goal.name,
        value: goal.id,
      })) ?? [],
    [goalsQuery.data]
  );

  useEffect(() => {
    if (goalOptions.length > 0 && !value) {
      onChange(goalOptions[0].value);
    }
  }, [goalOptions, value, onChange]);

  return (
    <View style={{ padding: Spacings.md, paddingBottom: 0 }}>
      <ThemedPicker
        items={goalOptions}
        selectedValue={value}
        onValueChange={(value) => onChange(value ?? "")}
        style={{ marginBottom: Spacings.md }}
        placeholder="Select a goal"
        disabled={goalOptions.length === 0}
      />
    </View>
  );
};
