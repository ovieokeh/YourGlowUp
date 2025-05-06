import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import FaceAnalysisActionsView from "@/views/face-analysis/actions";
import FaceAnalysisFormView from "@/views/face-analysis/form";
import FaceAnalysisResultsView from "@/views/face-analysis/results";
import { useRouter, useSearchParams } from "expo-router/build/hooks";

const STEPS = ["form", "results", "actions"] as const;
type Step = (typeof STEPS)[number];

export default function FaceAnalysisScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const activeTab = params.get("step") || "form";
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
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Step Progress */}
          <ThemedText style={styles.progressText}>
            Step {stepIndex + 1} of {totalSteps}
          </ThemedText>

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
            />
          )}
          {step === "results" && (
            <FaceAnalysisResultsView
              frontUri={photos.front?.uri || ""}
              leftUri={photos.left?.uri || ""}
              rightUri={photos.right?.uri || ""}
              onResult={(results: any) => {
                setAnalysisResults(results);
                // setStep("actions");
              }}
            />
          )}
          {step === "actions" && <FaceAnalysisActionsView analysisResults={analysisResults} />}
        </ScrollView>
        {/* Navigation */}
        <View style={styles.navRow}>
          <ThemedButton
            title="Quit"
            onPress={() => {
              router.back();
            }}
            variant="ghost"
            style={styles.button}
          />

          {step !== "form" && <ThemedButton title="Back" onPress={goBack} variant="ghost" style={styles.button} />}
          {step !== "actions" && <ThemedButton title="Next" onPress={goNext} variant="solid" style={styles.button} />}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    opacity: 0.6,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    minWidth: 120,
  },
});
