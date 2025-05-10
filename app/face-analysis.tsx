import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { Spacings } from "@/constants/Theme";
import FaceAnalysisActionsView from "@/views/face-analysis/actions";
import FaceAnalysisFormView from "@/views/face-analysis/form";
import FaceAnalysisResultsView from "@/views/face-analysis/results";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";

const STEPS = ["form", "results", "actions"] as const;
type Step = (typeof STEPS)[number];

export default function FaceAnalysisScreen() {
  const params = useSearchParams();
  const activeTab = params.get("step") || "form";
  const referrer = params.get("referrer") || "home";
  const [step, setStep] = useState<Step>(activeTab as Step);
  const [photos, setPhotos] = useState<{
    front: { uri: string; transform?: any } | null;
    left: { uri: string; transform?: any } | null;
    right: { uri: string; transform?: any } | null;
  }>({
    front: null,
    left: null,
    right: null,
  });
  const [errors, setErrors] = useState<{
    front: boolean;
    left: boolean;
    right: boolean;
  }>({
    front: false,
    left: false,
    right: false,
  });
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length;

  const validate = () => {
    const missing = {
      front: !photos.front,
      left: !photos.left,
      right: !photos.right,
    };
    setErrors(missing);
    return !missing.front && !missing.left && !missing.right;
  };

  const goNext = () => {
    if (step === "form") {
      if (!validate()) {
        return;
      }
    }
    if (stepIndex < totalSteps - 1) {
      setStep(STEPS[stepIndex + 1]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1]);
    } else {
      if (referrer === "onboarding") {
        router.replace("/onboarding");
      } else {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {/* Step Progress */}
        <ThemedText style={styles.progressText}>
          Step {stepIndex + 1} of {totalSteps}
        </ThemedText>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {step === "form" && (
            <FaceAnalysisFormView
              photos={photos}
              setPhotos={setPhotos}
              onTransformChange={(key: "front" | "left" | "right", transform: any) => {
                setPhotos((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], transform },
                }));
              }}
              errors={errors}
              setErrors={setErrors}
              setLoading={setLoading}
              showPreview
            />
          )}
          {step === "results" && (
            <FaceAnalysisResultsView
              frontUri={photos.front?.uri || ""}
              leftUri={photos.left?.uri || ""}
              rightUri={photos.right?.uri || ""}
              analysisResults={analysisResults}
              onResult={(results: any) => {
                setAnalysisResults(results);
              }}
              loading={loading}
              setLoading={setLoading}
            />
          )}
          {step === "actions" && <FaceAnalysisActionsView analysisResults={analysisResults} />}
        </ScrollView>

        <View style={styles.navRow}>
          <ThemedButton
            title={step === "form" ? "Quit" : "Back"}
            onPress={goBack}
            variant="ghost"
            style={styles.button}
            disabled={step !== "form" && loading}
          />

          {step !== "actions" && (
            <ThemedButton
              title={step === "results" ? "View Recommendations" : "Next"}
              onPress={goNext}
              variant="solid"
              style={styles.button}
              disabled={
                (step === "form" && (!photos.front || !photos.left || !photos.right)) ||
                (step === "results" && !analysisResults) ||
                loading
              }
            />
          )}

          {step === "actions" && (
            <ThemedButton
              title={"Quit"}
              onPress={() => {
                router.replace("/(tabs)");
              }}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    justifyContent: "center",
    padding: Spacings.md,
  },
  container: {
    flex: 1,
    padding: Spacings.sm,
    paddingVertical: Spacings.md,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacings.sm,
    opacity: 0.6,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacings.sm,
  },
  button: {
    minWidth: 120,
  },
});
