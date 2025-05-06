import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodaysStats } from "@/components/TodaysStats";
import { EXERCISES, TASKS } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getUserRoutines, RoutineWithItems } from "@/utils/routines";

const CARD_WIDTH = Dimensions.get("window").width - Spacings.lg * 2;

interface RoutineWithItemsData extends RoutineWithItems {
  items: {
    id: number;
    itemId: string;
    name: string;
    area: string;
    description: string;
    featureImage: string;
    notificationTime: string | null;
    addedAt: string;
  }[];
}
export default function HomeScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineWithItemsData[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUserRoutines().then((res) => {
        const withData = res.map((routine) => {
          const items = routine.items.map((item) => {
            const exercise = EXERCISES.find((e) => e.id === item.itemId);
            const task = TASKS.find((t) => t.id === item.itemId);
            const exerciseItem = exercise || task;
            return {
              ...item,
              name: exerciseItem?.name || "",
              area: exerciseItem?.area || "",
              description: exerciseItem?.description || "",
              featureImage: exerciseItem?.featureImage || "",
            };
          });
          return { ...routine, items };
        });
        setRoutines(withData);
      });
    }, [])
  );

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");

  const firstRoutine = routines[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacings.lg }}>
        <TodaysStats />

        <ThemedText style={styles.title} type="subtitle">
          Recommended exercises
        </ThemedText>

        {firstRoutine?.items?.slice(0, 3).map((item) => (
          <Pressable
            key={item.name}
            onPress={() =>
              router.push({
                pathname: "/exercise/[slug]",
                params: { slug: encodeURIComponent(item.name), routineId: firstRoutine.routineId },
              })
            }
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Image source={{ uri: item.featureImage }} style={styles.image} contentFit="cover" />
            <View style={styles.cardContent}>
              <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
              <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
              <ThemedText numberOfLines={2} style={styles.description}>
                {item.description}
              </ThemedText>
            </View>
          </Pressable>
        ))}

        <ThemedButton
          title="See all exercises"
          onPress={() => router.push(`/(tabs)/routines/${firstRoutine?.id}`)}
          variant="outline"
          icon="chevron.right"
          iconPlacement="right"
        />
      </ScrollView>

      <ThemedFabButton
        onPress={() => router.push("/(tabs)/add-user-log")}
        icon="plus"
        iconPlacement="right"
        title="Add Log"
        variant="solid"
        bottom={96}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.md,
    paddingBottom: 96,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacings.sm,
  },
  card: {
    borderWidth: 1,
    marginBottom: Spacings.xl,
    borderRadius: BorderRadii.md,
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: CARD_WIDTH,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: Spacings.md,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacings.xs,
  },
  exerciseArea: {
    fontSize: 13,
    marginBottom: Spacings.xs,
  },
  description: {
    fontSize: 13,
  },
});
