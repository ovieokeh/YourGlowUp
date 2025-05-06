import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PhotoUpload, PhotoUploadViewProps } from "@/components/PhotoUpload";
import { ThemedText } from "@/components/ThemedText";
import { Spacings } from "@/constants/Theme";

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
  setErrors: React.Dispatch<React.SetStateAction<{ front: boolean; left: boolean; right: boolean }>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onTransformChange: (key: "front" | "left" | "right", transform: any) => void;
}

export default function FaceAnalysisFormView({
  photos,
  errors,
  loading,
  setErrors,
  setPhotos,
  setLoading,
  onTransformChange,
}: Props) {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Upload Your Face Views
      </ThemedText>

      <ThemedText style={styles.tipText}>
        Make sure your face is centered, well-lit, and expressionless in each view.
      </ThemedText>

      <Field
        label="Front View"
        photo={photos.front}
        onPick={(data) => handlePick("front", data)}
        onTransformChange={(t) => handleTransformChange("front", t)}
        error={errors.front}
        loading={loading}
        setLoading={setLoading}
      />

      <Field
        label="Left Side View"
        photo={photos.left}
        onPick={(data) => handlePick("left", data)}
        onTransformChange={(t) => handleTransformChange("left", t)}
        error={errors.left}
        loading={loading}
        setLoading={setLoading}
      />

      <Field
        label="Right Side View"
        photo={photos.right}
        onPick={(data) => handlePick("right", data)}
        onTransformChange={(t) => handleTransformChange("right", t)}
        error={errors.right}
        loading={loading}
        setLoading={setLoading}
      />
    </ScrollView>
  );
}

function Field({
  label,
  photo,
  onPick,
  onTransformChange,
  error,
  loading = false,
  setLoading,
}: {
  label: string;
  photo: { uri: string; transform?: any } | null;
  onPick: PhotoUploadViewProps["onPickPhoto"];
  onTransformChange: (t: any) => void;
  error?: boolean;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <PhotoUpload
        photoUri={photo?.uri || null}
        onPickPhoto={onPick}
        onTransformChange={onTransformChange}
        initialTransform={photo?.transform}
        // showPreview={false}
        loading={loading}
        setLoading={setLoading}
      />
      {error && <ThemedText style={styles.errorText}>This view is required</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacings.sm,
    paddingBottom: Spacings.xl * 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacings.lg,
  },
  tipText: {
    fontSize: 14,
    marginBottom: Spacings.md,
    color: "gray",
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
