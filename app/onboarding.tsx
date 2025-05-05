import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getOnboardingStatus, OnboardingStatus, setOnboardingStatus } from "@/utils/onboarding";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Welcome to FaceGlowUp",
    description: "Your path to enhanced facial symmetry, improved confidence, and lasting results begins now.",
    image: require("@/assets/images/welcome-face.png"),
  },
  {
    title: "Science-Driven Results",
    description:
      "Achieve noticeable facial symmetry improvements with daily exercises designed using proven scientific methods.",
    image: require("@/assets/images/before-after-proof.png"),
  },
  {
    title: "Experience Instant Results",
    description: "Try a 15-second exercise right now and feel the immediate benefits—no commitments required.",
    image: require("@/assets/images/exercise-preview.png"),
    cta: {
      title: "Try it Now",
      link: `/auth?redirectTo=/exercise/tongue-posture`,
    },
  },
  {
    title: "AI Face Coach & Analysis",
    description:
      "Get personalized feedback and progress tracking with our AI-powered face coach, designed to help you achieve your goals.",
    image: require("@/assets/images/ai-coach.png"),
    cta: {
      title: "See it in Action",
      link: `/auth?redirectTo=/add-user-log`,
    },
  },
  {
    title: "Join the FaceGlowUp Community",
    description:
      "Ready to transform your face? Join our community of users who are already experiencing the benefits of facial symmetry.",
    image: require("@/assets/images/community.png"),
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const router = useRouter();

  const inactiveDot = useThemeColor({}, "border");
  const activeDot = useThemeColor({}, "text");
  const bg = useThemeColor({}, "background");

  useEffect(() => {
    (async () => {
      const onboardingStatus = await getOnboardingStatus("main-onboarding");
      if (onboardingStatus?.status === OnboardingStatus.IN_PROGRESS) {
        setIndex(onboardingStatus.step);
        translateX.value = withTiming(-(onboardingStatus.step * width), { duration: 300 });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    const nextIndex = index + 1;
    if (nextIndex < slides.length) {
      setIndex(nextIndex);
      translateX.value = withTiming(-nextIndex * width, { duration: 300 });
      await setOnboardingStatus("main-onboarding", { step: nextIndex, status: OnboardingStatus.IN_PROGRESS });
    } else {
      await setOnboardingStatus("main-onboarding", { step: 0, status: OnboardingStatus.COMPLETED });
      router.replace("/auth");
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = -(index * width) + e.translationX;
    })
    .onEnd(() => {
      const newIndex = Math.min(slides.length - 1, Math.max(0, Math.round(-translateX.value / width)));
      translateX.value = withTiming(-newIndex * width, { duration: 300 });
      runOnJS(setIndex)(newIndex);
      runOnJS(setOnboardingStatus)("main-onboarding", { step: newIndex, status: OnboardingStatus.IN_PROGRESS });
    });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.slider, animatedStyle]}>
            {slides.map((slide, idx) => (
              <View key={idx} style={styles.slide}>
                {slide.image && <Image source={slide.image} style={styles.image} resizeMode="contain" />}
                <ThemedText type="title" style={styles.title}>
                  {slide.title}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.description}>
                  {slide.description}
                </ThemedText>
                {slide.cta && (
                  <ThemedButton
                    title={slide.cta.title}
                    onPress={() => router.replace(slide.cta.link as any)}
                    variant="outline"
                    style={styles.ctaButton}
                  />
                )}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, idx) => (
              <View key={idx} style={[styles.dot, { backgroundColor: idx === index ? activeDot : inactiveDot }]} />
            ))}
          </View>
          <View style={styles.buttons}>
            <ThemedButton title="Skip" variant="outline" onPress={() => router.replace("/auth")} />
            <ThemedButton
              title={index === slides.length - 1 ? "Get Started" : "Next"}
              variant="solid"
              onPress={handleNext}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slider: { flexDirection: "row", width: width * slides.length, flex: 1 },
  slide: {
    width,
    padding: Spacings.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "90%",
    height: 240,
    marginBottom: Spacings.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacings.sm,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacings.md,
    paddingHorizontal: Spacings.md,
  },
  ctaButton: {
    width: "80%",
  },
  footer: {
    paddingVertical: Spacings.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacings.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadii.sm,
    marginHorizontal: Spacings.xs,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacings.xl,
  },
});
