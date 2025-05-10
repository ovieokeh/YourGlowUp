import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { RoutinePicker } from "@/components/RoutinePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetRoutines } from "@/queries/routines";
import { ProgressLogsView } from "@/views/progress/logs";
import { ProgressPhotoView } from "@/views/progress/photos";
import { ProgressStatsView } from "@/views/progress/stats";

const TABS = ["Photos", "Stats", "Logs"] as const;

export default function ProgressScreen() {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const params = useLocalSearchParams();
  const [selectedRoutine, setSelectedRoutine] = useState<number | undefined>(
    params.routineId ? Number(params.routineId) : undefined
  );
  const routinesQuery = useGetRoutines();
  const routineOptions = useMemo(
    () =>
      routinesQuery.data?.map((routine) => ({
        label: routine.name,
        value: routine.id,
      })) ?? [],
    [routinesQuery.data]
  );

  useEffect(() => {
    if (routineOptions.length > 0 && !selectedRoutine) {
      setSelectedRoutine(routineOptions[0].value);
    }
  }, [routineOptions, selectedRoutine]);

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
    <ThemedView style={[styles.container]}>
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

      <RoutinePicker value={selectedRoutine} onChange={setSelectedRoutine} />
      {activeTab === "Stats" ? (
        <ScrollView>
          <ProgressStatsView selectedRoutine={selectedRoutine} />
        </ScrollView>
      ) : activeTab === "Logs" ? (
        <ProgressLogsView selectedRoutine={selectedRoutine} />
      ) : (
        <ScrollView>
          <ProgressPhotoView />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
