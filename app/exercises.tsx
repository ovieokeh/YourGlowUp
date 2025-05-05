import React from "react";
import { View, FlatList, StyleSheet, Pressable, Dimensions, SafeAreaView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { EXERCISES } from "@/constants/Exercises";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width - 48;

export default function ExercisesScreen() {
  const router = useRouter();

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={EXERCISES}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: 192 }}
          renderItem={({ item }) => (
            <Pressable
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
          )}
          style={{ gap: 16 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  headerSection: {
    marginBottom: 24,
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
