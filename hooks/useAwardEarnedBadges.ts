import { badgeConditions, BadgeKey, getStreak } from "@/backend/gamification";
import { useGetLogs } from "@/backend/queries/logs";
import { useBadges } from "@/providers/BadgeContext";
import { useEffect, useMemo } from "react";
import { useAppContext } from "./app/context";

export const useAwardEarnedBadges = () => {
  const { user } = useAppContext();

  const logsQuery = useGetLogs(user?.id);
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);
  const { awardBadge } = useBadges();

  useEffect(() => {
    const checkAndAward = async () => {
      if (!logs.length) return;

      const streak = getStreak(logs);

      const entries = Object.entries(badgeConditions) as [BadgeKey, (typeof badgeConditions)[BadgeKey]][];

      for (const [key, conditionFn] of entries) {
        if (conditionFn({ logs, streak })) {
          await awardBadge(key);
        }
      }
    };

    checkAndAward();
  }, [logs, awardBadge]);
};
