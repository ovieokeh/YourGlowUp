import { File } from "expo-file-system/next";
import mime from "mime";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { parseJSONCleaned } from "@/utils/json";
import { useRouter } from "expo-router";

const FACTOIDS = [
  "Facial symmetry is considered a sign of health and genetic fitness.",
  "Consistent sleep can improve skin tone and reduce puffiness.",
  "Chewing evenly helps develop balanced jaw muscles.",
  "Proper tongue posture influences facial structure over time.",
  "Hydration plays a key role in skin elasticity and glow.",
];

interface Props {
  frontUri: string;
  leftUri: string;
  rightUri: string;
  onResult: (data: any) => void;
}

export default function FaceAnalysisResultsView({ frontUri, leftUri, rightUri, onResult }: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const accent = useThemeColor({}, "accent");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  console.log("FaceAnalysisResultsView", { frontUri, leftUri, rightUri, result });

  useEffect(() => {
    const interval = setInterval(() => {
      flatListRef.current?.scrollToOffset({ offset: Math.random() * 200, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const images: string[] = [frontUri ?? "", leftUri ?? "", rightUri ?? ""];
      const uploadPromises: Promise<string | null>[] = [];

      for (const uri of images) {
        if (uri.startsWith("http")) return uri;

        try {
          uploadPromises.push(uploadToSupabase(uri));
        } catch (err) {
          console.error("Upload exception", err);
          return null;
        }
      }
      const uploadedImages = (await Promise.all(uploadPromises)).filter(Boolean);
      console.log("Uploaded images", uploadedImages);
      try {
        const prompt = `You're a facial symmetry analyst AI. Given three images (front, left, right), output a JSON object with the following structure:

{
  "symmetryScore": number (1-10),
  "leftProfileDefinition": string,
  "rightProfileDefinition": string,
  "skinClarity": string,
  "observations": string[],
  "recommendations": string[]
}

Only output JSON with no explanation. This will be parsed directly.`;

        const res = await supabase.functions.invoke("openai", {
          body: {
            name: "Functions",
            prompt,
            images: uploadedImages,
          },
        });

        console.log("AI Analysis response", res.data);

        const parsed = parseJSONCleaned(res.data);
        setResult(parsed);
        onResult(parsed);
      } catch (err) {
        console.log("AI Analysis failed", err);
        setResult(null);
        onResult(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontUri, leftUri, rightUri]);

  const handleQuit = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {loading ? (
          <>
            <ThemedText type="title">Analyzing your face...</ThemedText>
            <FlatList
              ref={flatListRef}
              data={FACTOIDS}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => <ThemedText style={styles.factoid}>{item}</ThemedText>}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 20 }}
            />
            <ActivityIndicator size="large" color={accent} />
            <View style={styles.previewRow}>
              {[frontUri, leftUri, rightUri].map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.preview} />
              ))}
            </View>
          </>
        ) : result ? (
          <>
            <ThemedText type="title">Your Analysis Results</ThemedText>
            <View style={styles.resultsBox}>
              <ThemedText>Symmetry Score: {result.symmetryScore}/10</ThemedText>
              <ThemedText>Left Profile: {result.leftProfileDefinition}</ThemedText>
              <ThemedText>Right Profile: {result.rightProfileDefinition}</ThemedText>
              <ThemedText>Skin Clarity: {result.skinClarity}</ThemedText>
              <ThemedText style={styles.label}>Observations:</ThemedText>
              {result.observations?.map((obs: string, i: number) => (
                <ThemedText key={i} style={styles.bullet}>
                  • {obs}
                </ThemedText>
              ))}
              <ThemedText style={styles.label}>Recommendations:</ThemedText>
              {result.recommendations?.map((rec: string, i: number) => (
                <ThemedText key={i} style={styles.bullet}>
                  • {rec}
                </ThemedText>
              ))}
            </View>
          </>
        ) : (
          <>
            <ThemedText type="title">Something went wrong.</ThemedText>
            <ThemedText>Please try again later.</ThemedText>
            <ThemedButton title="Back to Home" onPress={handleQuit} style={{ marginTop: 20 }} />
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  factoid: { marginRight: 16, fontSize: 14, fontStyle: "italic", opacity: 0.7 },
  previewRow: { flexDirection: "row", gap: 8, marginTop: 24 },
  preview: { width: 60, height: 60, borderRadius: 8 },
  resultsBox: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 10,
    gap: 6,
  },
  label: {
    fontWeight: "600",
    marginTop: 12,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 32,
    flexDirection: "row",
    gap: 16,
  },
});

/**
 * Upload a local image URI to Supabase Storage and return its public URL.
 */
async function uploadToSupabase(uri: string): Promise<string | null> {
  try {
    const mimeType = mime.getType(uri) || "image/*";
    const ext = mimeType.split("/")[1] || "jpg";
    const filename = `public/${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`;

    const rawLocalDirectory = uri.replace("file://", "").split("/").slice(0, -1).join("/");
    const localDirectory = rawLocalDirectory.replace(/%20/g, " ");
    const localFileName = uri.split("/").pop() ?? "";

    const src = new File(localDirectory, localFileName);
    const blob = src.blob();

    const { data, error } = await supabase.storage.from("face-analysis").upload(filename, blob, {
      contentType: mimeType,
      upsert: true,
      duplex: "both",
    });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage.from("face-analysis").getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload image:", err);
    return null;
  }
}
