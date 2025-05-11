import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addActivity,
  getActivities,
  getActivityById,
  getActivityBySlug,
  getAllPendingActivitiesToday,
  getPendingActivities,
  getPendingActivitiesToday,
  removeActivity,
  updateActivity,
} from "../activities";
import { GoalActivity } from "../shared";

export const useGetActivities = (goalId?: string) => {
  return useQuery({
    queryKey: ["activities", goalId],
    queryFn: () => getActivities(goalId!),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetActivityById = (activityId?: string) => {
  return useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => getActivityById(activityId!),
    enabled: !!activityId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetActivityBySlug = (goalId: string, slug: string) => {
  return useQuery({
    queryKey: ["activity", goalId, slug],
    queryFn: () => getActivityBySlug(goalId, slug),
    enabled: !!goalId && !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activity: GoalActivity) => addActivity(goalId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });
    },
  });
};

export const useUpdateActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activity: GoalActivity) => updateActivity(goalId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });
    },
  });
};

export const useRemoveActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => removeActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });
    },
  });
};

export const useGetPendingActivities = (goalId: string, completedActivityIds: string[]) => {
  return useQuery({
    queryKey: ["pending-activities", goalId, completedActivityIds],
    queryFn: () => getPendingActivities(goalId, completedActivityIds),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetPendingActivitiesToday = (goalId: string | undefined, completedActivityIds: string[]) => {
  return useQuery({
    queryKey: ["pending-activities-today", goalId, completedActivityIds],
    queryFn: () => getPendingActivitiesToday(goalId ?? "", completedActivityIds),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAllPendingActivitiesToday = () => {
  return useQuery({
    queryKey: ["all-pending-activities-today"],
    queryFn: getAllPendingActivitiesToday,
    staleTime: 1000 * 60 * 5,
  });
};

export const withGoalActivities = (goalId: string, callback: (goal: GoalActivity[]) => void): Promise<void> => {
  return getActivities(goalId).then((activities) => {
    if (!activities) {
      throw new Error("Goal not found");
    }

    callback(activities);
  });
};
