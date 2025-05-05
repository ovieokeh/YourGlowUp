import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import AccountView from "@/views/settings/account";
import AppSettingsView from "@/views/settings/app-settings";
import { useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const TABS = ["App Settings", "Account"] as const;

export default function SettingsScreen() {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const params = useLocalSearchParams();
  const initialTab = params.activeTab === "Account" ? "Account" : "App Settings";
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const tabBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
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
              <ThemedText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</ThemedText>
            </Pressable>
          ))}
          <Animated.View style={[styles.underline, { width: tabWidth, backgroundColor: underline }, underlineStyle]} />
        </View>

        {activeTab === "Account" ? <AccountView /> : <AppSettingsView />}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    position: "relative",
    borderBottomWidth: 1,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 16 },
  tabTextActive: { fontWeight: "600" },
  underline: {
    position: "absolute",
    height: 2,
    bottom: 0,
    left: 0,
  },
});
