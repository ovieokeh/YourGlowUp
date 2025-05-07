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

import { Collapsible } from "@/components/Collapsible";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSavePhotoLog } from "@/queries/logs";
import { PhotoLogCreate } from "@/queries/logs/logs";
import FaceAnalysisFormView from "@/views/face-analysis/form";
import Toast from "react-native-toast-message";

const TIPS = [
  "Avoid chewing only on one side — causes asymmetry.",
  "Sleep on your back or alternate sides to balance development.",
  "Nasal breathing supports correct tongue posture.",
  "Massage tight muscles (masseter, temporalis) 2x/week.",
  "Changes are gradual: noticeable at 1–3 months, structural at 6–12 months.",
  "Target 10–12% body fat (men) or 18–20% (women) for definition.",
];

const defaultTransform = {
  scale: 1,
  x: 0,
  y: 0,
};
export default function AddPhotoLogScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Omit<PhotoLogCreate, "routineId">>({
    front: {
      uri: "",
      transform: defaultTransform,
    },
    left: {
      uri: "",
      transform: defaultTransform,
    },
    right: {
      uri: "",
      transform: defaultTransform,
    },
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

  const [isUploading, setIsUploading] = useState(false);

  const borderColor = useThemeColor({}, "border");
  const inputTextColor = useThemeColor({}, "text");

  const savePhotoLogMutation = useSavePhotoLog("my-routine"); // Replace 'my-routine' with the actual routineId you want to use

  const validate = () => {
    const missing = {
      front: !photos.front,
      left: !photos.left,
      right: !photos.right,
    };
    setErrors(missing);
    return !missing.front && !missing.left && !missing.right;
  };

  const resetForm = () => {
    setNotes("");
    setPhotos({
      front: { uri: "", transform: defaultTransform },
      left: { uri: "", transform: defaultTransform },
      right: { uri: "", transform: defaultTransform },
    });
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Error Saving Log",
        text2: "Please fill in all required fields.",
        position: "bottom",
      });
      return;
    }
    await savePhotoLogMutation
      .mutateAsync({
        ...photos,
        notes: notes || undefined,
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView>
          <ThemedView style={styles.container}>
            <FaceAnalysisFormView
              photos={photos}
              setPhotos={setPhotos}
              onTransformChange={(key: "front" | "left" | "right", transform: any) => {
                setPhotos((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], transform },
                }));
              }}
              loading={isUploading}
              errors={errors}
              setErrors={setErrors}
              setLoading={setIsUploading}
              showPreview
              allowTransform
            />

            <ThemedText style={styles.label}>Would you like to share anything else about today?</ThemedText>
            <TextInput
              multiline
              numberOfLines={4}
              style={[styles.textArea, { borderColor, color: inputTextColor }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              placeholderTextColor={inputTextColor}
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
