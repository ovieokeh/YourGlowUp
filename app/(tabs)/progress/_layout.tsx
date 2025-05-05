import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProgressTabLayout() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <Tabs
      initialRouteName="stats"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].accent,
        tabBarInactiveTintColor: Colors[colorScheme].tint,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          default: {
            zIndex: 1000,
          },
          ios: {
            backgroundColor: Colors[colorScheme].tabBar,
            position: "absolute",
          },
          android: {
            backgroundColor: Colors[colorScheme].tabBar,
            borderTopWidth: 0.5,
            borderTopColor: Colors[colorScheme].border,
            elevation: 12,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.xyaxis.line" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: "Track",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
