import { useBadges } from "@/providers/BadgeContext";
import { badgeConditions, BadgeKey, getStreak } from "@/queries/gamification/gamification";
import { useGetLogs, useGetPhotoLogs } from "@/queries/logs";
import { useEffect, useMemo } from "react";

export const useAwardEarnedBadges = () => {
  const logsQuery = useGetLogs();
  const logs = useMemo(() => logsQuery.data || [], [logsQuery.data]);
  const photoLogsQuery = useGetPhotoLogs("my-routine");
  const photoLogs = useMemo(() => photoLogsQuery.data || [], [photoLogsQuery.data]);
  const { awardBadge } = useBadges();

  useEffect(() => {
    const checkAndAward = async () => {
      if (!logs.length && !photoLogs.length) return;

      const streak = getStreak(logs);

      const entries = Object.entries(badgeConditions) as [BadgeKey, (typeof badgeConditions)[BadgeKey]][];

      for (const [key, conditionFn] of entries) {
        if (conditionFn({ logs, photoLogs, streak })) {
          await awardBadge(key);
        }
      }
    };

    checkAndAward();
  }, [logs, photoLogs, awardBadge]);
};
