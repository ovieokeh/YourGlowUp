import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLogs,
  getLogsBySlug,
  getPhotoLogs,
  getTodayLogs,
  PhotoLogCreate,
  saveExerciseLog,
  savePhotoLog,
  saveTaskLog,
} from "./logs";

export const useGetLogs = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: getLogs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetLogsByTaskOrExercise = (taskOrExercise: string) => {
  return useQuery({
    queryKey: ["logs", taskOrExercise],
    queryFn: () => getLogsBySlug(taskOrExercise),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSaveExerciseLog = (routineId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: ({ exercise, duration }: { exercise: string; duration: number }) =>
      saveExerciseLog(exercise, duration, routineId),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
};

export const useSavePhotoLog = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: (args: PhotoLogCreate) => savePhotoLog({ ...args, routineId }),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
};

export const useSaveTaskLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: ({ task, routineId, note }: { task: string; routineId: number; note?: string }) =>
      saveTaskLog(task, routineId, note),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetPhotoLogs = (routineId: string) => {
  return useQuery({
    queryKey: ["logs", routineId],
    queryFn: () => getPhotoLogs(routineId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTodayLogs = () => {
  return useQuery({
    queryKey: ["logs", "today"],
    queryFn: () => getTodayLogs(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
