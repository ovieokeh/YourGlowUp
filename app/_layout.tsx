import { queryClient } from "@/backend";
import { resetBadges, resetShownToasts, resetXP } from "@/backend/gamification";
import { initDatabase } from "@/backend/localDb";
import { getOnboardingStatus, OnboardingStatus, setOnboardingStatus } from "@/backend/queries/onboarding";
import { AppProvider } from "@/hooks/app/context";
import { ThemeProviderCustom, useAppTheme } from "@/hooks/theme/context";
import { BadgeProvider } from "@/providers/BadgeContext";
import { supabase } from "@/supabase";
import { useNotificationRedirect } from "@/utils/notifications";
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
    <QueryClientProvider client={queryClient}>
      <ThemeProviderCustom>
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProviderCustom>
    </QueryClientProvider>
  );
}

function App() {
  const router = useRouter();
  const { colorScheme } = useAppTheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useNotificationRedirect();

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
    const nuke = async () => {
      // initLogsTable(true);
      // initGoalsTables(true);
      await initDatabase(true);
      await resetBadges();
      await resetXP();
      await resetShownToasts();
      // await seedDatabase();
      setOnboardingStatus("main-onboarding", {
        step: 0,
        status: OnboardingStatus.NOT_STARTED,
      });
    };
    // nuke();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <BadgeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />

          <Stack.Screen
            name="activities"
            options={{
              headerShown: true,
              title: "Activities",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="activity/[slug]"
            options={{
              title: "Activity",
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
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Toast />
      </BadgeProvider>
    </ThemeProvider>
  );
}
