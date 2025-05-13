import { Tabs, useFocusEffect } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { XPCounter } from "@/components/XPCounter";
import { useAwardEarnedBadges } from "@/hooks/useAwardEarnedBadges";
import { useThemeColor } from "@/hooks/useThemeColor";
import { scheduleNotificationWithStats } from "@/utils/notifications";

export default function TabLayout() {
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const muted = useThemeColor({}, "muted");

  useFocusEffect(() => {
    scheduleNotificationWithStats();
  });
  useAwardEarnedBadges();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: muted,
        tabBarButton: HapticTab,
        headerShown: true,
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
        headerStyle: {
          backgroundColor: background,
          shadowColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.xyaxis.line" color={color} />,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          headerShown: false,
          headerRight: () => <XPCounter />,
          headerStyle: {
            backgroundColor: background,
            // borderBottomWidth: 0.5,
            // borderBottomColor: border,
            shadowColor: "transparent",
          },
          headerTitleStyle: {
            color: "transparent",
          },
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.sequence.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
