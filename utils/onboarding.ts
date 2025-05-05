import AsyncStorage from "@react-native-async-storage/async-storage";

export const hasCompletedOnboarding = async () => {
  return (await AsyncStorage.getItem("onboarding_complete")) === "true";
};

export const setOnboardingComplete = async () => {
  await AsyncStorage.setItem("onboarding_complete", "true");
};
