import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { decode } from "base64-arraybuffer"; // npm i base64-arraybuffer
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values"; // Required for uuid
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export interface PhotoUploadViewProps {
  photoUri: string | null;
  initialTransform?: { scale: number; x: number; y: number };
  overlayImage?: number; // accepts require("@/assets/...") style images
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  onPickPhoto: (photo: { uri: string; transform: { scale: number; x: number; y: number } } | null) => void;
  onTransformChange?: (transform: { scale: number; x: number; y: number }) => void;
}

const BUCKET_NAME = "face-analysis";

export function PhotoUpload({
  photoUri,
  overlayImage,
  initialTransform,
  loading,
  setLoading,
  onPickPhoto,
  onTransformChange,
}: PhotoUploadViewProps) {
  const inputTextColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const scale = useSharedValue(initialTransform?.scale || 1);
  const translationX = useSharedValue(initialTransform?.x || 0);
  const translationY = useSharedValue(initialTransform?.y || 0);

  const handleTransformUpdate = (s: number, x: number, y: number) => {
    onTransformChange?.({ scale: s, x, y });
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(e.scale, 1), 3);
    })
    .onEnd(() => {
      // Removed 'e' as it's not used
      runOnJS(handleTransformUpdate)(scale.value, translationX.value, translationY.value);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translationX.value = e.translationX;
      translationY.value = e.translationY;
    })
    .onEnd(() => {
      runOnJS(handleTransformUpdate)(scale.value, translationX.value, translationY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }, { translateY: translationY.value }, { scale: scale.value }],
  }));

  const uploadImageToSupabase = async ({
    name,
    extension,
    base64,
  }: {
    name: string;
    extension: string;
    base64: string;
  }): Promise<string | null> => {
    try {
      const cleanedName = name.replace(/[^a-zA-Z0-9_.-]/g, "_"); // Sanitize the file name
      const filePath = `public/${cleanedName}`; // Path inside the bucket, including the 'public' folder

      const buffer = decode(base64);
      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
        contentType: `image/${extension}`,
        cacheControl: "3600",
        upsert: true,
      });

      if (error) {
        console.error("Supabase upload error:", error.message);
        Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
        return null;
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        } else {
          Alert.alert("URL Error", "Failed to get public URL for the uploaded image.");
          return null;
        }
      }
      return null;
    } catch (e: any) {
      console.error("Upload process error:", e);
      Alert.alert("Upload Error", `An unexpected error occurred during upload: ${e.message || e}`);
      return null;
    }
  };

  const handlePickPhoto = useCallback(
    async (type: "camera" | "gallery") => {
      let result: ImagePicker.ImagePickerResult | null = null;

      setLoading?.(true);
      try {
        if (type === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission required", "Camera access is needed to take a photo.");
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            quality: 0.5,
            base64: true,
            allowsEditing: false,
          });
        } else {
          // gallery
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission required", "Gallery access is needed to upload your photo.");
            return;
          }
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.5,
            base64: true,
            allowsEditing: false,
          });
        }

        if (!result || result.canceled || !result.assets || result.assets.length === 0) {
          Alert.alert("Error", "No image selected or operation was canceled.");
          return;
        }

        const asset = result.assets[0];
        const base64 = asset.base64;

        if (!base64) {
          Alert.alert("Error", "Selected image was corrupted or not in required format.");
          return;
        }

        const publicUrl = await uploadImageToSupabase({
          name: asset.fileName || `photo.${asset.uri.split(".").pop()}`,
          base64: base64 || "",
          extension: asset.uri.split(".").pop() || "jpg",
        });

        if (publicUrl) {
          onPickPhoto({
            uri: publicUrl,
            transform: {
              scale: 1,
              x: 0,
              y: 0,
            },
          });

          scale.value = 1;
          translationX.value = 0;
          translationY.value = 0;
          runOnJS(handleTransformUpdate)(1, 0, 0);
        } else {
          console.error("Upload failed, publicUrl is null");
        }
      } catch (error) {
        console.error("Error picking photo:", error);
        Alert.alert("Error", "An unexpected error occurred while picking the photo.");
      } finally {
        setLoading?.(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPickPhoto, scale, translationX, translationY]
  );

  const actions = useMemo(
    () => (
      <View style={{ flexDirection: "row", gap: Spacings.sm }}>
        <Pressable
          onPress={() => handlePickPhoto("camera")}
          style={[styles.photoButton, { borderColor }]}
          disabled={loading}
        >
          <ThemedText style={{ color: inputTextColor }}>Camera</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handlePickPhoto("gallery")}
          style={[styles.photoButton, { borderColor }]}
          disabled={loading}
        >
          <ThemedText style={{ color: inputTextColor }}>Gallery</ThemedText>
        </Pressable>
      </View>
    ),
    [borderColor, inputTextColor, loading, handlePickPhoto]
  );

  if (!photoUri) {
    return actions;
  }

  return (
    <>
      <View style={styles.container}>
        {loading && (
          <ThemedText
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, textAlign: "center", zIndex: 10 }}
          >
            Uploading...
          </ThemedText>
        )}
        <GestureHandlerRootView>
          <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
            <Animated.Image source={{ uri: photoUri }} style={[styles.photo, animatedStyle]} resizeMode="cover" />
          </GestureDetector>
          {overlayImage && ( // Conditionally render overlayImage if provided
            <Image source={overlayImage} style={styles.overlay} resizeMode="contain" />
          )}
        </GestureHandlerRootView>
      </View>
      {actions}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    width: "100%", // Ensure container takes width for photo
    aspectRatio: 1, // Or a fixed height, depending on your layout needs
    maxHeight: 400, // Match photo height
    marginVertical: Spacings.sm,
    borderRadius: BorderRadii.md, // Apply border radius to container if photo has it
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    padding: Spacings.md,
    alignItems: "center",
    marginVertical: Spacings.sm,
    flex: 1, // Make buttons take equal space
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    opacity: 0.5,
    tintColor: "#fff",
    pointerEvents: "none",
  },
});
