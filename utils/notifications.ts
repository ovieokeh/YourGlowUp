import { withRoutine } from "@/queries/routines/helper";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";

export const scheduleNotificationWithStats = async () => {
  withRoutine("my-routine", async (routine) => {
    const routineItems = routine?.items || [];

    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const item of routineItems) {
      const hasNotificationsSet = item.notificationTimes && item.notificationTimes?.length > 0;
      if (!hasNotificationsSet) {
        continue;
      }

      const timeNotifications = item.notificationTimes?.filter((t) => t !== "random");
      if (timeNotifications && timeNotifications.length > 0) {
        for (const timeNotification of timeNotifications) {
          const [hour, minute] = timeNotification.split(":").map(Number);
          const body =
            item.type === "exercise"
              ? `Don't forget to log your progress for ${item.name}!`
              : `Don't forget to complete your task: ${item.name}!`;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Face Symmetry Reminder",
              body,
              data: {
                routineId: "my-routine",
                itemId: item.itemId,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour,
              minute,
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
