import { useAddStepLog } from "@/backend/queries/logs";
import { ActivityStep, LogType } from "@/backend/shared";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { useCallback, useMemo } from "react";
import { Modal, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioPlayer } from "./AudioPlayer";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { VideoPreviewPlayer } from "./VideoPreviewPlayer";

interface StepModalProps {
  isVisible: boolean;
  step: ActivityStep | null;
  index: number;
  totalSteps: number;
  activityId: string;
  goalId: string;
  handleNext: () => void;
  handlePrevious: () => void;
  setIsVisible: (isVisible: boolean) => void;
}
export const StepModal = ({
  isVisible,
  step,
  index,
  totalSteps,
  activityId,
  goalId,
  handlePrevious,
  handleNext,
  setIsVisible,
}: StepModalProps) => {
  const { user } = useAppContext();
  const muted = useThemeColor({}, "muted");
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { mutate } = useAddStepLog(user?.id);

  const logDuration = useCallback(
    (durationInSeconds: number) => {
      if (!step?.id || !user?.id) {
        return;
      }
      mutate({
        userId: user.id,
        goalId,
        activityId,
        type: LogType.STEP,
        stepId: step.id,
        stepIndex: index,
        durationInSeconds,
        createdAt: new Date().toISOString(),
      });
    },
    [mutate, step?.id, user?.id, index, goalId, activityId]
  );
  const handleComplete = useCallback(
    (durationInSeconds: number) => {
      if (!step?.id) {
        return;
      }
      logDuration(durationInSeconds);
      handleNext();
    },
    [logDuration, step?.id, handleNext]
  );

  const renderStepContent = useMemo(() => {
    if (!step) {
      return null;
    }
    if (step.instructionMedia?.type === "video") {
      return (
        <VideoPreviewPlayer
          uri={step.instructionMedia?.url}
          width="100%"
          height={dimensions.height * 0.4}
          onComplete={handleComplete}
          onPause={logDuration}
        />
      );
    }

    if (step.instructionMedia?.type === "image") {
      return (
        <Image
          source={{ uri: step.instructionMedia?.url }}
          style={{
            width: "100%",
            height: dimensions.height * 0.4,
          }}
          contentFit="cover"
          contentPosition="top"
        />
      );
    }

    if (step.instructionMedia?.type === "audio") {
      return <AudioPlayer uri={step.instructionMedia.url} onComplete={handleComplete} onPause={logDuration} autoPlay />;
    }
    if (step.instructionMedia?.type === "document") {
      return <IconSymbol name="document" size={16} color={muted} style={{ marginBottom: Spacings.sm }} />;
    }
    return null;
  }, [step, muted, dimensions, logDuration, handleComplete]);

  if (!step) {
    return null;
  }

  const hasPrevious = index > 0;
  const hasNext = index < totalSteps - 1;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView
        style={{
          flex: 1,
          padding: Spacings.md,
          paddingTop: Spacings.md,
          paddingBottom: insets.bottom,
          gap: Spacings.xxl,
        }}
      >
        <ThemedButton
          variant="ghost"
          icon="xmark"
          onPress={() => setIsVisible(false)}
          style={{
            marginLeft: "auto",
          }}
        />

        <ThemedText type="subtitle">{step.content}</ThemedText>

        {renderStepContent}

        <View style={{ gap: Spacings.md, marginTop: "auto" }}>
          <View style={{ flexDirection: "row", gap: Spacings.sm, marginHorizontal: "auto", marginTop: "auto" }}>
            <ThemedText>
              {index + 1} of {totalSteps}
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", gap: Spacings.sm, justifyContent: "space-between" }}>
            {hasPrevious && <ThemedButton title="Previous" onPress={handlePrevious} variant="outline" />}
            {hasNext ? (
              <ThemedButton title="Next" onPress={handleNext} variant="outline" style={{ marginLeft: "auto" }} />
            ) : (
              <ThemedButton title="Complete Activity" onPress={handleNext} variant="solid" />
            )}
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
};
