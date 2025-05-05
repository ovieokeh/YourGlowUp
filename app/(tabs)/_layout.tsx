import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { BackButton } from "@/components/BackButton";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function TabLayout() {
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const accent = useThemeColor({}, "accent");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: tint,
        tabBarButton: HapticTab,
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.xyaxis.line" color={color} />,
          tabBarStyle: { display: "none" },
          headerShown: true,
          headerLeft: () => <BackButton />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="add-user-log"
        options={{
          title: "Add Log",
          href: null,
          headerLeft: () => <BackButton />,
        }}
      />
    </Tabs>
  );
}
