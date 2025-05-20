import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addActivity,
  getActivities,
  getActivitiesSnapshot,
  getActivityById,
  getActivityBySlug,
  getPendingActivities,
  getPendingActivitiesToday,
  removeActivity,
  updateActivity,
} from "../activities";
import { Activity, ActivityCreateInput } from "../shared";

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

export const useGetActivitiesSnapshot = (goalId: string) => {
  return useQuery({
    queryKey: ["activities-snapshot", goalId],
    queryFn: () => getActivitiesSnapshot(goalId),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityInput: ActivityCreateInput) => addActivity(goalId, activityInput),
    onSuccess: (/* data, variables, context */) => {
      queryClient.invalidateQueries({ queryKey: ["goals", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });

      queryClient.invalidateQueries({ queryKey: ["pending-activities", goalId] });
      queryClient.invalidateQueries({ queryKey: ["pending-activities-today", goalId] });

      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useUpdateActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activity: Activity) => updateActivity(goalId, activity),
    onSuccess: (_data, variables) => {
      const activityId = variables.id;

      queryClient.invalidateQueries({ queryKey: ["goals", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });

      if (activityId) {
        queryClient.invalidateQueries({ queryKey: ["activity", activityId] });
        queryClient.invalidateQueries({ queryKey: ["activity", goalId, variables.slug] });
      }

      queryClient.invalidateQueries({ queryKey: ["pending-activities", goalId] });
      queryClient.invalidateQueries({ queryKey: ["pending-activities-today", goalId] });

      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useRemoveActivity = (goalId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => removeActivity(activityId),
    onSuccess: (_data, activityId) => {
      queryClient.invalidateQueries({ queryKey: ["goals", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["activities", goalId] });

      if (activityId) {
        queryClient.invalidateQueries({ queryKey: ["activity", activityId] });
      }

      queryClient.invalidateQueries({ queryKey: ["pending-activities", goalId] });
      queryClient.invalidateQueries({ queryKey: ["pending-activities-today", goalId] });

      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useGetPendingActivities = (completedActivityIds: string[], goalId?: string) => {
  return useQuery({
    queryKey: ["pending-activities", goalId ?? "all", completedActivityIds],
    queryFn: () => getPendingActivities(completedActivityIds, goalId),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 1,
    placeholderData: keepPreviousData,
  });
};

export const useGetPendingActivitiesToday = (completedActivityIds: string[], goalId?: string) => {
  return useQuery({
    queryKey: ["pending-activities-today", goalId ?? "all", completedActivityIds],
    queryFn: () => getPendingActivitiesToday(completedActivityIds, goalId),

    enabled: !!goalId,

    staleTime: 1000 * 60 * 1,
  });
};

export const withGoalActivities = (goalId: string, callback: (activities: Activity[]) => void): Promise<void> => {
  return getActivities(goalId)
    .then((activities) => {
      callback(activities);
    })
    .catch((error) => {
      console.error(`Error in withGoalActivities for goal ${goalId}:`, error);

      throw error;
    });
};
