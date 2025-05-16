import { Activity, ActivityDependency } from "@/backend/shared";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ActivityReliesOnEditorProps {
  dependencies?: ActivityDependency[];
  possibleDependencies?: Activity[];
  activities: Activity[];
  onChange: (dependencies: ActivityDependency[]) => void;
}

export const ActivityReliesOnEditor: React.FC<ActivityReliesOnEditorProps> = ({
  dependencies = [],
  possibleDependencies = [],
  activities,
  onChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const borderColor = useThemeColor({}, "border");

  const removeDependency = (index: number) => {
    const newDeps = dependencies.filter((_, i) => i !== index);
    onChange(newDeps.map(({ ...rest }) => rest));
  };

  if (!possibleDependencies.length) {
    return (
      <View style={[styles.container, { borderColor }]}>
        <ThemedText type="label">
          You cannot add dependencies to this item. This is usually if it&apos;s the first activity in a goal.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor }]}>
      {dependencies.map((dep, index) => (
        <ActivityAsDependencyCard
          key={dep.slug}
          activity={dep}
          activities={activities}
          type="remove"
          onPressLabel="Remove"
          onPress={() => removeDependency(index)}
        />
      ))}

      <View style={{ gap: Spacings.sm }}>
        <ThemedText type="label">Does this activity rely on any previous activities to be completed first?</ThemedText>
        <ThemedButton
          title="Add Dependency"
          variant="outline"
          onPress={() => setIsModalVisible(true)}
          style={{ borderColor }}
        />
      </View>

      <DependencyAddModal
        activeDependencies={dependencies}
        possibleDependencies={possibleDependencies}
        activities={activities}
        isVisible={isModalVisible}
        onSelect={(activity) => {
          const newDeps = [...dependencies, activity];
          onChange(newDeps.map(({ ...rest }) => rest));
          setIsModalVisible(false);
        }}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const ActivityAsDependencyCard: React.FC<{
  activity: ActivityDependency;
  activities: Activity[];
  onPressLabel?: string;
  type?: "add" | "remove";
  onPress: () => void;
}> = ({ activity, activities, onPressLabel = "Add", type = "add", onPress }) => {
  const danger = useThemeColor({}, "danger");
  const borderColor = useThemeColor({}, "border");

  const goalActivity = useMemo(() => {
    return activities.find((a) => a.slug === activity.slug);
  }, [activity.slug, activities]);

  const dependsOnText = useMemo(() => {
    if (!goalActivity?.reliesOn || goalActivity?.reliesOn.length === 0) {
      return "";
    }
    return `Depends on: ${goalActivity?.reliesOn
      .map((dep) => {
        const depActivity = activities.find((a) => a.slug === dep.slug);
        return depActivity ? depActivity.name : dep.slug;
      })
      .join(", ")}`;
  }, [goalActivity?.reliesOn, activities]);

  const icon = useMemo(() => {
    if (type === "remove") {
      return "trash";
    }
    return "plus";
  }, [type]);

  return (
    <View style={[styles.dependencyItem, { borderColor }]}>
      <View style={[styles.row, { gap: Spacings.sm, alignItems: "flex-start" }]}>
        <Image
          source={{ uri: goalActivity?.featuredImage }}
          style={{ width: 50, height: 50, borderRadius: BorderRadii.sm }}
          contentFit="cover"
        />

        <View
          style={{
            flex: 1,
            gap: Spacings.sm,
          }}
        >
          <ThemedText type="subtitle">{goalActivity?.name}</ThemedText>
          {dependsOnText && <ThemedText type="label">{dependsOnText}</ThemedText>}
        </View>
      </View>

      <ThemedButton
        icon={icon}
        variant={"ghost"}
        onPress={onPress}
        style={{
          ...styles.actionButton,
          alignSelf: "flex-end",
        }}
        textStyle={{
          color: type === "remove" ? danger : undefined,
        }}
      />
    </View>
  );
};

const DependencyAddModal: React.FC<{
  activeDependencies: ActivityDependency[];
  possibleDependencies: Activity[];
  activities: Activity[];
  isVisible: boolean;
  onSelect: (activity: ActivityDependency) => void;
  onRemove?: (activity: ActivityDependency) => void;
  onClose: () => void;
}> = ({ activeDependencies, possibleDependencies, activities, isVisible, onSelect, onClose, onRemove }) => {
  const insets = useSafeAreaInsets();

  const isAlreadyAdded = (activity: Activity) => {
    return activeDependencies.some((dep) => dep.slug === activity.slug);
  };

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} presentationStyle="formSheet">
      <ThemedView
        style={{
          ...styles.modalContainer,
          padding: Spacings.md,
          gap: Spacings.md,
          paddingTop: insets.top + Spacings.md,
          paddingBottom: insets.bottom + Spacings.md,
        }}
      >
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <ThemedText type="title">Select an activity</ThemedText>
          <ThemedButton variant="ghost" icon="xmark" onPress={onClose} />
        </View>

        <ScrollView>
          <View style={{ gap: Spacings.sm }}>
            {possibleDependencies.map((activity) => (
              <ActivityAsDependencyCard
                key={activity.slug}
                activity={activity}
                activities={activities}
                type={isAlreadyAdded(activity) ? "remove" : "add"}
                onPressLabel={isAlreadyAdded(activity) ? "Remove" : "Add"}
                onPress={() => {
                  if (isAlreadyAdded(activity)) {
                    onRemove?.(activity);
                  } else {
                    onSelect(activity);
                  }
                }}
              />
            ))}

            {possibleDependencies.length === 0 && (
              <ThemedText type="default" style={{ padding: Spacings.sm }}>
                No activities available.
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacings.md,
  },
  dependencyItem: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    gap: Spacings.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  modalContainer: {
    flex: 1,
  },
});
