import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLogs,
  getLogsBySlug,
  getPhotoLogs,
  getTodayLogs,
  getTodayLogsBySlug,
  PhotoLogCreate,
  saveLog,
  savePhotoLog,
} from "./logs";
import { getStats } from "./stats";

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

export const useSaveLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["logs"],
    mutationFn: ({
      type,
      slug,
      routineId,
      meta,
    }: {
      type: "exercise" | "task";
      slug: string;
      routineId: number;
      meta?: any;
    }) => saveLog(type, slug, routineId, meta),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetPhotoLogs = (routineId: number | undefined) => {
  return useQuery({
    queryKey: ["logs", routineId],
    queryFn: () => getPhotoLogs(routineId ?? 0),
    enabled: !!routineId,
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

export const useGetTodayLogsBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["logs", "today", slug],
    queryFn: () => getTodayLogsBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetStats = ({
  routineId,
  startDate,
  endDate,
}: {
  routineId?: number;
  startDate?: number;
  endDate?: number;
}) => {
  return useQuery({
    queryKey: ["logs", "stats"],
    queryFn: () => getStats({ routineId, startDate, endDate }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
