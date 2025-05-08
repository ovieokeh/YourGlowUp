import { router, Tabs, useFocusEffect } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

import { BackButton } from "@/components/BackButton";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { XPCounter } from "@/components/XPCounter";
import { useAwardEarnedBadges } from "@/hooks/useAwardEarnedBadges";
import { useThemeColor } from "@/hooks/useThemeColor";
import { scheduleNotificationWithStats } from "@/utils/notifications";

const SettingsButton = () => {
  const accent = useThemeColor({}, "accent");

  return (
    <Pressable
      onPress={() => router.push("/settings")}
      style={{
        padding: 10,
        borderRadius: 100,
      }}
    >
      <IconSymbol size={34} name="person.circle" color={accent} />
    </Pressable>
  );
};
export default function TabLayout() {
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const accent = useThemeColor({}, "accent");

  useFocusEffect(() => {
    scheduleNotificationWithStats();
  });
  useAwardEarnedBadges();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: tint,
        tabBarButton: HapticTab,
        headerLeft: () => <SettingsButton />,
        headerRight: () => <XPCounter />,
        tabBarStyle: Platform.select({
          default: {},
          ios: {
            backgroundColor: background,
            position: "absolute",
          },
          android: {
            backgroundColor: background,
            borderTopWidth: 0.5,
            borderTopColor: border,
            elevation: 12,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,

          headerStyle: {
            shadowColor: "transparent",
          },
        }}
      />
      <Tabs.Screen
        name="routines/index"
        options={{
          title: "Routine",
          href: null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="routines/explore"
        options={{
          title: "Explore",
          href: null,
          headerLeft: () => <BackButton />,
        }}
      />
      <Tabs.Screen
        name="routines/[id]"
        options={{
          title: "My Routine",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.xyaxis.line" color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
        }}
      />
    </Tabs>
  );
}
