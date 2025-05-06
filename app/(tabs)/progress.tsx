import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProgressLogsView } from "@/views/progress/logs";
import { ProgressStatsView } from "@/views/progress/stats";
import { ProgressTrackView } from "@/views/progress/track";

const TABS = ["Logs", "Stats", "Track"] as const;

export default function ProgressScreen() {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const params = useLocalSearchParams();
  const initialTab = params.activeTab === "Logs" ? "Logs" : "Stats";
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const tabBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const color = useThemeColor({}, "text");

  const underline = useThemeColor({ light: Colors.light.accent, dark: Colors.dark.accent }, "accent");
  const translateX = useSharedValue(0);
  const tabWidth = SCREEN_WIDTH / TABS.length;
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
  }));
  useEffect(() => {
    const index = TABS.indexOf(initialTab);
    translateX.value = tabWidth * index;
  }, [initialTab, tabWidth, translateX]);

  const handleTabPress = (tab: (typeof TABS)[number], index: number) => {
    setActiveTab(tab);
    translateX.value = tabWidth * index;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View
          style={{
            flex: 1,
          }}
        >
          {activeTab === "Stats" ? (
            <ProgressStatsView />
          ) : activeTab === "Logs" ? (
            <ProgressLogsView />
          ) : (
            <ProgressTrackView />
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
