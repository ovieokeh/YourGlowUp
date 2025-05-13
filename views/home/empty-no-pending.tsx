import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { Spacings } from "@/constants/Theme";

interface HomeScreenEmptyNoPendingProps {
  selectedGoalId?: string;
}

export const HomeScreenEmptyNoPending: React.FC<HomeScreenEmptyNoPendingProps> = ({ selectedGoalId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNavigate = (path: any, params?: Record<string, any>) => {
    router.push({ pathname: path, params });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          No activities scheduled today!
        </ThemedText>

        {selectedGoalId ? (
          <>
            <ThemedText type="default" style={styles.subtitle}>
              Add a new activity to your selected goal?
            </ThemedText>
            <ThemedButton
              title="Add Activity"
              onPress={() => handleNavigate(`/(tabs)/goals/${selectedGoalId}`)}
              variant="outline"
              icon="plus.circle"
              iconPlacement="right"
            />
          </>
        ) : (
          <>
            <ThemedText type="default" style={styles.subtitle}>
              Explore your goals to add activities.
            </ThemedText>
            <ThemedButton
              title="Explore Goals"
              onPress={() => handleNavigate(`/(tabs)/goals`)}
              variant="outline"
              icon="magnifyingglass"
              iconPlacement="right"
            />
          </>
        )}

        {/* Consider adding Create/Generate buttons here if desired in this empty state */}
        <View style={styles.footerButtons}>
          <ThemedButton
            title="Create a Goal"
            onPress={() => handleNavigate(`/(tabs)/goals/add`)}
            variant="outline"
            icon="plus.circle"
            iconPlacement="right"
          />
          <ThemedButton
            title="Generate an AI Goal"
            onPress={() => handleNavigate(`/face-analysis`)} // Ensure path is correct
            variant="solid"
            icon="wand.and.stars"
            iconPlacement="right"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center", // Center content vertically
  },
  container: {
    flex: 1,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    padding: Spacings.lg,
    gap: Spacings.md, // Consistent gap between elements
  },
  title: {
    textAlign: "center",
    marginBottom: Spacings.xs, // Reduced margin
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacings.md, // Space before button
    color: "#666", // Example muted color
  },
  footerButtons: {
    position: "absolute", // Position at bottom if desired, or just keep in flow
    bottom: Spacings.lg, // Spacing from bottom edge
    width: "100%",
    paddingHorizontal: Spacings.lg,
    gap: Spacings.md,
  },
});
