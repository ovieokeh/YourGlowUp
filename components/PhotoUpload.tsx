import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ThemedButton } from "./ThemedButton";

const thumbnailScaleFactor = 0.15;
export interface PhotoUploadViewProps {
  photoUri: string | null;
  initialTransform?: { scale: number; x: number; y: number };
  overlayImage?: number;
  loading?: boolean;
  showPreview?: boolean;
  allowTransform?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  onPickPhoto: (photo: { uri: string; transform: { scale: number; x: number; y: number } } | null) => void;
  onTransformChange?: (transform: { scale: number; x: number; y: number }) => void;
}

const BUCKET_NAME = "face-analysis";

export function PhotoUpload({
  photoUri,
  overlayImage,
  initialTransform,
  showPreview = true,
  allowTransform = false,
  loading,
  setLoading,
  onPickPhoto,
  onTransformChange,
}: PhotoUploadViewProps) {
  const dimensions = useWindowDimensions();
  const { height } = dimensions;
  const inputTextColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const background = useThemeColor({}, "background");

  const [modalVisible, setModalVisible] = useState(false);

  const scale = useSharedValue(initialTransform?.scale || 1);
  const translationX = useSharedValue(initialTransform?.x || 0);
  const translationY = useSharedValue(initialTransform?.y || 0);

  const handleTransformUpdate = useCallback((s: number, x: number, y: number) => {
    onTransformChange?.({ scale: s, x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(e.scale, 1), 3);
    })
    .onEnd(() => {
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
      const cleanedName = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const filePath = `public/${cleanedName}`;

      const buffer = decode(base64);
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
        contentType: `image/${extension}`,
        cacheControl: "3600",
        upsert: true,
      });

      if (error) {
        console.error("Supabase upload error:", error.message);
        Toast.show({ type: "error", text1: "Upload Failed", text2: error.message, position: "bottom" });
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return publicUrlData?.publicUrl || null;
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Upload Error", text2: e.message || e, position: "bottom" });
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
          if (status !== "granted") throw new Error("Camera access denied");
          result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") throw new Error("Gallery access denied");
          result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.5, base64: true });
        }

        if (!result || result.canceled || !result.assets?.length) throw new Error("No image selected");
        const asset = result.assets[0];

        const publicUrl = await uploadImageToSupabase({
          name: asset.fileName || `photo.${asset.uri.split(".").pop()}`,
          base64: asset.base64 || "",
          extension: asset.uri.split(".").pop() || "jpg",
        });

        if (publicUrl) {
          onPickPhoto({ uri: publicUrl, transform: { scale: 1, x: 0, y: 0 } });
          scale.value = 1;
          translationX.value = 0;
          translationY.value = 0;
          runOnJS(handleTransformUpdate)(1, 0, 0);
        }
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Upload Error", text2: err.message, position: "bottom" });
      } finally {
        setLoading?.(false);
      }
    },
    [handleTransformUpdate, onPickPhoto, scale, setLoading, translationX, translationY]
  );

  const actions = useMemo(
    () => (
      <View style={styles.row}>
        {photoUri && (
          <Pressable onPress={() => setModalVisible(true)}>
            <View style={styles.thumbnailCrop}>
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: [
                    { scale: scale.value },
                    { translateX: -translationX.value * thumbnailScaleFactor }, // CHANGED
                    { translateY: -translationY.value * thumbnailScaleFactor }, // CHANGED
                  ],
                }}
                resizeMode="cover"
              />
            </View>
          </Pressable>
        )}
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
    [
      borderColor,
      inputTextColor,
      scale.value,
      translationX.value,
      translationY.value,
      loading,
      photoUri,
      handlePickPhoto,
    ]
  );

  return (
    <>
      {actions}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: background, borderColor, borderWidth: 1, borderRadius: BorderRadii.sm },
          ]}
        >
          <ThemedButton
            title="Close"
            onPress={() => setModalVisible(false)}
            variant="ghost"
            icon="x.circle"
            iconPlacement="left"
          />

          <ThemedText>
            {allowTransform ? "Pinch to zoom and drag to move the image. Tap 'Close' to save." : "Tap 'Close' to save."}
          </ThemedText>

          <View style={styles.photoContainer}>
            {showPreview && allowTransform ? (
              <GestureHandlerRootView>
                <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                  <Animated.Image
                    source={{ uri: photoUri || undefined }}
                    style={[
                      styles.photo,
                      animatedStyle,
                      {
                        height: height * 0.5,
                        width: "100%",
                      },
                    ]}
                    resizeMode="cover"
                  />
                </GestureDetector>
              </GestureHandlerRootView>
            ) : showPreview ? (
              <Image source={{ uri: photoUri || undefined }} style={[styles.photo]} resizeMode="cover" />
            ) : null}
            {showPreview && overlayImage && (
              <Image
                source={overlayImage}
                style={[
                  styles.overlay,
                  {
                    height: height * 0.5,
                    width: "100%",
                    alignSelf: "center",
                    transform: [
                      { scale: 0.5 }, // Apply the scale transformation
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
  },
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    width: "100%",
    marginVertical: Spacings.sm,
    borderRadius: BorderRadii.md,
  },
  photoContainer: {
    width: "100%",
    position: "relative",
    backgroundColor: "#dedede",
    aspectRatio: 1,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    minHeight: 220,
    aspectRatio: 1,
    marginHorizontal: "auto",
    alignSelf: "center",
    objectFit: "contain",
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    padding: Spacings.md,
    alignItems: "center",
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    opacity: 0.5,
    tintColor: "#fff",
    pointerEvents: "none",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadii.sm,
    borderWidth: 1,
    marginRight: Spacings.sm,
  },
  thumbnailCrop: {
    width: 80,
    height: 80,
    overflow: "hidden",
    borderRadius: BorderRadii.sm,
    borderWidth: 1,
    marginRight: Spacings.sm,
  },
});
