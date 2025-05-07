import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PhotoUpload, PhotoUploadViewProps } from "@/components/PhotoUpload";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  photos: {
    front: { uri: string; transform?: any } | null;
    left: { uri: string; transform?: any } | null;
    right: { uri: string; transform?: any } | null;
  };
  errors: {
    front: boolean;
    left: boolean;
    right: boolean;
  };
  loading?: boolean;
  setPhotos: React.Dispatch<
    React.SetStateAction<{
      front: { uri: string; transform?: any } | null;
      left: { uri: string; transform?: any } | null;
      right: { uri: string; transform?: any } | null;
    }>
  >;
  showPreview?: boolean;
  allowTransform?: boolean;
  setErrors: React.Dispatch<React.SetStateAction<{ front: boolean; left: boolean; right: boolean }>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onTransformChange: (key: "front" | "left" | "right", transform: any) => void;
}

export default function FaceAnalysisFormView({
  photos,
  errors,
  loading,
  showPreview = false,
  allowTransform = false,
  setErrors,
  setPhotos,
  setLoading,
  onTransformChange,
}: Props) {
  const textColor = useThemeColor({}, "text");
  const gray10 = useThemeColor({}, "gray10");
  const handlePick = async (
    key: "front" | "left" | "right",
    { uri, transform }: PhotoUploadViewProps["onPickPhoto"]["arguments"][0]
  ) => {
    setPhotos((prev) => ({
      ...prev,
      [key]: { uri, transform },
    }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleTransformChange = (key: "front" | "left" | "right", transform: any) => {
    onTransformChange(key, transform);
  };

  const hasAtLeastOnePhoto = useMemo(() => {
    return !!photos.front?.uri || !!photos.left?.uri || !!photos.right?.uri;
  }, [photos]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={[styles.tipText]}>
        Make sure your face is centered, well-lit, and expressionless in each view.
      </ThemedText>

      {hasAtLeastOnePhoto && (
        <View style={{ gap: Spacings.sm, backgroundColor: gray10, padding: Spacings.sm, borderRadius: 6 }}>
          <IconSymbol name="info.circle" size={16} color={textColor} />
          <ThemedText style={[styles.tipText]}>
            Click on the thumbnail to align your face with the overlay for best results.
          </ThemedText>
        </View>
      )}

      <Field
        label="Front View"
        photo={photos.front}
        onPick={(data) => handlePick("front", data)}
        onTransformChange={(t) => handleTransformChange("front", t)}
        error={errors.front}
        loading={loading}
        setLoading={setLoading}
        showPreview={showPreview}
        allowTransform={allowTransform}
        overlay={require("@/assets/images/eyes-overlay.png")}
      />

      <Field
        label="Left Side View"
        photo={photos.left}
        onPick={(data) => handlePick("left", data)}
        onTransformChange={(t) => handleTransformChange("left", t)}
        error={errors.left}
        loading={loading}
        setLoading={setLoading}
        showPreview={showPreview}
        allowTransform={allowTransform}
      />

      <Field
        label="Right Side View"
        photo={photos.right}
        onPick={(data) => handlePick("right", data)}
        onTransformChange={(t) => handleTransformChange("right", t)}
        error={errors.right}
        loading={loading}
        setLoading={setLoading}
        showPreview={showPreview}
        allowTransform={allowTransform}
      />
    </ScrollView>
  );
}

function Field({
  label,
  photo,
  loading = false,
  error,
  showPreview = false,
  allowTransform = false,
  overlay,
  onPick,
  onTransformChange,
  setLoading,
}: {
  label: string;
  photo: { uri: string; transform?: any } | null;
  loading?: boolean;
  error?: boolean;
  showPreview?: boolean;
  allowTransform?: boolean;
  overlay?: number;
  onPick: PhotoUploadViewProps["onPickPhoto"];
  onTransformChange: (t: any) => void;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <PhotoUpload
        photoUri={photo?.uri || null}
        initialTransform={photo?.transform}
        loading={loading}
        showPreview={showPreview}
        allowTransform={allowTransform}
        onPickPhoto={onPick}
        onTransformChange={onTransformChange}
        overlayImage={overlay}
        setLoading={setLoading}
      />
      {error && <ThemedText style={styles.errorText}>This view is required</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacings.lg,
  },
  tipText: {
    fontSize: 16,
    marginBottom: Spacings.md,
  },
  field: {
    marginBottom: Spacings.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacings.sm,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  thumbnail: {
    marginTop: Spacings.xs,
    width: 60,
    height: 60,
    borderRadius: 6,
  },
});
