import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyGoalsView } from "@/views/shared/EmptyGoalsView";

export const HomeScreenEmptyNoGoals: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* EmptyGoalsView likely handles its own internal centering/layout */}
      <EmptyGoalsView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center", // Center the content
    alignItems: "center",
  },
});
