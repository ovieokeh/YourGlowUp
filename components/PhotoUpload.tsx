import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { Image } from "expo-image";
import { ThemedButton } from "./ThemedButton";
import { ThemedView } from "./ThemedView";

export interface PhotoUploadViewProps {
  photoUri: string | null;
  initialTransform?: { scale: number; x: number; y: number };
  overlayImage?: number;
  loading?: boolean;
  showPreview?: boolean;
  previewType?: "horizontal" | "vertical";
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
  previewType = "horizontal",
  showPreview = false,
  allowTransform = false,
  loading,
  setLoading: setExternalLoading,
  onPickPhoto,
  onTransformChange,
}: PhotoUploadViewProps) {
  const dimensions = useWindowDimensions();
  const { height: windowHeight, width: windowWidth } = dimensions;
  const borderColor = useThemeColor({}, "border");
  const background = useThemeColor({}, "background");
  const gray10 = useThemeColor({}, "gray10");

  const [modalVisible, setModalVisible] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = loading ?? internalLoading;
  const setLoading = setExternalLoading ?? setInternalLoading;

  const scale = useSharedValue(initialTransform?.scale || 1);
  const translationX = useSharedValue(initialTransform?.x || 0);
  const translationY = useSharedValue(initialTransform?.y || 0);

  const prevScale = useSharedValue(initialTransform?.scale || 1);
  const prevTranslationX = useSharedValue(initialTransform?.x || 0);
  const prevTranslationY = useSharedValue(initialTransform?.y || 0);

  const originalPhotoUri = useRef<string | null>(null);

  useEffect(() => {
    if (initialTransform) {
      scale.value = withTiming(initialTransform.scale);
      translationX.value = withTiming(initialTransform.x);
      translationY.value = withTiming(initialTransform.y);
      prevScale.value = initialTransform.scale;
      prevTranslationX.value = initialTransform.x;
      prevTranslationY.value = initialTransform.y;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTransform]);

  const handleTransformUpdate = useCallback(
    (s: number, x: number, y: number) => {
      onTransformChange?.({ scale: s, x, y });
    },
    [onTransformChange]
  );

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      prevScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = prevScale.value * e.scale;
      scale.value = Math.min(Math.max(newScale, 1), 3);
    })
    .onEnd(() => {
      runOnJS(handleTransformUpdate)(scale.value, translationX.value, translationY.value);
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((e) => {
      translationX.value = prevTranslationX.value + e.translationX;
      translationY.value = prevTranslationY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(handleTransformUpdate)(scale.value, translationX.value, translationY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }, { translateY: translationY.value }, { scale: scale.value }],
  }));

  const uploadImageToSupabase = useCallback(
    async ({
      name,
      extension,
      base64,
    }: {
      name: string;
      extension: string;
      base64: string;
    }): Promise<string | null> => {
      setLoading(true);
      try {
        const cleanedName = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const filePath = `public/${Date.now()}_${cleanedName}`;

        const buffer = decode(base64);
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
          contentType: `image/${extension}`,
          cacheControl: "3600",
          upsert: false,
        });

        if (error) {
          console.error("Supabase upload error:", error);
          Toast.show({ type: "error", text1: "Upload Failed", text2: error.message, position: "bottom" });
          return null;
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        if (!publicUrlData?.publicUrl) {
          Toast.show({ type: "error", text1: "Upload Failed", text2: "Could not get public URL.", position: "bottom" });
          return null;
        }
        return publicUrlData.publicUrl;
      } catch (e: any) {
        console.error("Upload exception:", e);
        Toast.show({ type: "error", text1: "Upload Error", text2: e.message || String(e), position: "bottom" });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const handlePickPhoto = useCallback(
    async (type: "camera" | "gallery") => {
      let result: ImagePicker.ImagePickerResult | null = null;
      setLoading(true);

      try {
        if (type === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") throw new Error("Camera access denied. Please grant permission in settings.");
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images", "videos"],
            quality: 0.8,
            base64: true,
            allowsEditing: false,
          });
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") throw new Error("Gallery access denied. Please grant permission in settings.");
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            quality: 0.7,
            base64: true,
            allowsEditing: false,
          });
        }

        if (!result || result.canceled || !result.assets?.length || !result.assets[0].uri) {
          if (!result?.canceled) {
            Toast.show({ type: "info", text1: "Image selection cancelled or failed.", position: "bottom" });
          }
          setLoading(false);
          return;
        }
        const asset = result.assets[0];

        if (!asset.base64) {
          throw new Error("Failed to get base64 data from image.");
        }

        const extension = asset.uri.split(".").pop() || "jpg";
        const fileName = asset.fileName || `original_${Date.now()}.${extension}`;
        const localPath = `${FileSystem.cacheDirectory}${fileName}`;

        if (asset.uri.startsWith("file://")) {
          await FileSystem.copyAsync({ from: asset.uri, to: localPath });
        } else {
          await FileSystem.writeAsStringAsync(localPath, asset.base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        originalPhotoUri.current = localPath;

        const publicUrl = await uploadImageToSupabase({
          name: fileName,
          base64: asset.base64,
          extension: extension,
        });

        if (publicUrl) {
          onPickPhoto({ uri: publicUrl, transform: { scale: 1, x: 0, y: 0 } });

          scale.value = 1;
          translationX.value = 0;
          translationY.value = 0;
          prevScale.value = 1;
          prevTranslationX.value = 0;
          prevTranslationY.value = 0;
          runOnJS(handleTransformUpdate)(1, 0, 0);
        }
      } catch (err: any) {
        console.error("Pick photo error:", err);
        Toast.show({ type: "error", text1: "Image Error", text2: err.message || String(err), position: "bottom" });
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      uploadImageToSupabase,
      onPickPhoto,
      scale,
      translationX,
      translationY,
      prevScale,
      prevTranslationX,
      prevTranslationY,
      handleTransformUpdate,
    ]
  );

  const thumbnailAnimatedStyle = useAnimatedStyle(() => {
    const thumbSize = 58;

    const panMapFactor = thumbSize / windowWidth;

    return {
      width: thumbSize * scale.value,
      height: thumbSize * scale.value,
      position: "absolute",

      left: (thumbSize * (1 - scale.value)) / 2 - translationX.value * panMapFactor,
      top: (thumbSize * (1 - scale.value)) / 2 - translationY.value * panMapFactor,
    };
  });

  const actions = useMemo(
    () => (
      <View
        style={[
          styles.row,
          {
            flexDirection: previewType === "horizontal" ? "row" : "column",
          },
        ]}
      >
        {photoUri && showPreview && (
          <Pressable onPress={() => allowTransform && setModalVisible(true)}>
            <View
              style={[
                styles.thumbnailCrop,
                {
                  width: previewType === "horizontal" ? 58 : windowWidth,
                  height: previewType === "horizontal" ? 58 : windowHeight * 0.25,
                  marginRight: previewType === "horizontal" ? Spacings.sm : 0,
                  borderRadius: previewType === "horizontal" ? BorderRadii.sm : 0,
                  borderColor,
                  backgroundColor: gray10,
                },
              ]}
            >
              <Animated.Image
                source={{ uri: photoUri }}
                style={[
                  allowTransform ? [styles.thumbnailImageBase, thumbnailAnimatedStyle] : styles.thumbnailImageBase,
                ]}
                resizeMode="cover"
              />
            </View>
          </Pressable>
        )}

        <View
          style={{
            flexDirection: "row",
            gap: Spacings.sm,
          }}
        >
          <ThemedButton
            title="Camera"
            variant="outline"
            onPress={() => handlePickPhoto("camera")}
            icon="camera"
            disabled={isLoading}
          />
          <ThemedButton
            title="Gallery"
            variant="outline"
            onPress={() => handlePickPhoto("gallery")}
            icon="photo"
            disabled={isLoading}
          />
        </View>
      </View>
    ),
    [
      borderColor,
      isLoading,
      photoUri,
      showPreview,
      allowTransform,
      handlePickPhoto,
      thumbnailAnimatedStyle,
      previewType,
      windowHeight,
      windowWidth,
      gray10,
    ]
  );

  const modalImageHeight = windowHeight * 0.5;

  return (
    <>
      {actions}
      {/* The SafeAreaView below was mostly empty and for the modal context, let's simplify */}
      {/* If you need a persistent preview area outside the modal, it would go here. */}
      {/* For now, modal is the primary interaction point after thumbnail. */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={{ flex: 1, padding: Spacings.md, gap: Spacings.sm, backgroundColor: background }}>
          <View
            style={[
              styles.row,
              {
                justifyContent: "space-between",
              },
            ]}
          >
            <ThemedButton
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="ghost"
              icon="xmark.circle"
              iconPlacement="left"
              disabled={isLoading}
            />
            <ThemedButton
              title="Close & Apply"
              onPress={async () => {
                //
                setModalVisible(false);
              }}
              variant="solid"
              icon="checkmark.circle"
              iconPlacement="left"
              disabled={isLoading}
            />
          </View>
          <ThemedText style={{ textAlign: "center", marginBottom: Spacings.sm }}>
            {allowTransform ? "Pinch to zoom, drag to pan. Press 'Close & Apply' to save." : "Review your photo."}
          </ThemedText>
          <View style={[styles.photoContainer, { height: modalImageHeight, backgroundColor: "#333" }]}>
            {showPreview && photoUri ? (
              allowTransform ? (
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                    <Animated.Image
                      source={{ uri: originalPhotoUri.current || photoUri }}
                      style={[
                        styles.photo,
                        animatedStyle,
                        {
                          width: "100%",
                          height: "100%",
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </GestureDetector>
                </GestureHandlerRootView>
              ) : (
                <Image
                  source={{ uri: photoUri }}
                  style={[styles.photo, { width: "100%", height: "100%" }]}
                  contentFit="contain"
                />
              )
            ) : (
              <View style={styles.emptyPhotoContainer}>
                <ThemedText>No photo selected.</ThemedText>
              </View>
            )}
            {showPreview && overlayImage && (
              <Image
                source={overlayImage}
                style={[styles.overlay, { width: "100%", height: "100%" }]}
                contentFit="contain"
              />
            )}
          </View>
        </ThemedView>
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

  photoContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadii.sm,
  },
  emptyPhotoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  photo: {},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.5,

    pointerEvents: "none",
  },
  thumbnailCrop: {
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  thumbnailImageBase: {
    width: "100%",
    height: "100%",
  },
});
