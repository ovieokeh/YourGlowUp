import { ActivityStep } from "@/backend/shared";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton } from "./ThemedButton";

interface StepCardProps {
  step: ActivityStep;
  disabled?: boolean;
  handlePress: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, disabled = false, handlePress }) => {
  // TODO: Implement isCompleted by checking today logs for current step
  const muted = useThemeColor({}, "muted");
  const bg = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");

  const instructionMedia = useMemo(() => step.instructionMedia, [step.instructionMedia]);
  const isPhotoInstruction = useMemo(() => instructionMedia?.type === "image", [instructionMedia]);
  const isVideoInstruction = useMemo(() => instructionMedia?.type === "video", [instructionMedia]);
  const isAudioInstruction = useMemo(() => instructionMedia?.type === "audio", [instructionMedia]);
  const isDocumentInstruction = useMemo(() => instructionMedia?.type === "document", [instructionMedia]);

  const onPress = () => {
    if (disabled) return;
    handlePress();
  };

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
      <View style={{ position: "absolute", top: Spacings.xs, right: Spacings.md }}>
        {/* Image */}
        {step.instructionMedia ? (
          <IconSymbol
            name={
              isPhotoInstruction
                ? "photo"
                : isVideoInstruction
                ? "video"
                : isAudioInstruction
                ? "headphones"
                : isDocumentInstruction
                ? "document"
                : "questionmark.circle"
            }
            size={16}
            color={muted}
            style={{ marginBottom: Spacings.sm }}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <ThemedText
          type="default"
          // numberOfLines={2}
          style={{
            maxWidth: "90%",
          }}
        >
          {step.content}
        </ThemedText>

        {step.instructionMedia ? (
          <ThemedButton
            title={
              isPhotoInstruction
                ? "View Photo"
                : isVideoInstruction
                ? "View Video"
                : isAudioInstruction
                ? "Listen"
                : isDocumentInstruction
                ? "View Document"
                : "Unknown"
            }
            icon={
              isPhotoInstruction
                ? "photo"
                : isVideoInstruction
                ? "video"
                : isAudioInstruction
                ? "headphones"
                : isDocumentInstruction
                ? "document"
                : "questionmark.circle"
            }
            onPress={onPress}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    overflow: "hidden",
    gap: Spacings.sm,
    width: "100%",
  },
  infoButton: {
    position: "absolute",
    top: Spacings.xs,
    right: Spacings.xs,
    paddingHorizontal: 0,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  content: {
    flexDirection: "column",
    gap: Spacings.xs,
    padding: Spacings.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  progressText: {
    minWidth: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
    marginTop: Spacings.sm,
  },
});
