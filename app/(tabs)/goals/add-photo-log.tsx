import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";

import { useAddMediaUploadLog } from "@/backend/queries/logs";
import { LogType, MediaUploadLog } from "@/backend/shared";
import { Collapsible } from "@/components/Collapsible";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSearchParams } from "expo-router/build/hooks";
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
  const params = useSearchParams();

  const goalId = params.get("goalId");
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Omit<MediaUploadLog, "id" | "goalId" | "userId" | "createdAt">[]>([
    {
      type: LogType.MEDIA_UPLOAD,
      media: {
        altText: "main",
        url: "",
        type: "image",
      },
      meta: {
        transform: defaultTransform,
      },
    },
  ]);

  const [errors, setErrors] = useState<{
    [key: string]: boolean;
  }>({
    main: false,
  });

  const [isUploading, setIsUploading] = useState(false);

  const borderColor = useThemeColor({}, "border");
  const inputTextColor = useThemeColor({}, "text");

  const savePhotoLogMutation = useAddMediaUploadLog(goalId ?? "0");

  const validate = () => {
    const missing = {
      1: !photos[1],
      2: !photos[2],
      3: !photos[1],
    };
    setErrors(missing);
    return !missing[1] && !missing[2] && !missing[3];
  };

  const resetForm = () => {
    setNotes("");
    setPhotos([
      {
        type: LogType.MEDIA_UPLOAD,
        media: {
          altText: "main",
          url: "",
          type: "image",
        },

        meta: {
          transform: defaultTransform,
        },
      },
    ]);
    setErrors({
      main: false,
    });
    setIsUploading(false);
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
    const uploadPromises = photos.map((photo) => {
      return savePhotoLogMutation.mutateAsync({
        type: LogType.MEDIA_UPLOAD,
        media: photo.media,
        goalId: goalId ?? "0",
        userId: "0",
        meta: {
          transform: photo.meta?.transform,
          notes: notes || undefined,
        },
      });
    });
    await Promise.allSettled(uploadPromises)
      .then(() => {
        resetForm();
        router.replace("/(tabs)/progress?activeTab=Photos");
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

  const onPick = (uri: string, index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = {
        ...newPhotos[index],
        media: {
          ...newPhotos[index].media,
          url: uri,
        },
      };
      return newPhotos;
    });
  };

  const onTransformChange = (transform: any, index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = {
        ...newPhotos[index],
        meta: {
          ...newPhotos[index].meta,
          transform,
        },
      };
      return newPhotos;
    });
  };
  const loading = savePhotoLogMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => {
            return (
              <ThemedButton
                title="Save"
                onPress={handleSubmit}
                variant="solid"
                disabled={isUploading}
                loading={isUploading}
                style={{
                  paddingVertical: Spacings.xs,
                  height: 32,
                }}
              />
            );
          },
        }}
      />

      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={84}
        >
          {photos.map((photo, index) => (
            <>
              <ThemedText style={styles.label}>Photo {index + 1}</ThemedText>
              <ThemedText style={styles.label}>What kind of photo is it?</ThemedText>
              <ThemedTextInput
                style={[styles.inputBox, { borderColor, color: inputTextColor }]}
                value={photo.media.altText}
                onChangeText={(text) => {
                  setPhotos((prev) => {
                    const newPhotos = [...prev];
                    newPhotos[index] = {
                      ...newPhotos[index],
                      media: {
                        ...newPhotos[index].media,
                        altText: text,
                      },
                    };
                    return newPhotos;
                  });
                }}
                placeholder="e.g. Front view"
                placeholderTextColor={inputTextColor}
              />

              <PhotoUpload
                key={index}
                photoUri={photo.media.url || null}
                initialTransform={photo?.meta?.transform}
                loading={loading}
                showPreview
                allowTransform
                onPickPhoto={(picked) => {
                  onPick(picked?.uri ?? "", index);
                  onTransformChange(picked?.transform ?? defaultTransform, index);
                }}
                onTransformChange={(transform) => onTransformChange(transform, index)}
                overlayImage={require("@/assets/images/grid.png")}
                setLoading={setIsUploading}
              />
              {errors[index] && <ThemedText style={styles.errorText}>This view is required</ThemedText>}

              <ThemedText style={styles.label}>Would you like to share anything else about today?</ThemedText>
              <TextInput
                multiline
                numberOfLines={4}
                style={[styles.textArea, { borderColor, color: inputTextColor }]}
                value={photo.meta?.notes || ""}
                onChangeText={(text) => {
                  setPhotos((prev) => {
                    const newPhotos = [...prev];
                    newPhotos[index] = {
                      ...newPhotos[index],
                      meta: {
                        ...newPhotos[index].meta,
                        notes: text,
                      },
                    };
                    return newPhotos;
                  });
                }}
                placeholder="Optional notes..."
                placeholderTextColor={inputTextColor}
              />
            </>
          ))}

          <View style={{ marginVertical: 24 }}>
            <Collapsible title="Tips, Timeline, and What to Avoid">
              {TIPS.map((tip, index) => (
                <ThemedText key={index} style={{ marginBottom: 8 }}>
                  {index + 1}. {tip}
                </ThemedText>
              ))}
            </Collapsible>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacings.lg,
    paddingBottom: Spacings.xl * 3,
    flexGrow: 1,
    flexShrink: 1,
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
  errorText: {
    fontSize: 12,
    marginTop: Spacings.xs,
  },
});
