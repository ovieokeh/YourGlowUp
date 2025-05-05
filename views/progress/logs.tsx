import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getLogs, isExerciseLog, isUserLog, Log } from "@/utils/db";

const TABS = ["Self Reports", "Exercise Logs"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;

export function ProgressLogsView() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const params = useLocalSearchParams();
  console.log("params", params);
  const initialTab = params.logsTab === "Exercise Logs" ? "Exercise Logs" : "Self Reports";

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");
  const underline = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "text");
  const success = useThemeColor({}, "success");
  const danger = useThemeColor({}, "danger");

  useFocusEffect(
    React.useCallback(() => {
      getLogs(setLogs);
    }, [])
  );

  const exerciseLogs = logs.filter(isExerciseLog);
  const userLogs = logs.filter(isUserLog);

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
    <View style={{ paddingBottom: Spacings.xl * 2 }}>
      <View style={[styles.tabBar, { borderColor: underline }]}>
        {TABS.map((tab, idx) => (
          <Pressable key={tab} style={styles.tabButton} onPress={() => handleTabPress(tab, idx)}>
            <ThemedText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</ThemedText>
          </Pressable>
        ))}
        <Animated.View style={[styles.underline, { width: tabWidth, backgroundColor: underline }, underlineStyle]} />
      </View>

      {activeTab === "Self Reports" ? (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={userLogs}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No self reports yet.</ThemedText>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.photo} />}
                <View style={styles.row}>
                  <IconSymbol name="face.smiling.fill" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Dominant side: <ThemedText style={styles.bold}>{item.dominantSide}</ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol name="clock" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Chewing duration: <ThemedText style={styles.bold}>{item.chewingDuration} min</ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol
                    name={item.gumUsed ? "checkmark.circle" : "xmark.circle"}
                    size={18}
                    color={item.gumUsed ? success : danger}
                  />
                  <ThemedText style={styles.rowText}>
                    {item.gumUsed ? `Gum: ${item.gumChewingDuration} min` : "No gum used"}
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <IconSymbol name="face.smiling" size={18} color={iconColor} />
                  <ThemedText style={styles.rowText}>
                    Symmetry rating: <ThemedText style={styles.bold}>{item.symmetryRating}</ThemedText>
                  </ThemedText>
                </View>
                {item.notes && (
                  <View style={styles.row}>
                    <IconSymbol name="message" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>Notes: {item.notes}</ThemedText>
                  </View>
                )}
                <ThemedText style={styles.timestamp}>{new Date(item.completedAt).toLocaleString()}</ThemedText>
              </View>
            )}
          />

          <ThemedFabButton
            onPress={() => router.push("/(tabs)/add-user-log")}
            icon="plus"
            iconPlacement="right"
            title="Add Log"
            variant="solid"
          />
        </>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={exerciseLogs}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No exercises logged yet.</ThemedText>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.log, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <ThemedText style={styles.exercise}>{item.exercise}</ThemedText>
                <View
                  style={{
                    marginTop: Spacings.sm,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol name="clock" size={18} color={iconColor} />
                    <ThemedText style={styles.rowText}>
                      Duration: <ThemedText style={styles.bold}>{item.duration} min</ThemedText>
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.timestamp}>{new Date(item.completedAt).toLocaleString()}</ThemedText>
                </View>
              </View>
            )}
          />

          <ThemedFabButton
            onPress={() => router.push("/exercises")}
            icon="plus"
            iconPlacement="right"
            title="Start an Exercise"
            variant="solid"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    position: "relative",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacings.md,
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
  list: {
    padding: Spacings.lg,
    paddingBottom: Spacings.xl * 2,
    gap: Spacings.md,
  },
  log: {
    padding: Spacings.md,
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadii.md,
    marginBottom: Spacings.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  rowText: {
    marginLeft: Spacings.xs,
    fontSize: 15,
  },
  bold: {
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    alignSelf: "flex-end",
  },
  exercise: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    paddingVertical: Spacings.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginBottom: Spacings.md,
  },
});
