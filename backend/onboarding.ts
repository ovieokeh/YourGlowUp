import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOnboardingStatuses,
  getOnboardingStatus,
  OnboardingKey,
  OnboardingStatusType,
  setOnboardingStatus,
} from "./queries/onboarding";

export const useGetOnboardingStatuses = () => {
  return useQuery({
    queryKey: ["onboarding-statuses"],
    queryFn: fetchOnboardingStatuses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetOnboardingStatus = (key: OnboardingKey) => {
  return useQuery({
    queryKey: ["onboarding-statuses", key],
    queryFn: () => getOnboardingStatus(key),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useSetOnboardingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["onboarding-statuses"],
    mutationFn: (props: { key: OnboardingKey; value: OnboardingStatusType }) =>
      setOnboardingStatus(props.key, props.value),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["onboarding-statuses"] });
    },
  });
};
