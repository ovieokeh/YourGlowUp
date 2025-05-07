import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addXP,
  BadgeKey,
  BadgeStatus,
  fetchUserBadges,
  fetchUserXP,
  resetBadges,
  setBadgeStatus,
  getShownToasts,
  setShownToasts,
} from "./gamification";

export const useGetUserXP = () => {
  return useQuery({
    queryKey: ["xp"],
    queryFn: fetchUserXP,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetUserBadges = () => {
  return useQuery({
    queryKey: ["badges"],
    queryFn: fetchUserBadges,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddXP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["xp"],
    mutationFn: (xp: number) => addXP(xp),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["xp"] });
    },
  });
};
export const useSetBadgeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["badges"],
    mutationFn: (props: { key: BadgeKey; status: BadgeStatus }) => setBadgeStatus(props.key, props.status),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
};

export const useResetBadges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["badges"],
    mutationFn: resetBadges,
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
};

export const useGetShownToasts = () => {
  return useQuery({
    queryKey: ["shown_toasts"],
    queryFn: getShownToasts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useSetShownToasts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["shown_toasts"],
    mutationFn: (shownToasts: Set<BadgeKey>) => setShownToasts(shownToasts),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["shown_toasts"] });
    },
  });
};
