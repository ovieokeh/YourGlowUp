import { useBadges } from "@/providers/BadgeContext";
import { badgeConditions, BadgeKey, BadgeStatus, getStreak } from "@/utils/gamification";
import { getLogs, Log } from "@/utils/logs";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export const useAwardEarnedBadges = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { awardBadge, badges } = useBadges();

  useFocusEffect(
    useCallback(() => {
      const fetchLogs = async () => {
        const logs = await getLogs();
        setLogs(logs);
      };
      fetchLogs();
    }, [])
  );

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
