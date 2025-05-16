import { useThemeColor } from "@/hooks/useThemeColor";
import { Stack } from "expo-router";

export default function GoalsLayout() {
  const background = useThemeColor({}, "background");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "My Goals",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="upsert-activity"
        options={{
          headerShown: false,
        }}
      />
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
    </Stack>
  );
}
