import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLogs,
  getLogsByExercise,
  getLogsByTask,
  getPhotoLogs,
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

export const useGetLogsByExercise = (exercise: string) => {
  return useQuery({
    queryKey: ["logs", exercise],
    queryFn: () => getLogsByExercise(exercise),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetLogsByTask = (task: string) => {
  return useQuery({
    queryKey: ["logs", task],
    queryFn: () => getLogsByTask(task),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSaveExerciseLog = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: ({ exercise, duration }: { exercise: string; duration: number }) =>
      saveExerciseLog(exercise, duration, routineId),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.refetchQueries({ queryKey: ["logs"] });
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
      queryClient.refetchQueries({ queryKey: ["logs"] });
    },
  });
};

export const useSaveTaskLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: ({ task, note }: { task: string; note?: string }) => saveTaskLog(task, note),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.refetchQueries({ queryKey: ["logs"] });
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
