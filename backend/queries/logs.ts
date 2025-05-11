import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addActivityLog,
  addFeedbackLog,
  addMediaUploadLog,
  addPromptLog,
  addStepLog,
  getLogs,
  getTodayLogs,
  getTodayLogsByActivityId,
} from "../logs";

import { ActivityLog, FeedbackLog, MediaUploadLog, PromptLog, StepLog } from "../shared";

export const useGetLogs = (userId?: string) => {
  return useQuery({
    queryKey: ["logs", userId],
    queryFn: () => getLogs(userId ?? ""),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
export const useGetTodayLogs = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["logs", userId, "today"],
    queryFn: () => getTodayLogs(userId ?? ""),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
export const useGetTodayLogsByActivityId = (userId: string | undefined, activityId: string) => {
  return useQuery({
    queryKey: ["logs", userId, "today", activityId],
    queryFn: () => getTodayLogsByActivityId(userId ?? "", activityId),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && !!activityId,
  });
};

export const useAddActivityLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<ActivityLog, "id" | "createdAt">) => addActivityLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};

export const useAddPromptLog = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<PromptLog, "id" | "createdAt">) => addPromptLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};

export const useAddStepLog = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<StepLog, "id" | "createdAt">) => addStepLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};

export const useAddMediaUploadLog = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<MediaUploadLog, "id" | "createdAt">) => addMediaUploadLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};

export const useAddFeedbackLog = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<FeedbackLog, "id" | "createdAt">) => addFeedbackLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs", userId] });
    },
  });
};
