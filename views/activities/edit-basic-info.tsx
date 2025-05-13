import { ActivityCreateInput } from "@/backend/shared";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { Spacings } from "@/constants/Theme";
import { StyleSheet, View } from "react-native";

interface ActivityEditBasicInfoProps {
  name?: string;
  description?: string;
  featuredImage?: string;
  onChange: (key: keyof ActivityCreateInput, value: any) => void;
}
export const ActivityEditBasicInfo: React.FC<ActivityEditBasicInfoProps> = ({
  name,
  description,
  featuredImage,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.section, { paddingVertical: Spacings.md }]}>
        <ThemedText>
          Upload a photo that represents this activity. This will be used as the cover image for this activity.
        </ThemedText>

        <PhotoUpload
          photoUri={featuredImage ?? ""}
          onPickPhoto={(url) => {
            onChange("featuredImage", url);
          }}
          allowTransform={false}
          previewType="vertical"
          showPreview={false}
        />
      </View>
      <View style={styles.section}>
        <ThemedTextInput
          label="What is the name of this activity?"
          value={name}
          onChangeText={(text) => onChange("name", text)}
          placeholder="Enter name"
        />
        <ThemedTextInput
          label="Describe this activity"
          value={description}
          onChangeText={(text) => onChange("description", text)}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
          style={{
            height: 80,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacings.xl,
  },
  section: {
    gap: Spacings.xl,
  },
});
