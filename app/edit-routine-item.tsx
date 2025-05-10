import { invariant } from "es-toolkit";
import { Link, router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { NotificationType } from "@/constants/Exercises";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetRoutineItem, useUpdateRoutineItem } from "@/queries/routines";
import { RoutineItem } from "@/queries/routines/shared";
import { Ionicons } from "@expo/vector-icons";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";

export default function EditRoutineItemScreen() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const routineId = searchParams.get("routineId") || "";
  invariant(id, "id is required");
  invariant(routineId, "routineId is required");

  const gray10 = useThemeColor({}, "gray10");

  const [itemState, setItemState] = useState<Partial<RoutineItem>>({
    name: "",
    area: "",
    description: "",
    instructions: [],
    notificationType: NotificationType.DAILY,
    notificationTimes: [],
  });

  const itemQuery = useGetRoutineItem(id);
  const item = useMemo(() => {
    return itemQuery.data;
  }, [itemQuery.data]);

  const updateItemMutation = useUpdateRoutineItem(id);

  useEffect(() => {
    const item = itemQuery.data;
    if (item) {
      setItemState({
        name: item.name,
        area: item.area,
        description: item.description,
        instructions: item.instructions || [],
        notificationType: item.notificationType || NotificationType.DAILY,
        notificationTimes: item.notificationTimes || [],
      });
    }
  }, [itemQuery.data]);

  const updateInstruction = (index: number, text: string) => {
    const updated = [...(itemState.instructions || [])];
    updated[index] = text;
    setItemState({ ...itemState, instructions: updated });
  };

  const removeInstruction = (index: number) => {
    const updated = [...(itemState.instructions || [])];
    updated.splice(index, 1);
    setItemState({ ...itemState, instructions: updated });
  };

  const addInstruction = () => {
    setItemState({
      ...itemState,
      instructions: [...(itemState.instructions || []), ""],
    });
  };

  const updateTime = (index: number, value: string) => {
    const updated = [...(itemState.notificationTimes || [])];
    updated[index] = value;
    setItemState({ ...itemState, notificationTimes: updated });
  };

  const removeTime = (index: number) => {
    const updated = [...(itemState.notificationTimes || [])];
    updated.splice(index, 1);
    setItemState({ ...itemState, notificationTimes: updated });
  };

  const addTime = () => {
    setItemState({
      ...itemState,
      notificationTimes: [
        ...(itemState.notificationTimes || []),
        itemState.notificationType === NotificationType.CUSTOM ? "monday-10:00" : "10:00",
      ],
    });
  };

  if (itemQuery.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
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
                  if (itemState.notificationType === NotificationType.CUSTOM) {
                    const day = itemState.notificationTimes?.[0]?.split("-")[0];
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
                      ...itemState,
                      id: item.id,
                    })
                    .then(() => {
                      Toast.show({
                        type: "success",
                        text1: `${itemState.name} updated`,
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
          value={itemState.name}
          onChangeText={(text) => setItemState({ ...itemState, name: text })}
          placeholder="Enter name"
        />

        <ThemedTextInput
          label="Area"
          value={itemState.area}
          onChangeText={(text) => setItemState({ ...itemState, area: text })}
          placeholder="Enter area"
        />

        <ThemedTextInput
          label="Description"
          value={itemState.description}
          onChangeText={(text) => setItemState({ ...itemState, description: text })}
          placeholder="Enter description"
        />

        <View style={{ gap: Spacings.sm }}>
          <ThemedText type="subtitle">Instructions</ThemedText>
          <View style={{ gap: Spacings.xs }}>
            {(itemState.instructions || []).map((instruction, index) => (
              <View key={`instruction-${index}`} style={styles.row}>
                <ThemedTextInput
                  value={instruction}
                  onChangeText={(text) => updateInstruction(index, text)}
                  containerStyle={{ flex: 1, maxWidth: "90%" }}
                />
                <TouchableOpacity onPress={() => removeInstruction(index)}>
                  <Ionicons name="remove" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <ThemedButton title="Add Instruction" onPress={addInstruction} variant="outline" icon="plus" />
        </View>

        <View style={{ gap: Spacings.xs }}>
          <ThemedText type="subtitle">Notification Times</ThemedText>
          <View style={{ gap: Spacings.xs }}>
            <ThemedPicker
              placeholder="Select Notification Type"
              items={Object.values(NotificationType).map((type) => ({
                label: type,
                value: type,
              }))}
              selectedValue={itemState.notificationType}
              onValueChange={(val) => {
                setItemState({ ...itemState, notificationType: val });
              }}
            />
            {(itemState.notificationTimes || []).map((time, index) => (
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
                  type={itemState.notificationType}
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
  type: NotificationType | undefined;
  onChange: (value: string) => void;
}) => {
  const borderColor = useThemeColor({}, "border");
  const [selectedTime, setSelectedTime] = useState(() => {
    if (type === NotificationType.CUSTOM) {
      return value.split("-")[1];
    }
    return value;
  }); // either time like "10:00" or "monday-10:00"
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (type === NotificationType.CUSTOM) {
      return value.split("-")[0];
    }
    return "monday";
  });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hourOptions = new Array(24).fill(0).map((_, i) => String(i).padStart(2, "0"));
  const minuteOptions = new Array(12).fill(0).map((_, i) => String(i * 5).padStart(2, "0"));
  const dayOptions = days.map((day) => ({ label: day, value: day }));
  const time = useMemo(() => {
    if (type === NotificationType.DAILY) {
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
      {type === NotificationType.CUSTOM && (
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
