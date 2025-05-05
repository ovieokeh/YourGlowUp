import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { ThemeProviderCustom, useAppTheme } from "@/hooks/theme/context";
import { supabase } from "@/supabase";
import { initLogsTable } from "@/utils/db";
import { hasCompletedOnboarding } from "@/utils/onboarding";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <App />
    </ThemeProviderCustom>
  );
}

function App() {
  const router = useRouter();
  const { colorScheme } = useAppTheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const init = async () => {
      const onboarded = await hasCompletedOnboarding();
      if (!onboarded) {
        router.replace("/onboarding");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    initLogsTable();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="exercises"
          options={{
            headerShown: true,
            title: "Exercises",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerTitle: "Home",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
