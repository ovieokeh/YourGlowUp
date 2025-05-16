import React from "react";
import { StyleSheet, View } from "react-native";
import "react-native-get-random-values";

import { ActivityCreateInput, ActivityScheduleCreateInput, NotificationRecurrence } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";

import { SchedulePicker } from "@/components/SchedulePicker";
import { BorderRadii, Spacings } from "@/constants/Theme";

interface ActivityEditSchedulesProps {
  recurrence?: NotificationRecurrence;
  schedules?: ActivityScheduleCreateInput[];
  onChange: (key: keyof ActivityCreateInput, value: any) => void;
}
export const ActivityEditSchedules: React.FC<ActivityEditSchedulesProps> = ({ recurrence, schedules, onChange }) => {
  const updateSchedule = (index: number, updatedScheduleData: ActivityScheduleCreateInput) => {
    const updatedSchedules = [...(schedules || [])];
    if (updatedSchedules[index]) {
      updatedSchedules[index] = updatedScheduleData;
      onChange("schedules", updatedSchedules);
    }
  };
  const removeSchedule = (index: number) => {
    const updatedSchedules = (schedules || []).filter((_, i) => i !== index);
    onChange("schedules", updatedSchedules);
  };
  const addSchedule = () => {
    const defaultDay = recurrence === NotificationRecurrence.WEEKLY ? 1 : undefined;
    const newSchedule: ActivityScheduleCreateInput = { timeOfDay: "09:00", dayOfWeek: defaultDay };
    const updatedSchedules = [...(schedules || []), newSchedule];
    onChange("schedules", updatedSchedules);
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {/* Recurrence Picker */}
        <ThemedPicker
          placeholder="Select Recurrence"
          items={[
            { label: "Daily", value: NotificationRecurrence.DAILY },
            { label: "Weekly", value: NotificationRecurrence.WEEKLY },
          ]}
          selectedValue={recurrence}
          onValueChange={(val) => {
            onChange("recurrence", val);

            if (val === NotificationRecurrence.DAILY && schedules) {
              const updatedSchedules = schedules.map((s) => ({ ...s, dayOfWeek: undefined }));
              onChange("schedules", updatedSchedules);
            }
          }}
        />

        {/* Schedule Time Pickers (only show if recurrence is selected) */}
        {recurrence &&
          (schedules || []).map((schedule, index) => (
            <View key={`schedule-${index}`} style={styles.scheduleItemContainer}>
              <SchedulePicker
                value={schedule}
                recurrenceType={recurrence}
                onChange={(updatedSchedule) => updateSchedule(index, updatedSchedule)}
              />
              <ThemedButton
                variant="ghost"
                icon="trash"
                onPress={() => removeSchedule(index)}
                style={styles.removeButton}
              />
            </View>
          ))}
      </View>
      {/* Add Time Button (only show if recurrence is selected) */}
      {recurrence && <ThemedButton title="Add Notification Time" onPress={addSchedule} variant="outline" icon="plus" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Spacings.md,
  },
  listContainer: {
    gap: Spacings.sm,
  },
  scheduleItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
    paddingVertical: Spacings.xs,

    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: BorderRadii.sm,
    paddingHorizontal: Spacings.sm,
  },
  timePickerContainer: {
    flex: 1,
    gap: Spacings.sm,
  },
  removeButton: {
    padding: Spacings.xs,
    alignSelf: "flex-start",
  },
  timeDisplayButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacings.md,
    paddingHorizontal: Spacings.sm,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: BorderRadii.sm,
  },
  timeDisplayText: {
    fontSize: 16,
  },
});
