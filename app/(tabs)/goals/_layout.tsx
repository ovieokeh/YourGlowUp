import { ThemedButton } from "@/components/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router, Stack } from "expo-router";

export default function GoalsLayout() {
  const background = useThemeColor({}, "background");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "My Goals",
          headerTitleAlign: "left",
          headerRight: () => (
            <ThemedButton
              variant="ghost"
              icon="plus.circle"
              iconSize={28}
              onPress={() => router.push("/(tabs)/goals/add")}
            />
          ),
          headerStyle: {
            backgroundColor: background,
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Edit Goal Activity",
          headerStyle: {
            backgroundColor: background,
          },
        }}
      />
      <Stack.Screen name="explore" />
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: "Add Goal",
          headerStyle: {
            backgroundColor: background,
          },
        }}
      />
      <Stack.Screen
        name="add-photo-log"
        options={{
          headerShown: true,
          title: "Log Photo",
          headerStyle: {
            backgroundColor: background,
          },
        }}
      />
    </Stack>
  );
}
