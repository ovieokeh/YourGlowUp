import { useBadges } from "@/providers/BadgeContext";
import { badgeConditions, BadgeKey, BadgeStatus, getStreak } from "@/queries/gamification/gamification";
import { useGetLogs } from "@/queries/logs";
import { useEffect } from "react";

export const useAwardEarnedBadges = () => {
  const logsQuery = useGetLogs();
  const logs = logsQuery.data || [];
  const { awardBadge, badges } = useBadges();

  useEffect(() => {
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

    checkAndAward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);
};
