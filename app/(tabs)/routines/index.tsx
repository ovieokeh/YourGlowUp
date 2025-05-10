import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetRoutines } from "@/queries/routines";

export default function RoutinesScreen() {
  const router = useRouter();

  const routinesQuery = useGetRoutines();

  const isLoading = routinesQuery.isLoading;
  const routines = useMemo(() => routinesQuery.data || [], [routinesQuery.data]);

  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");

  const sorted = routines;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/routines/${item.id}`)}
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
        ListEmptyComponent={
          <View
            style={[
              {
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Image
              source={require("@/assets/images/empty-routines.png")}
              style={{ width: 200, height: 200, marginBottom: 16 }}
              resizeMode="contain"
            />
            <ThemedText style={styles.name}>No routines found</ThemedText>
            <ThemedText style={styles.description}>You can create a new routine.</ThemedText>
          </View>
        }
      />

      <View style={styles.actions}>
        <ThemedButton
          variant="solid"
          title="Generate AI Routine"
          onPress={() => {
            router.push("/face-analysis");
          }}
          icon="wand.and.stars"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom: 96 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  icon: { marginTop: 4 },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  description: { marginTop: 4, fontSize: 14, opacity: 0.7 },
  time: { marginTop: 4, fontSize: 13, opacity: 0.5 },
  actions: {
    marginTop: "auto",
    gap: 12,
    paddingBottom: 20,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "600",
  },
});
