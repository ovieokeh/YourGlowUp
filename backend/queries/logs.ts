import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addLog, addStepLog, getFilteredLogs } from "../logs";

import { LogCreateInput, StepLog } from "../shared";

export const useGetLogs = (userId?: string) => {
  return useQuery({
    queryKey: ["logs", userId],
    queryFn: () =>
      getFilteredLogs({
        userId,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
export const useGetTodayLogs = (userId: string | undefined) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const isoStart = startOfDay.toISOString();

  return useQuery({
    queryKey: ["logs", userId, "today"],
    queryFn: () =>
      getFilteredLogs({
        userId,
        startDate: isoStart,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
export const useGetTodayLogsByActivityId = (userId: string | undefined, activityId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const isoStart = startOfDay.toISOString();
  return useQuery({
    queryKey: ["logs", userId, "today", activityId],
    queryFn: () =>
      getFilteredLogs({
        userId,
        activityId,
        startDate: isoStart,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && !!activityId,
  });
};

export const useAddLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: LogCreateInput) => addLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};

export const useAddStepLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<StepLog, "id">) => addStepLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};
