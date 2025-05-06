import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { parseJSONCleaned } from "@/utils/json";
import { saveRoutineLog } from "@/utils/routines";

interface FaceAnalysisActionsViewProps {
  analysisResults: {
    symmetry: string;
    jawline: string;
    skin: string;
    recommendations: string;
  };
}

export default function FaceAnalysisActionsView({ analysisResults }: FaceAnalysisActionsViewProps) {
  const [routines, setRoutines] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const bg = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");

  useEffect(() => {
    const generateRoutines = async () => {
      try {
        const prompt = `Based on the following face analysis results, recommend 5 short facial exercise routines. Output a JSON array of routine names only.\n\nResults:\nSymmetry: ${analysisResults.symmetry}\nJawline: ${analysisResults.jawline}\nSkin: ${analysisResults.skin}\nRecommendations: ${analysisResults.recommendations}`;

        const res = await supabase.functions.invoke("openai", { body: { prompt } });
        const routinesParsed = parseJSONCleaned(res.data);

        if (Array.isArray(routinesParsed)) {
          setRoutines(routinesParsed);
        } else {
          Alert.alert("Invalid LLM response");
        }
      } catch {
        Alert.alert("Error generating routines");
      } finally {
        setLoading(false);
      }
    };

    generateRoutines();
  }, [analysisResults]);

  const toggleSelect = (routine: string) => {
    const newSet = new Set(selected);
    if (newSet.has(routine)) newSet.delete(routine);
    else newSet.add(routine);
    setSelected(newSet);
  };

  const handleConfirm = () => {
    selected.forEach(saveRoutineLog);
    router.replace("/(tabs)/progress?activeTab=Logs&logsTab=Routines");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: Spacings.md }}>
        Recommended Routines
      </ThemedText>

      {loading ? (
        <ThemedText>Generating routines...</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={{ gap: Spacings.sm }}>
          {routines.map((routine) => (
            <Pressable
              key={routine}
              onPress={() => toggleSelect(routine)}
              style={{
                padding: Spacings.md,
                borderWidth: 1,
                borderRadius: BorderRadii.md,
                borderColor: selected.has(routine) ? accent : border,
                backgroundColor: selected.has(routine) ? accent + "20" : bg,
              }}
            >
              <ThemedText style={{ color: text }}>{routine}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {!loading && (
        <View style={{ marginTop: Spacings.lg, gap: Spacings.md }}>
          <ThemedButton
            title="Save Selected Routines"
            icon="checkmark"
            disabled={!selected.size}
            onPress={handleConfirm}
            variant="solid"
          />
          <ThemedButton title="Exit" variant="ghost" onPress={() => router.replace("/(tabs)")} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacings.lg,
    paddingBottom: Spacings.xl * 2,
    flex: 1,
  },
});
