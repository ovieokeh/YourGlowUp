import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { GoalPicker } from "@/components/GoalPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";

export default function GoalCommunityView() {
  return (
    <ThemedView style={styles.container}>
      <GoalPicker
        triggerProps={{
          style: {},
        }}
      />
      <View style={styles.content}>
        <ThemedText type="title">This screen is under construction</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // position: "relative",
    padding: Spacings.md,
    gap: Spacings.xl,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    marginTop: Spacings.md,
    paddingVertical: Spacings.md,
  },
});
