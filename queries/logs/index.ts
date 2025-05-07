import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLogs, getLogsByExercise, getLogsByTask, saveExerciseLog, saveTaskLog, saveUserLog } from "./logs";

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
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
};

export const useSaveUserLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: (log: any) => saveUserLog(log),
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
    mutationFn: (task: string) => saveTaskLog(task),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
};
