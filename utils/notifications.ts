import { NotificationType } from "@/constants/Exercises";
import { withRoutine } from "@/queries/routines/helper";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";

export const scheduleNotificationWithStats = async (routineId = "1") => {
  withRoutine(routineId, async (routine) => {
    const routineItems = routine?.items || [];

    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const item of routineItems) {
      const notificationType = item.notificationType;
      const hasNotificationsSet = item.notificationTimes && item.notificationTimes?.length > 0;
      if (!hasNotificationsSet) {
        continue;
      }

      const timeNotifications = item.notificationTimes?.filter((t) => t !== "random");
      if (timeNotifications && timeNotifications.length > 0) {
        for (const timeNotification of timeNotifications) {
          let timeString = timeNotification;
          const body =
            item.type === "exercise"
              ? `Don't forget to log your progress for ${item.name}!`
              : `Don't forget to complete your task: ${item.name}!`;

          if (notificationType === NotificationType.CUSTOM) {
            const currentDay = new Date().getDay();
            const dayOfWeek = timeNotification.split("-")[0];
            const time = timeNotification.split("-")[1];
            const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(
              dayOfWeek.toLowerCase()
            );
            if (dayIndex === -1) {
              console.error(`Invalid day of the week: ${dayOfWeek}`);
              continue;
            }
            const daysUntilNextNotification = (dayIndex - currentDay + 7) % 7;
            const nextNotificationDate = new Date();
            nextNotificationDate.setDate(nextNotificationDate.getDate() + daysUntilNextNotification);
            nextNotificationDate.setHours(Number(time.split(":")[0]), Number(time.split(":")[1]), 0, 0);
            timeString = nextNotificationDate.toISOString();
          }

          const intervalTillNextNotification = new Date(timeString).getTime() - new Date().getTime();
          const seconds = Math.floor(intervalTillNextNotification / 1000);
          if (seconds < 0) {
            console.error(`Notification time is in the past: ${timeString}`);
            continue;
          }

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Your Glow Up",
              body,
              data: {
                routineId: routineId,
                itemId: item.slug,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
            },
          });
        }
      }
    }
  });
};

export function useNotificationRedirect() {
  const router = useRouter();

  useFocusEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        routineId: string;
        itemId: string;
      };

      if (data) {
        router.push({
          pathname: "/exercise/[slug]",
          params: { slug: data.itemId, routineId: data.routineId },
        });
      }
    });

    return () => subscription.remove();
  });
}
