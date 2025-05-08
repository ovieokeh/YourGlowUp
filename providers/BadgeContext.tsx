import {
  useAddXP,
  useGetShownToasts,
  useGetUserBadges,
  useGetUserXP,
  useSetBadgeStatus,
  useSetShownToasts,
} from "@/queries/gamification";
import { Badge, BadgeKey, BADGES, BadgeStatus } from "@/queries/gamification/gamification";
import { useSound } from "@/utils/sounds";
import { UseMutationResult } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import Toast from "react-native-toast-message";

type BadgeContextType = {
  badges: Record<BadgeKey, Badge>;
  xp: number;
  addXP: UseMutationResult<void, Error, number, unknown>;
  awardBadge: (key: BadgeKey) => Promise<void>;
  hasBadge: (key: BadgeKey) => boolean;
};

const BadgeContext = createContext<BadgeContextType | null>(null);

export const BadgeProvider = ({ children }: { children: React.ReactNode }) => {
  const shownToastsQuery = useGetShownToasts();
  const shownToasts = useMemo(() => new Set(shownToastsQuery.data || []), [shownToastsQuery.data]);
  const userBadgesQuery = useGetUserBadges();
  const userBadges = useMemo(() => userBadgesQuery.data, [userBadgesQuery.data]);

  const { mutateAsync: setBadges } = useSetBadgeStatus();
  const { mutateAsync: setShownToasts } = useSetShownToasts();

  const currentXPMutation = useGetUserXP();
  const xp = currentXPMutation.data || 0;
  const addXP = useAddXP();

  const { play } = useSound();

  const badges = useMemo(() => {
    if (userBadges) {
      return Object.keys(userBadges).reduce((acc, key) => {
        acc[key as BadgeKey] = {
          ...BADGES[key as BadgeKey],
          status: userBadges[key as BadgeKey].status,
        };
        return acc;
      }, {} as Record<BadgeKey, Badge>);
    }
    return BADGES;
  }, [userBadges]);

  const updateBadge = useCallback(
    async (key: BadgeKey, status: BadgeStatus) => {
      await setBadges({ key, status });
    },
    [setBadges]
  );

  const saveShownToast = useCallback(
    async (key: BadgeKey) => {
      const updated = new Set(shownToasts).add(key);
      await setShownToasts(updated);
    },
    [shownToasts, setShownToasts]
  );

  const awardBadge = useCallback(
    async (key: BadgeKey) => {
      const badge = badges[key];

      if (!badge || badge.status === BadgeStatus.EARNED) return;

      await updateBadge(key, BadgeStatus.EARNED);

      if (!shownToasts.has(key)) {
        play("badge-awarded");
        Toast.show({
          type: "success",
          text1: `🏅 ${badge.name} Unlocked!`,
          text2: badge.description,
          onPress: () => {
            // e.g. showBadgeModal(); implement in UI logic
          },
        });

        await saveShownToast(key);
      }
    },
    [badges, shownToasts, updateBadge, saveShownToast, play]
  );

  const hasBadge = (key: BadgeKey) => badges[key]?.status === BadgeStatus.EARNED;

  return <BadgeContext.Provider value={{ badges, xp, addXP, awardBadge, hasBadge }}>{children}</BadgeContext.Provider>;
};

export const useBadges = () => {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error("useBadges must be used within BadgeProvider");
  return ctx;
};
