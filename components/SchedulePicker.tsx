import { NotificationRecurrence } from "@/backend/shared";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedText } from "./ThemedText";

const dayOptions = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 7 },
];

export interface SchedulePickerType {
  timeOfDay: string;
  dayOfWeek?: number;
}

export const SchedulePicker = ({
  value,
  recurrenceType,
  onChange,
}: {
  value: SchedulePickerType;
  recurrenceType: NotificationRecurrence | undefined;
  onChange: (value: SchedulePickerType) => void;
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const [timeOfDay, setTimeOfDay] = useState(value.timeOfDay || "09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(value.dayOfWeek);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setTimeOfDay(value.timeOfDay || "09:00");
    setDayOfWeek(value.dayOfWeek);
  }, [value.timeOfDay, value.dayOfWeek]);

  useEffect(() => {
    const newSchedule: SchedulePickerType = {
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

  return (
    <View
      style={{
        gap: Spacings.sm,
      }}
    >
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
      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: Spacings.md,
          paddingHorizontal: Spacings.sm,
          borderWidth: 1,
          borderColor,
          borderRadius: BorderRadii.sm,
        }}
      >
        <ThemedText type="caption">{format(parse(timeOfDay, "HH:mm", new Date()), "h:mm a")}</ThemedText>
        <Ionicons name="time-outline" size={20} color={textColor} />
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
