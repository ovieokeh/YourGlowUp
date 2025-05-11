import { withGoalActivities } from "@/backend/queries/activities";
import { ActivityType, NotificationRecurrence } from "@/backend/shared";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";

export const scheduleNotificationWithStats = async (goalId = "1") => {
  withGoalActivities(goalId, async (activities) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const item of activities) {
      const notificationType = item.recurrence;
      const hasNotificationsSet = item.scheduledTimes && item.scheduledTimes?.length > 0;
      if (!hasNotificationsSet) {
        continue;
      }

      const timeNotifications = item.scheduledTimes?.filter((t) => t !== "random");
      if (timeNotifications && timeNotifications.length > 0) {
        for (const timeNotification of timeNotifications) {
          let timeString = timeNotification;
          const body =
            item.type === ActivityType.GUIDED_ACTIVITY
              ? `Don't forget to log your progress for ${item.name}!`
              : `Don't forget to complete your task: ${item.name}!`;

          if (notificationType === NotificationRecurrence.WEEKLY) {
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
                goalId: goalId,
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
        goalId: string;
        itemId: string;
      };

      if (data) {
        router.push({
          pathname: "/activity/[slug]",
          params: { slug: data.itemId, goalId: data.goalId },
        });
      }
    });

    return () => subscription.remove();
  });
}
