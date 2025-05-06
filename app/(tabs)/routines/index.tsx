import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ROUTINES } from "@/constants/Exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Routine, getUserRoutines } from "@/utils/routines";

export default function RoutinesScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getUserRoutines();
        if (data) {
          setRoutines(data);
        } else {
          setRoutines(ROUTINES);
        }
      } catch (error) {
        console.error("Error fetching routines:", error);
      }
    };
    init();
  }, []);

  const sorted = routines.sort((a, b) => {
    if (a.notificationTime === "random") return 1;
    if (b.notificationTime === "random") return -1;
    return a.notificationTime.localeCompare(b.notificationTime);
  });

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
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
              <ThemedText style={styles.time}>Time: {item.notificationTime}</ThemedText>
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
        <Pressable style={[styles.actionButton, { borderColor: border }]} onPress={() => router.push("/face-analysis")}>
          <IconSymbol name="face.smiling" size={18} color={text} />
          <ThemedText style={styles.actionText}>Start Face Analysis</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { borderColor: border }]}
          onPress={() => router.push("/routines/explore")}
        >
          <IconSymbol name="sparkles" size={18} color={text} />
          <ThemedText style={styles.actionText}>Browse All Routines</ThemedText>
        </Pressable>
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
