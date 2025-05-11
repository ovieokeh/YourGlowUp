import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DEFAULT_ACTIVITIES } from "@/constants/Goals";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { parseJSONCleaned } from "@/utils/json";
import { useSound } from "@/utils/sounds";

const FACTOIDS = [
  "Facial symmetry is often linked to perceptions of attractiveness and health.",
  "Getting consistent, quality sleep significantly improves skin tone and reduces facial puffiness.",
  "Chewing food evenly on both sides of your mouth helps develop balanced jaw muscles.",
  "Maintaining proper tongue posture (resting on the roof of the mouth) can influence facial structure over time.",
  "Adequate hydration is crucial for maintaining skin elasticity, giving your face a natural glow.",
  "Regular, gentle facial massage can improve circulation and lymphatic drainage.",
  "Protecting your skin from sun exposure is key to preventing premature aging and maintaining clarity.",
];

interface AnalysisResult {
  symmetryScore: number;
  leftProfileDefinition: string;
  rightProfileDefinition: string;
  skinClarity: string;
  observations: string[];
  recommendations: string[];
}

interface Props {
  frontUri: string;
  leftUri: string;
  rightUri: string;
  loading: boolean;
  analysisResults: AnalysisResult | null;
  onResult: (data: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
}

export default function FaceAnalysisResultsView({
  frontUri,
  leftUri,
  rightUri,
  loading,
  analysisResults,
  onResult,
  setLoading,
}: Props) {
  const [result, setResult] = useState<AnalysisResult | null>(analysisResults);
  const router = useRouter();

  const accentColor = useThemeColor({}, "accent");
  const borderColor = useThemeColor({}, "border");
  const scoreColor = useThemeColor({}, "accent");
  const flatListRef = useRef<FlatList>(null);

  const { play } = useSound();

  useEffect(() => {
    let factoidIndex = 0;
    const interval = setInterval(() => {
      if (flatListRef.current) {
        factoidIndex = (factoidIndex + 1) % FACTOIDS.length;
        flatListRef.current.scrollToIndex({ index: factoidIndex, animated: true, viewPosition: 0.5 });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (analysisResults?.recommendations) {
        setResult(analysisResults);
        return;
      }

      setLoading(true);
      const images: string[] = [frontUri ?? "", leftUri ?? "", rightUri ?? ""].filter(Boolean);

      if (images.length < 3) {
        console.error("Not all images are available for analysis.");
        if (isMounted) {
          setResult(null);
          onResult(null);
          setLoading(false);
        }
        return;
      }

      try {
        const prompt = `You're a facial symmetry analyst AI. Given three images (front, left, right), output a JSON object with the following structure:
{
  "symmetryScore": number (1-5, can be decimal, e.g., 4.5),
  "leftProfileDefinition": string (description including chin projection, alignment, definition, etc),
  "rightProfileDefinition": string (description same as left),
  "skinClarity": string (description, e.g., "Generally clear with minor redness on cheeks."),
  "observations": string[] (3-5 key observations, e.g., "Slight asymmetry in eyebrow height.", "Balanced lip volume."),
  "recommendations": string[] (3-5 exercises or tasks IDs)
}

Available Exercises and Tasks:
\`\`\`
  ${JSON.stringify({
    DEFAULT_ACTIVITIES,
  })}
\`\`\`

Only output valid JSON with no explanations or surrounding text. This will be parsed directly. Be concise and professional.`;

        const res = await supabase.functions.invoke("openai", {
          body: {
            name: "FaceSymmetryAnalysis",
            prompt,
            images,
          },
        });

        if (!isMounted) return;

        const cleanedResponse = res.data?.result ?? res.data;
        if (!cleanedResponse) throw new Error("Empty response from AI function.");

        const parsed = parseJSONCleaned(cleanedResponse) as AnalysisResult;
        if (typeof parsed.symmetryScore !== "number" || !Array.isArray(parsed.observations)) {
          throw new Error("Parsed JSON does not match expected structure.");
        }

        setResult(parsed);
        onResult(parsed);
        play("complete-face-analysis");
      } catch (err) {
        console.error("AI Analysis failed:", err);
        if (isMounted) {
          setResult(null);
          onResult(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontUri, leftUri, rightUri]);

  const renderListItem = (item: string, index: number) => (
    <ThemedText key={index} style={styles.listItem}>
      • {item}
    </ThemedText>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="title">Analyzing your face...</ThemedText>
        <FlatList
          ref={flatListRef}
          data={FACTOIDS}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ThemedText style={styles.factoid}>{item}</ThemedText>}
        />
        <ActivityIndicator size="large" color={accentColor} style={styles.loadingIndicator} />
        <View style={[styles.imageRow, { borderColor }]}>
          {[frontUri, leftUri, rightUri].map((uri, i) => (
            <Image key={i} source={{ uri }} style={[styles.faceImage, { borderColor }]} />
          ))}
        </View>
      </ThemedView>
    );
  }

  if (!result) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="title">Analysis Failed</ThemedText>
        <ThemedText style={styles.errorText}>Something went wrong while analyzing your images.</ThemedText>
        <ThemedButton title="Back to Home" onPress={() => router.replace("/(tabs)")} />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.resultContainer}>
      <ThemedText type="title" style={styles.title}>
        Your Facial Analysis
      </ThemedText>

      <View style={styles.scoreContainer}>
        <ThemedText style={styles.scoreLabel}>Symmetry Score</ThemedText>
        <ThemedText style={[styles.scoreValue, { color: scoreColor }]}>{result.symmetryScore.toFixed(1)}</ThemedText>
        <ThemedText style={styles.scoreMax}>/ 5</ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Profile Highlights
      </ThemedText>
      <ThemedText style={styles.sectionText}>
        <ThemedText style={styles.bold}>Left:</ThemedText> {result.leftProfileDefinition}
      </ThemedText>
      <ThemedText style={styles.sectionText}>
        <ThemedText style={styles.bold}>Right:</ThemedText> {result.rightProfileDefinition}
      </ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Skin Assessment
      </ThemedText>
      <ThemedText style={styles.sectionText}>{result.skinClarity}</ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Key Observations
      </ThemedText>
      {result.observations.map(renderListItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  factoid: {
    fontStyle: "italic",
    opacity: 0.7,
    fontSize: 14,
    width: Dimensions.get("window").width - Spacings.xl * 2,
    textAlign: "center",
    padding: Spacings.sm,
  },
  loadingIndicator: {
    marginTop: Spacings.lg,
  },
  imageRow: {
    flexDirection: "row",
    gap: Spacings.sm,
    marginTop: Spacings.lg,
  },
  faceImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    marginVertical: Spacings.md,
    textAlign: "center",
  },
  resultContainer: {
    paddingTop: 0,
    paddingBottom: 64,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacings.lg,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacings.xl,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: Spacings.xs,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    lineHeight: 48,
  },
  scoreMax: {
    fontSize: 16,
    opacity: 0.6,
  },
  sectionTitle: {
    marginBottom: Spacings.sm,
  },
  sectionText: {
    marginBottom: Spacings.md,
  },
  bold: {
    fontWeight: "600",
  },
  listItem: {
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 22,
  },
});
