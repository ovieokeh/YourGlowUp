import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TodaysStats } from "@/components/TodaysStats";
import { Colors } from "@/constants/Colors";
import { EXERCISES } from "@/constants/Exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_WIDTH = Dimensions.get("window").width - 48;

export default function HomeScreen() {
  const router = useRouter();

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <ThemedText style={styles.title} type="subtitle">
            At a glance
          </ThemedText>
          <TodaysStats />

          <ThemedText style={styles.title} type="subtitle">
            Recommended exercises
          </ThemedText>

          {EXERCISES.slice(0, 3).map((item) => (
            <Pressable
              key={item.name}
              onPress={() =>
                router.push({
                  pathname: "/exercise/[slug]",
                  params: { slug: encodeURIComponent(item.name) },
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
            title="See all"
            onPress={() => router.push("/exercises")}
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
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    marginBottom: 32,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    width: CARD_WIDTH,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseArea: {
    fontSize: 13,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
  },
});
