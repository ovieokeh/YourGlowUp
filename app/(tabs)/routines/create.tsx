import { router, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAddRoutine } from "@/queries/routines";
import { Routine } from "@/queries/routines/shared";
import Toast from "react-native-toast-message";

export default function CreateRoutineScreen() {
  const [itemState, setItemState] = useState<Omit<Routine, "id">>({
    name: "",
    slug: "",
    description: "",
    itemsSlugs: [],
  });

  const createRoutineMutation = useAddRoutine();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: `Create Routine`,
          headerRight: () => {
            return (
              <ThemedButton
                variant="ghost"
                icon="checkmark.circle"
                iconSize={28}
                onPress={() => {
                  const finalState = {
                    ...itemState,
                    slug: itemState.name.toLowerCase().replace(/\s+/g, "-"),
                  };
                  createRoutineMutation
                    .mutateAsync(finalState)
                    .then((id) => {
                      Toast.show({
                        type: "success",
                        text1: `${itemState.name} updated`,
                        position: "bottom",
                      });
                      router.navigate({
                        pathname: "/(tabs)/routines/[id]",
                        params: { id },
                      });
                    })
                    .catch((error) => {
                      console.error("Error creating routine", error);
                      Toast.show({
                        type: "error",
                        text1: `Error creating routine`,
                        position: "bottom",
                      });
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
          label="Description"
          value={itemState.description}
          onChangeText={(text) => setItemState({ ...itemState, description: text })}
          placeholder="Enter description"
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: Spacings.xl,
    padding: Spacings.lg,
    paddingBottom: 152,
  },
  link: {
    marginTop: Spacings.md,
    paddingVertical: Spacings.md,
  },
  cards: {
    width: "100%",
    borderRadius: 12,
    gap: Spacings.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacings.sm,
  },
});
