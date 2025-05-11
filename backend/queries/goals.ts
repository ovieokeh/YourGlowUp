import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addGoal,
  copyGoal,
  getGoalById,
  getGoals,
  GetGoalsOptions,
  removeGoal,
  updateGoal,
  updateGoalActivities,
} from "../goals";
import { Goal, GoalActivity, GoalCreateInput } from "../shared";

export const useGetGoals = (userId: string | undefined, opts?: GetGoalsOptions) => {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: () => getGoals(userId ?? "", opts),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};

export const useGetGoalById = (goalId?: string) => {
  return useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => getGoalById(goalId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!goalId,
  });
};

export const useAddGoal = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GoalCreateInput) => addGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useRemoveGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => removeGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useUpdateGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts: { goalId: string; goal: Partial<Goal> }) => updateGoal(opts.goalId, opts.goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useUpdateGoalActivities = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts: { goalId: string; activities: GoalActivity[] }) =>
      updateGoalActivities(opts.goalId, opts.activities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useCopyGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts: { original: Goal; newOwnerId: string; newOwnerName: string }) =>
      copyGoal(opts.original, opts.newOwnerId, opts.newOwnerName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const withGoal = (goalId: string, callback: (goal: Goal) => void): Promise<void> => {
  return getGoalById(goalId).then((goal) => {
    if (!goal) {
      throw new Error("Goal not found");
    }

    callback(goal);
  });
};
