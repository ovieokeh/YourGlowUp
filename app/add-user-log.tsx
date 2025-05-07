import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Checkbox } from "@/components/Checkbox";
import { Collapsible } from "@/components/Collapsible";
import { PhotoUpload, PhotoUploadViewProps } from "@/components/PhotoUpload";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { saveUserLog } from "@/queries/logs/logs";
import Toast from "react-native-toast-message";

const TIPS = [
  "Avoid chewing only on one side — causes asymmetry.",
  "Sleep on your back or alternate sides to balance development.",
  "Nasal breathing supports correct tongue posture.",
  "Massage tight muscles (masseter, temporalis) 2x/week.",
  "Changes are gradual: noticeable at 1–3 months, structural at 6–12 months.",
  "Target 10–12% body fat (men) or 18–20% (women) for definition.",
];

export default function AddUserLogScreen() {
  const router = useRouter();

  const [dominantSide, setDominantSide] = useState("unsure");
  const [chewingDuration, setChewingDuration] = useState(0);
  const [gumUsed, setGumUsed] = useState(false);
  const [gumChewingDuration, setGumChewingDuration] = useState(0);
  const [symmetryRating, setSymmetryRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [transformForLog, setTransformForLog] = useState<{ scale: number; x: number; y: number }>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const borderColor = useThemeColor({}, "border");
  const inputTextColor = useThemeColor({}, "text");

  const resetForm = () => {
    setDominantSide("unsure");
    setChewingDuration(0);
    setGumUsed(false);
    setGumChewingDuration(0);
    setSymmetryRating(3);
    setNotes("");
    setPhotoUri(null);
  };

  const handleSubmit = async () => {
    if (!dominantSide || chewingDuration <= 0 || symmetryRating < 1 || symmetryRating > 5) {
      Toast.show({
        type: "error",
        text1: "Missing or invalid input",
        text2: "Please fill in all required fields with valid values.",
        position: "bottom",
      });
      return;
    }

    if (gumUsed && gumChewingDuration <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Gum Duration",
        text2: "Please specify gum chewing duration.",
        position: "bottom",
      });
      return;
    }

    await saveUserLog({
      dominantSide,
      chewingDuration,
      gumUsed,
      gumChewingDuration,
      symmetryRating,
      notes,
      photoUri: photoUri || undefined,
      transform: transformForLog,
    })
      .then(() => {
        resetForm();
        router.replace("/(tabs)/progress?activeTab=Logs&logsTab=Self%20Reports");
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error Saving Log",
          text2: "Failed to save log. Please try again.",
          position: "bottom",
        });
      });
  };

  const handlePickPhoto = async ({ uri, transform }: PhotoUploadViewProps["onPickPhoto"]["arguments"][0]) => {
    setPhotoUri(uri);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView>
          <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Assess your progress today</ThemedText>

            <ThemedText style={{ ...styles.label, marginTop: 0 }}>Dominant Chewing Side</ThemedText>
            <View style={styles.tabsRow}>
              {["unsure", "left", "right", "both"].map((side) => (
                <ThemedButton
                  key={side}
                  variant="ghost"
                  title={side === "unsure" ? "Unsure" : side.charAt(0).toUpperCase() + side.slice(1)}
                  textStyle={{ fontSize: 14 }}
                  style={{
                    borderColor,
                    ...styles.tab,
                  }}
                  onPress={() => setDominantSide(side)}
                  active={dominantSide === side}
                />
              ))}
            </View>

            <ThemedText style={styles.label}>Chewing Duration (min)</ThemedText>
            <View style={styles.sliderRow}>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={chewingDuration}
                onValueChange={setChewingDuration}
              />
              <TextInput
                style={[styles.inputBox, { borderColor, color: inputTextColor }]}
                keyboardType="numeric"
                value={chewingDuration.toString()}
                onChangeText={(val) => setChewingDuration(Number(val))}
              />
            </View>

            <Checkbox label="Used Chewing Gum" onPress={() => setGumUsed((v) => !v)} checked={gumUsed} />

            {gumUsed && (
              <View>
                <ThemedText style={styles.label}>Gum Chewing Duration (min)</ThemedText>
                <View style={styles.sliderRow}>
                  <Slider
                    style={{ flex: 1 }}
                    minimumValue={0}
                    maximumValue={60}
                    step={1}
                    value={gumChewingDuration}
                    onValueChange={setGumChewingDuration}
                  />
                  <TextInput
                    style={[styles.inputBox, { borderColor, color: inputTextColor }]}
                    keyboardType="numeric"
                    value={gumChewingDuration.toString()}
                    onChangeText={(val) => setGumChewingDuration(Number(val))}
                  />
                </View>
              </View>
            )}

            <ThemedText style={styles.label}>Symmetry Rating</ThemedText>
            <View style={styles.tabsRow}>
              {[1, 2, 3, 4, 5].map((num) => (
                <ThemedButton
                  key={num}
                  title={`${num}${num === 1 ? " (Low)" : num === 3 ? " (Mid)" : num === 5 ? " (High)" : ""}`}
                  onPress={() => setSymmetryRating(num)}
                  style={{
                    borderColor,
                    ...styles.tab,
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                  variant="ghost"
                  active={symmetryRating === num}
                />
              ))}
            </View>

            <ThemedText style={styles.label}>Notes</ThemedText>
            <TextInput
              multiline
              numberOfLines={4}
              style={[styles.textArea, { borderColor, color: inputTextColor }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              placeholderTextColor={inputTextColor}
            />

            <ThemedText style={styles.label}>Progress Photo</ThemedText>

            <PhotoUpload
              photoUri={photoUri || null}
              onPickPhoto={handlePickPhoto}
              onTransformChange={setTransformForLog}
              initialTransform={transformForLog}
              loading={isUploading}
              setLoading={setIsUploading}
              allowTransform
            />

            <View style={{ marginVertical: 24 }}>
              <Collapsible title="Tips, Timeline, and What to Avoid">
                {TIPS.map((tip, index) => (
                  <ThemedText key={index} style={{ marginBottom: 8 }}>
                    {index + 1}. {tip}
                  </ThemedText>
                ))}
              </Collapsible>
            </View>

            <Pressable onPress={handleSubmit} style={[styles.submitButton]}>
              <ThemedText style={{ fontWeight: "600" }}>Save Log</ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacings.lg,
    paddingBottom: Spacings.xl * 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacings.lg,
  },
  label: {
    fontSize: 15,
    marginTop: Spacings.lg,
    marginBottom: Spacings.xs,
  },
  tabsRow: {
    flexDirection: "row",
    gap: Spacings.sm,
    flexWrap: "wrap",
    marginBottom: Spacings.sm,
  },
  tab: {
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.md,
    borderRadius: BorderRadii.sm,
    borderWidth: 1,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  inputBox: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    paddingHorizontal: Spacings.sm,
    textAlign: "center",
  },

  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    padding: Spacings.sm,
    height: 80,
    textAlignVertical: "top",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadii.md,
    marginVertical: Spacings.sm,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    padding: Spacings.md,
    alignItems: "center",
    marginVertical: Spacings.sm,
  },
  submitButton: {
    backgroundColor: Colors.light.success,
    marginTop: Spacings.lg,
    paddingVertical: Spacings.lg,
    borderRadius: BorderRadii.md,
    alignItems: "center",
  },
});
