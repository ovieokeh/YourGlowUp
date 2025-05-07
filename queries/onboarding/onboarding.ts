import AsyncStorage from "@react-native-async-storage/async-storage";

export enum OnboardingStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}
export type OnboardingKey =
  | "main-onboarding"
  | "first-homepage-visit-onboarding"
  | "first-exercise-onboarding"
  | "first-exercise-logs-visit-onboarding"
  | "first-self-log-onboarding"
  | "first-self-logs-visit-onboarding"
  | "first-progress-tracking-visit-onboarding"
  | "first-progress-stats-visit-onboarding"
  | "first-marketplace-visit-onboarding";
export type OnboardingStatusType = {
  step: number;
  status: OnboardingStatus;
};
const ONBOARDINGS_STATUSES: Record<OnboardingKey, OnboardingStatusType> = {
  "main-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-homepage-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-exercise-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-exercise-logs-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-self-log-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-self-logs-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-progress-tracking-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-progress-stats-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
  "first-marketplace-visit-onboarding": {
    step: 0,
    status: OnboardingStatus.NOT_STARTED,
  },
};

export const fetchOnboardingStatuses = async (): Promise<Record<string, OnboardingStatusType>> => {
  try {
    const onboardingStatuses = await AsyncStorage.getItem("onboarding-statuses");
    if (onboardingStatuses) {
      const parsedStatuses = JSON.parse(onboardingStatuses);
      return parsedStatuses;
    }
    return ONBOARDINGS_STATUSES;
  } catch (error) {
    console.error("Error fetching onboarding statuses:", error);
    return ONBOARDINGS_STATUSES;
  }
};

export const getOnboardingStatus = async (key: OnboardingKey) => {
  try {
    const onboardingStatuses = await fetchOnboardingStatuses();
    return onboardingStatuses[key] || ONBOARDINGS_STATUSES[key];
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    return ONBOARDINGS_STATUSES[key];
  }
};

export const setOnboardingStatus = async (key: OnboardingKey, status: OnboardingStatusType) => {
  try {
    const onboardingStatuses = await fetchOnboardingStatuses();
    onboardingStatuses[key] = status;
    await AsyncStorage.setItem("onboarding-statuses", JSON.stringify(onboardingStatuses));
  } catch (error) {
    console.error("Error setting onboarding status:", error);
  }
};
