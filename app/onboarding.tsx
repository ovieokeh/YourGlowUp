import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { setOnboardingComplete } from "@/utils/onboarding";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Welcome to FaceGlowUp",
    description: "Your journey to a more balanced and confident face begins here.",
  },
  {
    title: "Science-Backed Methods",
    description:
      "Facial symmetry can be improved. With daily exercises rooted in muscle training and posture science, subtle yet powerful changes are possible.",
  },
  {
    title: "Consistency is Confidence",
    description:
      "We’ll guide you each day. You just show up. Your face will thank you.\n\nReady to start your transformation?",
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const router = useRouter();

  const inactiveDot = useThemeColor({}, "border");
  const activeDot = useThemeColor({}, "text");
  const bg = useThemeColor({}, "background");

  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
      translateX.value = withTiming(-(index + 1) * width);
    } else {
      await setOnboardingComplete();
      router.replace("/auth");
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <Animated.View style={[styles.sliderContainer, animatedStyle]}>
        {slides.map((slide, i) => (
          <View style={styles.slide} key={i}>
            <ThemedText
              type="title"
              style={{
                marginHorizontal: "auto",
              }}
            >
              {slide.title}
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={{
                marginHorizontal: "auto",
                textAlign: "center",
              }}
            >
              {slide.description}
            </ThemedText>
          </View>
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === index ? activeDot : inactiveDot }]} />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 24 }}>
          <ThemedButton
            title={index < slides.length - 1 ? "Skip" : "Done"}
            onPress={async () => {
              if (index < slides.length - 1) {
                setIndex(slides.length - 1);
                translateX.value = withTiming(-(slides.length - 1) * width);
              } else {
                await setOnboardingComplete();
                router.replace("/auth");
              }
            }}
            variant="outline"
          />
          <ThemedButton
            title={index < slides.length - 1 ? "Next" : "Get Started"}
            onPress={handleNext}
            variant="solid"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sliderContainer: {
    flexDirection: "row",
    width: width * slides.length,
    flex: 1,
  },
  slide: {
    width,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});
