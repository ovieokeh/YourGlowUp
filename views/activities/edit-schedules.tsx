import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import "react-native-get-random-values";

import { ActivityCreateInput, ActivityScheduleCreateInput, NotificationRecurrence } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

import { BorderRadii, Spacings } from "@/constants/Theme";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";

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
              <NotificationTimePicker
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

const NotificationTimePicker = ({
  value,
  recurrenceType,
  onChange,
}: {
  value: ActivityScheduleCreateInput;
  recurrenceType: NotificationRecurrence | undefined;
  onChange: (value: ActivityScheduleCreateInput) => void;
}) => {
  const [timeOfDay, setTimeOfDay] = useState(value.timeOfDay || "09:00");

  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(value.dayOfWeek);

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setTimeOfDay(value.timeOfDay || "09:00");
    setDayOfWeek(value.dayOfWeek);
  }, [value]);

  useEffect(() => {
    const newSchedule: ActivityScheduleCreateInput = {
      timeOfDay,

      dayOfWeek: recurrenceType === NotificationRecurrence.WEEKLY ? dayOfWeek : undefined,
    };

    if (JSON.stringify(newSchedule) !== JSON.stringify(value)) {
      onChange(newSchedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOfDay, dayOfWeek, recurrenceType]);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (event.type === "set" && selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      setTimeOfDay(`${hours}:${minutes}`);
    }
  };

  const getTimePickerDate = () => {
    const [hours, minutes] = timeOfDay.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const dayOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  return (
    <View style={styles.timePickerContainer}>
      {/* Day Picker (only for weekly recurrence) */}
      {recurrenceType === NotificationRecurrence.WEEKLY && (
        <ThemedPicker
          items={dayOptions}
          selectedValue={dayOfWeek}
          onValueChange={(val) => setDayOfWeek(val as number)}
          placeholder="Select Day"
        />
      )}

      {/* Time Display and Trigger */}
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeDisplayButton}>
        <ThemedText style={styles.timeDisplayText}>
          {format(parse(timeOfDay, "HH:mm", new Date()), "h:mm a")}
        </ThemedText>
        <Ionicons name="time-outline" size={20} color={useThemeColor({}, "text")} />
      </TouchableOpacity>

      {/* Native Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={getTimePickerDate()}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
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
