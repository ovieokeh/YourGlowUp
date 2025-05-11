import { invariant } from "es-toolkit";
import { Link, router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { useGetActivityById, useUpdateActivity } from "@/backend/queries/activities";
import { GoalActivity, NotificationRecurrence } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";

export default function EditGoalActivityScreen() {
  const searchParams = useSearchParams();
  const id = searchParams.get("activityId") || "";
  const goalId = searchParams.get("goalId") || "";
  invariant(id, "id is required");
  invariant(goalId, "goalId is required");

  const gray10 = useThemeColor({}, "gray10");

  const [activityForm, setActivityForm] = useState<Omit<GoalActivity, "id">>();

  const activityQuery = useGetActivityById(id);
  const activity = useMemo(() => {
    return activityQuery.data;
  }, [activityQuery.data]);

  const updateItemMutation = useUpdateActivity(id);

  useEffect(() => {
    if (activity) {
      setActivityForm(activity);
    }
  }, [activity]);

  if (activityQuery.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!activity) {
    return (
      <>
        <Stack.Screen options={{ title: "Oops!" }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">This screen doesn&apos;t exist.</ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link">Go to home screen!</ThemedText>
          </Link>
        </ThemedView>
      </>
    );
  }

  const onChange = (key: keyof GoalActivity, value: any) => {
    setActivityForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const updateStep = (index: number, text: string) => {
    const steps = activityForm?.steps || [];
    steps[index] = { ...steps[index], id: text };
    onChange("steps", steps);
  };
  const removeStep = (index: number) => {
    const steps = activityForm?.steps || [];
    steps.splice(index, 1);
    onChange("steps", steps);
  };
  const addStep = () => {
    const steps = activityForm?.steps || [];
    steps.push({
      id: uuidv4(),
      slug: "random-slug",
      content: "",
      instructionMedia: {
        type: "image",
        url: "",
      },
    });
    onChange("steps", steps);
  };
  const updateTime = (index: number, time: string) => {
    const scheduledTimes = activityForm?.scheduledTimes || [];
    scheduledTimes[index] = time;
    onChange("scheduledTimes", scheduledTimes);
  };
  const removeTime = (index: number) => {
    const scheduledTimes = activityForm?.scheduledTimes || [];
    scheduledTimes.splice(index, 1);
    onChange("scheduledTimes", scheduledTimes);
  };
  const addTime = () => {
    const scheduledTimes = activityForm?.scheduledTimes || [];
    scheduledTimes.push("10:00");
    onChange("scheduledTimes", scheduledTimes);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: `Edit`,
          headerRight: () => {
            return (
              <ThemedButton
                title="Save"
                onPress={() => {
                  if (!activityForm) return;
                  if (activityForm.recurrence === NotificationRecurrence.WEEKLY) {
                    const day = activityForm.scheduledTimes?.[0]?.split("-")[0];
                    if (!day || day === "") {
                      Toast.show({
                        type: "error",
                        text1: "Please select a day for weekly notifications",
                        position: "bottom",
                      });
                      return;
                    }
                  }
                  updateItemMutation
                    .mutateAsync({
                      ...activityForm,
                      id: activity.id,
                    } as GoalActivity)
                    .then(() => {
                      Toast.show({
                        type: "success",
                        text1: `${activityForm.name} updated`,
                        position: "bottom",
                      });
                      router.back();
                    });
                }}
              />
            );
          },
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <ThemedTextInput
          label="Name"
          value={activityForm?.name ?? ""}
          onChangeText={(text) => onChange("name", text)}
          placeholder="Enter name"
        />

        <ThemedTextInput
          label="Description"
          value={activityForm?.description ?? ""}
          onChangeText={(text) => onChange("description", text)}
          placeholder="Enter description"
        />

        <View style={{ gap: Spacings.sm }}>
          <ThemedText type="subtitle">Instructions</ThemedText>
          <View style={{ gap: Spacings.xs }}>
            {(activityForm?.steps || []).map((step, index) => (
              <View key={`step-${index}`} style={styles.row}>
                <ThemedTextInput
                  value={step.id}
                  onChangeText={(text) => updateStep(index, text)}
                  containerStyle={{ flex: 1, maxWidth: "90%" }}
                />
                <TouchableOpacity onPress={() => removeStep(index)}>
                  <Ionicons name="remove" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <ThemedButton title="Add Step" onPress={addStep} variant="outline" icon="plus" />
        </View>

        <View style={{ gap: Spacings.xs }}>
          <ThemedText type="subtitle">Notification Times</ThemedText>
          <View style={{ gap: Spacings.xs }}>
            <ThemedPicker
              placeholder="Select Notification Type"
              items={Object.values(NotificationRecurrence).map((type) => ({
                label: type,
                value: type,
              }))}
              selectedValue={activityForm?.recurrence}
              onValueChange={(val) => {
                onChange("recurrence", val);
              }}
            />
            {(activityForm?.scheduledTimes || []).map((time, index) => (
              <View
                key={`time-${index}`}
                style={{
                  gap: Spacings.sm,
                  padding: Spacings.sm,
                  backgroundColor: gray10,
                }}
              >
                <NotificationTimePicker
                  value={time ?? "10:00"}
                  type={activityForm?.recurrence ?? NotificationRecurrence.DAILY}
                  onChange={(val) => updateTime(index, val)}
                />
                <ThemedButton
                  variant="ghost"
                  icon="trash"
                  title="Remove"
                  onPress={() => {
                    removeTime(index);
                  }}
                  style={
                    {
                      // als
                    }
                  }
                />
              </View>
            ))}
          </View>
          <ThemedButton title="Add Notification Time" onPress={addTime} variant="outline" icon="plus" />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

export const NotificationTimePicker = ({
  value = "10:00",
  type,
  onChange,
}: {
  value: string;
  type: NotificationRecurrence | undefined;
  onChange: (value: string) => void;
}) => {
  const borderColor = useThemeColor({}, "border");
  const [selectedTime, setSelectedTime] = useState(() => {
    if (type === NotificationRecurrence.WEEKLY) {
      return value.split("-")[1];
    }
    return value;
  }); // either time like "10:00" or "monday-10:00"
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (type === NotificationRecurrence.WEEKLY) {
      return value.split("-")[0];
    }
    return "monday";
  });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hourOptions = new Array(24).fill(0).map((_, i) => String(i).padStart(2, "0"));
  const minuteOptions = new Array(12).fill(0).map((_, i) => String(i * 5).padStart(2, "0"));
  const dayOptions = days.map((day) => ({ label: day, value: day }));
  const time = useMemo(() => {
    if (type === NotificationRecurrence.DAILY) {
      return selectedTime;
    }
    return selectedTime ? `${selectedDay}-${selectedTime}` : null;
  }, [selectedTime, selectedDay, type]);
  useEffect(() => {
    if (time) {
      onChange(time);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return (
    <View
      style={{
        gap: Spacings.sm,
        padding: Spacings.sm,
        borderWidth: 1,
        borderRadius: BorderRadii.sm,
        borderColor: borderColor,
      }}
    >
      {type === NotificationRecurrence.WEEKLY && (
        <ThemedPicker
          items={dayOptions}
          selectedValue={selectedDay}
          onValueChange={(val) => setSelectedDay(val)}
          placeholder="Select Day"
        />
      )}

      <View style={{ flexDirection: "row", gap: Spacings.sm }}>
        <ThemedPicker
          items={hourOptions.map((hour) => ({ label: hour, value: hour }))}
          selectedValue={selectedTime.split(":")[0]}
          onValueChange={(val) => setSelectedTime(`${val}:${selectedTime.split(":")[1]}`)}
          style={{ flex: 1, maxWidth: "90%" }}
        />
        <ThemedPicker
          items={minuteOptions.map((minute) => ({ label: minute, value: minute }))}
          selectedValue={selectedTime.split(":")[1]}
          onValueChange={(val) => setSelectedTime(`${selectedTime.split(":")[0]}:${val}`)}
          style={{ flex: 1, maxWidth: "90%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacings.md,
    paddingBottom: Spacings.xl * 2,
    gap: Spacings.xl,
  },
  scrollView: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.sm,
  },
  link: {
    // marginTop: Spacings.md,
  },
});
