import { supabase } from "@/supabase";
import {
  Badge,
  BadgeKey,
  BADGES,
  BadgeStatus,
  fetchUserBadges,
  setBadgeStatus as persistBadgeStatus,
} from "@/utils/gamification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

type BadgeContextType = {
  badges: Record<BadgeKey, Badge>;
  awardBadge: (key: BadgeKey) => Promise<void>;
  hasBadge: (key: BadgeKey) => boolean;
};

const BadgeContext = createContext<BadgeContextType | null>(null);

const SHOWN_TOASTS_KEY = "shown_toasts";

export const BadgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [badges, setBadges] = useState<Record<BadgeKey, Badge>>(BADGES);
  const [shownToasts, setShownToasts] = useState<Set<BadgeKey>>(new Set());

  // Load badges and shown toast keys
  useEffect(() => {
    const init = async () => {
      const stored = await fetchUserBadges();
      setBadges(stored);

      // clear all shown
      const shown = await AsyncStorage.getItem(SHOWN_TOASTS_KEY);

      // await AsyncStorage.removeItem(SHOWN_TOASTS_KEY);
      await AsyncStorage.removeItem("badges");
      if (shown) setShownToasts(new Set(JSON.parse(shown)));
    };

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        init();
      } else if (event === "SIGNED_OUT") {
        setBadges(BADGES);
        setShownToasts(new Set());
      }
    });
  }, []);

  const updateBadge = async (key: BadgeKey, status: BadgeStatus) => {
    const updated = {
      ...badges,
      [key]: { ...badges[key], status },
    };
    setBadges(updated);
    await persistBadgeStatus(key, status);
  };

  const saveShownToast = async (key: BadgeKey) => {
    const updated = new Set(shownToasts).add(key);
    setShownToasts(updated);
    await AsyncStorage.setItem(SHOWN_TOASTS_KEY, JSON.stringify([...updated]));
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
