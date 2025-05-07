import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EXERCISES } from "@/constants/Exercises";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

const CARD_WIDTH = Dimensions.get("window").width - Spacings.xl * 2;

export default function ExercisesScreen() {
  const router = useRouter();

  const cardBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const cardBorder = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, "border");

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={EXERCISES}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: Spacings.xl * 6 }}
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
        style={{ gap: Spacings.md }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.md,
  },
  card: {
    borderWidth: 1,
    marginBottom: Spacings.xl + 8,
    borderRadius: BorderRadii.lg,
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
