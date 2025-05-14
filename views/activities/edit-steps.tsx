import { ActivityCreateInput, ActivityStep } from "@/backend/shared";
import { EditActivityStep } from "@/components/EditActivityStep";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, View } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

interface ActivityEditStepsProps {
  steps?: ActivityStep[];
  onChange: (key: keyof ActivityCreateInput, value: any) => void;
}
export const ActivityEditSteps: React.FC<ActivityEditStepsProps> = ({ steps, onChange }) => {
  const borderColor = useThemeColor({}, "border");

  const removeStep = (index: number) => {
    const updatedSteps = (steps || []).filter((_, i) => i !== index);
    onChange("steps", updatedSteps);
  };
  const addStep = () => {
    const newStep: ActivityStep = {
      id: uuidv4(),
      slug: `step-${uuidv4().substring(0, 8)}`,
      content: "",

      instructionMedia: { type: "image", url: "" },
    };
    const updatedSteps = [...(steps || []), newStep];
    onChange("steps", updatedSteps);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={{ opacity: 0.5 }}>
        Break down the activity into smaller steps to make it easier to complete.
      </ThemedText>
      {(steps ?? [])?.map((step, index) => (
        <View
          key={`step-${index}`}
          style={{
            gap: Spacings.md,
            borderWidth: 1,
            borderColor,
            padding: Spacings.sm,
            borderRadius: BorderRadii.sm,
          }}
        >
          <EditActivityStep
            initialStep={step}
            onSave={(updatedStep) => {
              const finalSteps = [...(steps || [])];
              finalSteps[index] = updatedStep;
              onChange("steps", finalSteps);
            }}
            onRemove={() => removeStep(index)}
            previousSteps={steps?.slice(0, index) ?? []}
          />
        </View>
      ))}
      <ThemedButton
        title="Add Step"
        onPress={addStep}
        variant="solid"
        icon="plus"
        style={{
          bottom: 0,
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacings.xl,
  },
});
