import { BackButton } from "@/components/BackButton";
import { ThemeProviderCustom, useAppTheme } from "@/hooks/theme/context";
import { BadgeProvider } from "@/providers/BadgeContext";
import { queryClient } from "@/queries";
import { initLogsTable } from "@/queries/logs/logs";
import { getOnboardingStatus, OnboardingStatus } from "@/queries/onboarding/onboarding";
import { initRoutinesTables } from "@/queries/routines/routines";
import { supabase } from "@/supabase";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

global.Buffer = Buffer;

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
      const onboarded = await getOnboardingStatus("main-onboarding");
      if (onboarded?.status !== OnboardingStatus.COMPLETED) {
        router.replace(`/onboarding?step=${onboarded?.step}`);
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
    initRoutinesTables();
    // resetBadges();
    // resetXP();
    // setOnboardingStatus("main-onboarding", {
    //   step: 0,
    //   status: OnboardingStatus.NOT_STARTED,
    // });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <BadgeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
            <Stack.Screen
              name="add-user-log"
              options={{
                headerShown: true,
                title: "Add a self log",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="edit-routine-item"
              options={{
                headerShown: true,
                title: "Edit Routine Item",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="exercises"
              options={{
                headerShown: true,
                title: "Exercises",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="exercise/[slug]"
              options={{
                headerShown: true,
                title: "Exercises",
                headerTitleAlign: "center",
                headerLeft: () => <BackButton />,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                title: "Home",
              }}
            />
            <Stack.Screen
              name="face-analysis"
              options={{
                headerTitle: "Face Analysis",
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          <Toast />
        </BadgeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
