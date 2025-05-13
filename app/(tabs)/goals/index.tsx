import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { EmptyGoalsView } from "@/views/shared/EmptyGoalsView";

export default function GoalsScreen() {
  const { goals, isLoadingGoals } = useAppContext();
  const router = useRouter();

  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");

  if (isLoadingGoals) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(goal) => goal.id.toString()}
        contentContainerStyle={{ flex: 1 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/goals/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: background, borderColor: border },
              pressed && { opacity: 0.9 },
            ]}
          >
            <IconSymbol name="clock" size={20} color={text} style={styles.icon} />
            <View style={styles.content}>
              <ThemedText style={styles.name}>{item.name}</ThemedText>
              <ThemedText style={styles.description}>{item.description}</ThemedText>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyGoalsView />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacings.md, paddingBottom: 96 },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    padding: Spacings.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacings.sm,
    marginBottom: Spacings.sm,
  },
  icon: { marginTop: Spacings.xs },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  description: { fontSize: 14, opacity: 0.7 },
  time: { marginTop: Spacings.xs, fontSize: 13, opacity: 0.5 },
  actions: {
    marginTop: "auto",
    gap: 12,
    paddingBottom: Spacings.xl,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    padding: Spacings.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "600",
  },
});
