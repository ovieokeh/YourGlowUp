import { ActivityStep } from "@/backend/shared";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, SafeAreaView, StyleSheet, View } from "react-native";
import { PhotoUpload } from "./PhotoUpload";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedTextInput } from "./ThemedTextInput";
import { ThemedView } from "./ThemedView";
import { VisibleIfEditor } from "./VisibleIfEditor";

interface EditActivityStepProps {
  initialStep: ActivityStep;
  previousSteps?: ActivityStep[];
  onSave: (updatedStep: ActivityStep) => void;
  onRemove?: (stepId: string) => void;
  onCancel?: () => void;
}

export const EditActivityStep: React.FC<EditActivityStepProps> = ({
  initialStep,
  previousSteps,
  onSave,
  onRemove,
  onCancel,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editableStep, setEditableStep] = useState<ActivityStep>(initialStep);
  const danger = useThemeColor({}, "danger");

  useEffect(() => {
    setEditableStep(initialStep);
  }, [initialStep]);

  const handleChange = (field: keyof ActivityStep, value: any) => {
    setEditableStep((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Basic Validation Example
    if (!editableStep.slug.trim()) {
      Alert.alert("Validation Error", "Slug cannot be empty.");
      return;
    }
    if (!editableStep.content.trim()) {
      Alert.alert("Validation Error", "Content cannot be empty.");
      return;
    }
    onSave(editableStep);
  };

  const StepPreview = useMemo(() => {
    return (
      <View>
        <View style={styles.fieldGroup}>
          <ThemedText type="label">{editableStep.content}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedButton
            icon="trash"
            title="Remove"
            variant="ghost"
            onPress={() => {
              Alert.alert("Remove Step", "Are you sure you want to remove this step?", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: () => {
                    if (onRemove) {
                      onRemove(editableStep.id);
                    }
                  },
                },
              ]);
            }}
            textStyle={{ fontSize: 14, color: danger }}
            style={styles.removeButton}
          />
          <ThemedButton
            icon="pencil.and.scribble"
            title="Edit"
            variant="ghost"
            onPress={() => setIsModalVisible(true)}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      </View>
    );
  }, [editableStep.content, danger, editableStep.id, onRemove]);

  return (
    <>
      {/* Step Preview */}
      {StepPreview}

      <Modal visible={isModalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedView style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: Spacings.md,
              }}
            >
              <ThemedText type="title">Edit Activity Step</ThemedText>
              <ThemedButton
                title="Close"
                onPress={() => setIsModalVisible(false)}
                icon="xmark"
                variant="ghost"
                style={{
                  alignSelf: "flex-end",
                  paddingVertical: Spacings.md,
                }}
              />
            </View>

            {/* Step Edit Form */}
            <View style={styles.container}>
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Content:</ThemedText>
                <ThemedTextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editableStep.content}
                  onChangeText={(text) => handleChange("content", text)}
                  placeholder="Enter step content or instructions"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <PhotoUpload
                photoUri={editableStep.instructionMedia?.url ?? ""}
                onPickPhoto={(photo) =>
                  handleChange("instructionMedia", {
                    type: "image",
                    url: photo?.uri,
                  })
                }
              />

              {previousSteps && previousSteps?.length > 0 && (
                <VisibleIfEditor
                  initialDependencies={editableStep.visibleIf || []}
                  possibleDependencies={previousSteps || []}
                  onChange={(deps) => handleChange("visibleIf", deps)}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              {onCancel && <ThemedButton title="Cancel" onPress={onCancel} variant="destructive" />}
              <ThemedButton title="Save Step" onPress={handleSave} />
            </View>
          </ThemedView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.md,
    gap: Spacings.md,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  fieldGroup: {},
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: Spacings.md,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 30, // For scroll view content
  },
  removeButton: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacings.sm,
  },
});
