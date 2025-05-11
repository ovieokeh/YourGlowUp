import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { useAddGoal } from "@/backend/queries/goals";
import { GoalCategory, GoalCompletionType, GoalCreateInput } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import Toast from "react-native-toast-message";

export default function AddGoalScreen() {
  const { user } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const [itemState, setItemState] = useState<Omit<GoalCreateInput, "id">>({
    name: "",
    slug: "",
    description: "",
    category: GoalCategory.SELF_CARE,
    tags: [],
    isPublic: false,
    completionType: GoalCompletionType.ACTIVITY,
    author: {
      id: user?.id ?? "anonymous",
      name: user?.user_metadata?.display_name ?? "Anonymous",
      avatarUrl: user?.user_metadata?.avatar_url,
    },
  });

  const addGoalMutation = useAddGoal(currentUserId);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
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
                  addGoalMutation
                    .mutateAsync(finalState)
                    .then((id) => {
                      Toast.show({
                        type: "success",
                        text1: `${itemState.name} updated`,
                        position: "bottom",
                      });
                      router.navigate({
                        pathname: "/(tabs)/goals/[id]",
                        params: { id },
                      });
                    })
                    .catch((error) => {
                      console.error("Error creating goal", error);
                      Toast.show({
                        type: "error",
                        text1: `Error creating goal`,
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
