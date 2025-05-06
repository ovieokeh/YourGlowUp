import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface PhotoUploadViewProps {
  photoUri: string | null;
  onPickPhoto: (photo: { uri: string; transform: { scale: number; x: number; y: number } } | null) => void;
  onTransformChange?: (transform: { scale: number; x: number; y: number }) => void;
  initialTransform?: { scale: number; x: number; y: number };
  overlayImage?: number; // accepts require("@/assets/...") style images
}

export function PhotoUpload({
  photoUri,
  onPickPhoto,
  onTransformChange,
  initialTransform,
  overlayImage,
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
    .onEnd((e) => {
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

  const handlePickPhoto = useCallback(
    async (type: "camera" | "gallery") => {
      switch (type) {
        case "camera": {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission required", "Camera access is needed to take a photo.");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            quality: 0.5,
            base64: false,
          });

          if (!result.canceled && result.assets.length > 0) {
            onPickPhoto({
              uri: result.assets[0].uri,
              transform: {
                scale: 1,
                x: 0,
                y: 0,
              },
            });
          }
          break;
        }
        case "gallery":
          {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission required", "Gallery access is needed to upload your photo.");
              return;
            }
            await ImagePicker.launchImageLibraryAsync({
              quality: 0.5,
              base64: false,
            })
              .then((res) => {
                if (!res.canceled && res.assets.length > 0) {
                  const asset = res.assets[0];
                  const uri = asset.uri;
                  const transform = {
                    scale: 1,
                    x: 0,
                    y: 0,
                  };
                  onPickPhoto({
                    uri,
                    transform,
                  });
                  return res;
                }
              })
              .catch((error) => {
                console.error("Error picking image:", error);
                Alert.alert("Error", "An error occurred while picking the image.");
              });
          }
          break;
        default:
          break;
      }
    },
    [onPickPhoto]
  );

  const actions = useMemo(
    () => (
      <View style={{ flexDirection: "row", gap: Spacings.sm }}>
        <Pressable onPress={() => handlePickPhoto("camera")} style={[styles.photoButton, { borderColor }]}>
          <ThemedText style={{ color: inputTextColor }}>Camera</ThemedText>
        </Pressable>
        <Pressable onPress={() => handlePickPhoto("gallery")} style={[styles.photoButton, { borderColor }]}>
          <ThemedText style={{ color: inputTextColor }}>Gallery</ThemedText>
        </Pressable>
      </View>
    ),
    [borderColor, inputTextColor, handlePickPhoto]
  );

  if (!photoUri) {
    return actions;
  }

  return (
    <>
      <View style={styles.container}>
        <GestureHandlerRootView>
          <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
            <Animated.Image source={{ uri: photoUri }} style={[styles.photo, animatedStyle]} resizeMode="cover" />
          </GestureDetector>
          <Image
            source={overlayImage || require("@/assets/images/eyes-overlay.png")}
            style={styles.overlay}
            resizeMode="contain"
          />
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
  },
  photo: {
    width: "100%",
    height: 400,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: "100%",
    zIndex: 100,
    opacity: 0.5,
    tintColor: "#fff",
    pointerEvents: "none",
  },
});
