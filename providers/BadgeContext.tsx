import { useGetShownToasts, useGetUserBadges, useSetBadgeStatus, useSetShownToasts } from "@/queries/gamification";
import { Badge, BadgeKey, BADGES, BadgeStatus } from "@/queries/gamification/gamification";
import React, { createContext, useContext, useMemo } from "react";
import Toast from "react-native-toast-message";

type BadgeContextType = {
  badges: Record<BadgeKey, Badge>;
  awardBadge: (key: BadgeKey) => Promise<void>;
  hasBadge: (key: BadgeKey) => boolean;
};

const BadgeContext = createContext<BadgeContextType | null>(null);

export const BadgeProvider = ({ children }: { children: React.ReactNode }) => {
  const shownToastsQuery = useGetShownToasts();
  const shownToasts = useMemo(() => new Set(shownToastsQuery.data || []), [shownToastsQuery.data]);
  const userBadgesQuery = useGetUserBadges();
  const userBadges = userBadgesQuery.data;

  const setBadgesMutation = useSetBadgeStatus();
  const setShownToastsMutation = useSetShownToasts();

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

  const updateBadge = async (key: BadgeKey, status: BadgeStatus) => {
    await setBadgesMutation.mutateAsync({ key, status });
  };

  const saveShownToast = async (key: BadgeKey) => {
    const updated = new Set(shownToasts).add(key);
    await setShownToastsMutation.mutateAsync(updated);
  };

  const awardBadge = async (key: BadgeKey) => {
    const badge = badges[key];
    if (!badge || badge.status === BadgeStatus.EARNED) return;

    await updateBadge(key, BadgeStatus.EARNED);

    if (!shownToasts.has(key)) {
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
  };

  const hasBadge = (key: BadgeKey) => badges[key]?.status === BadgeStatus.EARNED;

  return <BadgeContext.Provider value={{ badges, awardBadge, hasBadge }}>{children}</BadgeContext.Provider>;
};

export const useBadges = () => {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error("useBadges must be used within BadgeProvider");
  return ctx;
};
