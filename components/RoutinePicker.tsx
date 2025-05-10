import { Spacings } from "@/constants/Theme";
import { useGetRoutines } from "@/queries/routines";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { ThemedPicker } from "./ThemedPicker";

interface RoutinePickerProps {
  value: number | undefined;
  onChange: (value: number) => void;
}
export const RoutinePicker = ({ value, onChange }: RoutinePickerProps) => {
  const routinesQuery = useGetRoutines();
  const routineOptions = useMemo(
    () =>
      routinesQuery.data?.map((routine) => ({
        label: routine.name,
        value: routine.id,
      })) ?? [],
    [routinesQuery.data]
  );

  useEffect(() => {
    if (routineOptions.length > 0 && !value) {
      onChange(routineOptions[0].value);
    }
  }, [routineOptions, value, onChange]);

  return (
    <View style={{ padding: Spacings.md, paddingBottom: 0 }}>
      <ThemedPicker
        items={routineOptions}
        selectedValue={value}
        onValueChange={(value) => onChange(value ?? 0)}
        style={{ marginBottom: Spacings.md }}
        placeholder="Select a routine"
        disabled={routineOptions.length === 0}
      />
    </View>
  );
};
