import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProgressLogsView } from "@/views/progress/logs";
import { ProgressPhotoView } from "@/views/progress/photos";
import { ProgressStatsView } from "@/views/progress/stats";

const TABS = ["Photos", "Stats", "Logs"] as const;

interface GoalStatsScreenProps {
  selectedGoalId?: string;
}
export const GoalStatsScreen: React.FC<GoalStatsScreenProps> = ({ selectedGoalId }) => {
  const { user, goals } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);

  const SCREEN_WIDTH = useWindowDimensions().width;
  const params = useLocalSearchParams();
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>(selectedGoalId);

  const goalOptions = useMemo(
    () =>
      goals?.map((goal) => ({
        label: goal.name,
        value: goal.id,
      })) ?? [],
    [goals]
  );

  useEffect(() => {
    if (goalOptions.length > 0 && !selectedGoal) {
      setSelectedGoal(goalOptions[0].value);
    }
  }, [goalOptions, selectedGoal]);

  const initialTab = params.activeTab === "Photos" ? "Photos" : "Stats";
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const tabBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const color = useThemeColor({}, "text");

  const underline = useThemeColor({}, "tint");
  const translateX = useSharedValue(0);
  const tabWidth = SCREEN_WIDTH / TABS.length;
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
  }));
  useEffect(() => {
    const index = TABS.indexOf(initialTab);
    translateX.value = tabWidth * index;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab, tabWidth]);

  const handleTabPress = (tab: (typeof TABS)[number], index: number) => {
    setActiveTab(tab);
    translateX.value = tabWidth * index;
  };

  return (
    <ThemedView style={[styles.flex, styles.container]}>
      <View style={[styles.tabBar, { borderColor: tabBorder }]}>
        {TABS.map((tab, idx) => (
          <Pressable key={tab} style={styles.tabButton} onPress={() => handleTabPress(tab, idx)}>
            <IconSymbol
              size={24}
              name={tab === "Logs" ? "book" : tab === "Stats" ? "chart.xyaxis.line" : "calendar"}
              color={color}
            />
            <ThemedText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</ThemedText>
          </Pressable>
        ))}
        <Animated.View style={[styles.underline, { width: tabWidth, backgroundColor: underline }, underlineStyle]} />
      </View>

      {activeTab === "Stats" ? (
        <ScrollView>
          <ProgressStatsView selectedGoalId={selectedGoal} />
        </ScrollView>
      ) : activeTab === "Logs" ? (
        <ProgressLogsView userId={currentUserId} selectedGoalId={selectedGoal} />
      ) : (
        <ScrollView>
          <ProgressPhotoView />
        </ScrollView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingBottom: 96,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: Spacings.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    gap: Spacings.sm,
    justifyContent: "center",
    alignContent: "center",
    paddingVertical: Spacings.sm,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
  },
  tabTextActive: {
    fontWeight: "600",
  },
  underline: {
    position: "absolute",
    height: 2,
    bottom: 0,
    left: 0,
  },
});
