import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  findNodeHandle,
  Image,
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
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { saveUserLog } from "@/utils/db";

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

  const borderColor = useThemeColor({}, "border");
  const inputTextColor = useThemeColor({}, "text");
  const backgroundActive = useThemeColor({ light: Colors.light.accent, dark: Colors.dark.accent }, "accent");

  const scrollViewRef = React.useRef<ScrollView>(null);
  const tipsRef = React.useRef<View>(null);

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
      Alert.alert("Missing or invalid input", "Please fill in all required fields with valid values.");
      return;
    }

    if (gumUsed && gumChewingDuration <= 0) {
      Alert.alert("Invalid Gum Duration", "Please specify gum chewing duration.");
      return;
    }

    let savedUri = photoUri;
    if (photoUri) {
      const filename = `log_${Date.now()}.jpg`;
      const targetPath = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: photoUri, to: targetPath });
      savedUri = targetPath;
    }

    await saveUserLog({
      dominantSide,
      chewingDuration,
      gumUsed,
      gumChewingDuration,
      symmetryRating,
      notes,
      photoUri: savedUri || undefined,
    });

    resetForm();
    router.replace("/(tabs)/progress/logs?activeTab=Self%20Reports");
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onTipsPress = () => {
    if (tipsRef.current && !!scrollViewRef.current) {
      const nodeHandle = findNodeHandle(tipsRef.current);
      if (!nodeHandle) return;
      // measureLayout(relativeToNativeNode, callback)
      tipsRef.current.measureLayout(nodeHandle, (_x, y) => {
        // scroll so the tips section sits 20px from top
        scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef}>
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
                    ...(dominantSide === side
                      ? {
                          backgroundColor: backgroundActive,
                          borderColor: "transparent",
                          color: dominantSide === side ? Colors.light.text : undefined,
                        }
                      : {}),
                  }}
                  onPress={() => setDominantSide(side)}
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

            <View style={styles.checkboxRow}>
              <Pressable onPress={() => setGumUsed((v) => !v)} style={styles.checkbox}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor,
                    backgroundColor: gumUsed ? backgroundActive : "transparent",
                  }}
                />
                <ThemedText>Used Chewing Gum</ThemedText>
              </Pressable>
            </View>

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
                    ...(symmetryRating === num
                      ? {
                          backgroundColor: backgroundActive,
                          borderColor: "transparent",
                          color: symmetryRating === num ? Colors.light.text : undefined,
                        }
                      : {}),
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                  variant="ghost"
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
            />

            <ThemedText style={styles.label}>Progress Photo</ThemedText>
            {photoUri ? (
              <View style={{ position: "relative" }}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    borderStyle: "solid",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "90%", height: 1, backgroundColor: "rgba(255,255,255,0.6)" }} />
                  <View
                    style={{ position: "absolute", width: 1, height: "90%", backgroundColor: "rgba(255,255,255,0.6)" }}
                  />
                </View>
              </View>
            ) : (
              <Pressable onPress={handlePickPhoto} style={[styles.photoButton, { borderColor }]}>
                <ThemedText style={{ color: inputTextColor }}>Take Photo</ThemedText>
              </Pressable>
            )}

            <View style={{ marginVertical: 24 }} ref={tipsRef}>
              <Collapsible title="Tips, Timeline, and What to Avoid" onPress={onTipsPress}>
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
  container: { padding: 20, paddingBottom: 114 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 15, marginTop: 24, marginBottom: 4 },
  tabsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 8 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  inputBox: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  checkbox: { flexDirection: "row", alignItems: "center", gap: 8, marginRight: 8 },
  textArea: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    height: 80,
    textAlignVertical: "top",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: Colors.light.success,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
