import { invariant } from "es-toolkit";
import { Link, router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useGetRoutineItem, useUpdateRoutineItem } from "@/queries/routines";
import { RoutineItem } from "@/queries/routines/shared";
import { Ionicons } from "@expo/vector-icons";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";

const timeOptions = Array.from({ length: 24 * 12 }, (_, i) => {
  const hour = String(Math.floor(i / 12)).padStart(2, "0");
  const minute = String((i % 12) * 5).padStart(2, "0");
  return `${hour}:${minute}`;
});

export default function EditRoutineItemScreen() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const routineId = searchParams.get("routineId") || "";
  invariant(id, "id is required");
  invariant(routineId, "routineId is required");

  const [itemState, setItemState] = useState<Partial<RoutineItem>>({
    name: "",
    area: "",
    description: "",
    instructions: [],
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
      notificationTimes: [...(itemState.notificationTimes || []), "10:00"],
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
            {(itemState.notificationTimes || []).map((time, index) => (
              <View key={`time-${index}`} style={styles.row}>
                <ThemedPicker
                  items={[...timeOptions, "random"].map((t) => ({ label: t, value: t }))}
                  selectedValue={time}
                  onValueChange={(val) => updateTime(index, val)}
                  style={{ flex: 1, maxWidth: "90%" }}
                />
                <TouchableOpacity onPress={() => removeTime(index)}>
                  <Ionicons name="remove" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <ThemedButton title="Add Notification Time" onPress={addTime} variant="outline" icon="plus" />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

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
