import { ThemedButton } from "@/components/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router, Stack } from "expo-router";

export default function RoutinesLayout() {
  const background = useThemeColor({}, "background");
  return (
    <>
      {/* <Tabs.Screen
        name="routines/index"
        options={{
          title: "My Routines",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock" color={color} />,
        }}
      /> */}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: "My Routines",
            headerTitleAlign: "left",
            headerRight: () => (
              <ThemedButton
                variant="ghost"
                icon="plus.circle"
                iconSize={28}
                onPress={() => router.push("/(tabs)/routines/create")}
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
            title: "Edit Routine Item",
            headerStyle: {
              backgroundColor: background,
            },
          }}
        />
        <Stack.Screen name="explore" />
        <Stack.Screen
          name="create"
          options={{
            headerShown: true,
            title: "Create Routine",
            headerStyle: {
              backgroundColor: background,
            },
          }}
        />
      </Stack>
    </>
  );
}
