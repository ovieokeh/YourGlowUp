import { router, Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

import { BackButton } from "@/components/BackButton";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { XPCounter } from "@/components/XPCounter";
import { useAwardEarnedBadges } from "@/hooks/useAwardEarnedBadges";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function TabLayout() {
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const accent = useThemeColor({}, "accent");

  useAwardEarnedBadges();

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
          title: "Your Glow Up",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={{
                padding: 10,
                borderRadius: 100,
              }}
            >
              <IconSymbol size={34} name="person.circle" color={accent} />
            </Pressable>
          ),
          headerRight: () => <XPCounter />,
          headerStyle: {
            shadowColor: "transparent",
          },
        }}
      />
      <Tabs.Screen
        name="routines/index"
        options={{
          title: "Routines",
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
          title: "Single Routine",
          href: null,
          headerLeft: () => <BackButton />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          headerLeft: () => <BackButton />,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.xyaxis.line" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          headerLeft: () => <BackButton />,
          href: null,
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
