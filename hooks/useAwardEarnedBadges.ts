import { useBadges } from "@/providers/BadgeContext";
import { badgeConditions, BadgeKey, BadgeStatus, getStreak } from "@/queries/gamification/gamification";
import { useGetLogs } from "@/queries/logs";
import { useFocusEffect } from "expo-router";
import { useMemo } from "react";

export const useAwardEarnedBadges = () => {
  const logsQuery = useGetLogs();
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);
  const { awardBadge, badges } = useBadges();

  useFocusEffect(() => {
    const checkAndAward = async () => {
      const streak = getStreak(logs);
      const current = badges;

      const entries = Object.entries(badgeConditions) as [BadgeKey, (typeof badgeConditions)[BadgeKey]][];

      for (const [key, conditionFn] of entries) {
        const badge = current[key];
        if (!badge || badge.status === BadgeStatus.EARNED) continue;

        if (conditionFn({ logs, streak })) {
          await awardBadge(key);
        }
      }
    };

    const interval = setInterval(() => {
      checkAndAward();
    }, 1000 * 60 * 5); // Check every 5 minutes

    checkAndAward();
    return () => {
      clearInterval(interval);
    };
  });
};
