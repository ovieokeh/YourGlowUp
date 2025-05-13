import { ActivityScheduleEntry, NotificationRecurrence } from "@/backend/shared";
import { format, parse } from "date-fns";

const formatDayOfWeek = (dayOfWeek?: number): string => {
  if (dayOfWeek === undefined || dayOfWeek === null) return "";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days[dayOfWeek - 1] || "";
};

export const formatScheduleEntry = (schedule: ActivityScheduleEntry, recurrence?: NotificationRecurrence): string => {
  try {
    const timePart = format(parse(schedule.timeOfDay, "HH:mm", new Date()), "h:mm a");

    if (recurrence === NotificationRecurrence.WEEKLY && schedule.dayOfWeek) {
      const dayPart = formatDayOfWeek(schedule.dayOfWeek);
      return `${dayPart} ${timePart}`;
    }

    return timePart;
  } catch (e) {
    console.error("Error formatting schedule entry:", schedule, e);

    return recurrence === NotificationRecurrence.WEEKLY
      ? `${formatDayOfWeek(schedule.dayOfWeek)} ${schedule.timeOfDay}`
      : schedule.timeOfDay;
  }
};
