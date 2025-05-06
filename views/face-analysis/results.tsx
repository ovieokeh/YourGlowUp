import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EXERCISES, TASKS } from "@/constants/Exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { parseJSONCleaned } from "@/utils/json";
import { useRouter } from "expo-router";

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
  onResult: (data: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
}

export default function FaceAnalysisResultsView({ frontUri, leftUri, rightUri, loading, onResult, setLoading }: Props) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const router = useRouter();

  const accentColor = useThemeColor({}, "accent");
  const borderColor = useThemeColor({}, "border");
  const scoreColor = useThemeColor({}, "accent");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let factoidIndex = 0;
    const interval = setInterval(() => {
      if (flatListRef.current) {
        factoidIndex = (factoidIndex + 1) % FACTOIDS.length;
        flatListRef.current.scrollToIndex({ index: factoidIndex, animated: true, viewPosition: 0.5 });
      }
    }, 4000); // Change factoid every 4 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true); // Ensure loading is true at the start of analysis
      const images: string[] = [frontUri ?? "", leftUri ?? "", rightUri ?? ""].filter((uri) => uri);

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
    EXERCISES,
    TASKS,
  })}
\`\`\`

Only output valid JSON with no explanations or surrounding text. This will be parsed directly. Be concise and professional.`;

        const res = await supabase.functions.invoke("openai", {
          body: {
            name: "FaceSymmetryAnalysis", // More descriptive function name if you can change it
            prompt,
            images,
          },
        });

        if (!isMounted) return;

        const cleanedResponse = res.data?.result ?? res.data; // Access .result if present

        if (!cleanedResponse) {
          throw new Error("Empty response from AI function.");
        }

        const parsed = parseJSONCleaned(cleanedResponse) as AnalysisResult;
        // Basic validation of parsed structure
        if (typeof parsed.symmetryScore !== "number" || !Array.isArray(parsed.observations)) {
          throw new Error("Parsed JSON does not match expected structure.");
        }

        setResult(parsed);
        onResult(parsed);
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

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontUri, leftUri, rightUri]); // onResult can be memoized if it changes often

  const renderListItem = (item: string, index: number) => (
    <ThemedText key={index} style={{ marginBottom: 6, fontSize: 15, lineHeight: 22 }}>
      • {item}
    </ThemedText>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <ThemedText type="title">Analyzing your face...</ThemedText>
          <FlatList
            ref={flatListRef}
            data={FACTOIDS}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <ThemedText
                style={{
                  fontStyle: "italic",
                  opacity: 0.7,
                  fontSize: 14,
                  width: 300,
                  textAlign: "center",
                  padding: 10,
                }}
              >
                {item}
              </ThemedText>
            )}
          />
          <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 24 }} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
            {[frontUri, leftUri, rightUri].map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={{ width: 64, height: 64, borderRadius: 10, borderWidth: 1, borderColor }}
              />
            ))}
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <ThemedText type="title">Analysis Failed</ThemedText>
          <ThemedText style={{ marginVertical: 12, textAlign: "center" }}>
            Something went wrong while analyzing your images.
          </ThemedText>
          <ThemedButton title="Back to Home" onPress={() => router.replace("/(tabs)")} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
        <ThemedText type="title" style={{ textAlign: "center", marginBottom: 24 }}>
          Your Facial Analysis
        </ThemedText>

        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <ThemedText style={{ fontSize: 16, marginBottom: 4 }}>Symmetry Score</ThemedText>
          <ThemedText style={{ fontSize: 48, fontWeight: "bold", color: scoreColor, lineHeight: 48 }}>
            {result.symmetryScore.toFixed(1)}
          </ThemedText>
          <ThemedText style={{ fontSize: 16, opacity: 0.6 }}>/ 5</ThemedText>
        </View>

        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
          Profile Highlights
        </ThemedText>
        <ThemedText style={{ marginBottom: 6 }}>
          <ThemedText style={{ fontWeight: "600" }}>Left:</ThemedText> {result.leftProfileDefinition}
        </ThemedText>
        <ThemedText style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontWeight: "600" }}>Right:</ThemedText> {result.rightProfileDefinition}
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
          Skin Assessment
        </ThemedText>
        <ThemedText style={{ marginBottom: 16 }}>{result.skinClarity}</ThemedText>

        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
          Key Observations
        </ThemedText>
        {result.observations.map(renderListItem)}
      </ScrollView>
    </SafeAreaView>
  );
}
