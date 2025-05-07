import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRoutine,
  getPendingItemsToday,
  getRoutineById,
  getRoutineItem,
  getUserRoutines,
  removeRoutine,
  Routine,
  updateRoutine,
  updateRoutineItem,
} from "./routines";

export const useGetRoutines = () => {
  return useQuery({
    queryKey: ["routines"],
    queryFn: getUserRoutines,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetRoutineById = (routineId: string) => {
  return useQuery({
    queryKey: ["routines", routineId],
    queryFn: () => getRoutineById(routineId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routines"],
    mutationFn: (newRoutine: Omit<Routine, "id">) => addRoutine(newRoutine),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useRemoveRoutine = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routines", routineId],
    mutationFn: () => removeRoutine(routineId),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useUpdateRoutine = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routines", routineId],
    mutationFn: (updatedRoutine: Partial<Routine> & { replace?: boolean }) =>
      updateRoutine(routineId, updatedRoutine, updatedRoutine.replace),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetRoutineItem = (itemId: string, routineId: string) => {
  return useQuery({
    queryKey: ["routines", itemId, routineId],
    queryFn: () => getRoutineItem(itemId, routineId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateRoutineItem = (itemId: string, routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routines", itemId, routineId],
    mutationFn: (updatedItem: Partial<Routine>) => updateRoutineItem(itemId, routineId, updatedItem),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetPendingItemsToday = (routineId: string) => {
  return useQuery({
    queryKey: ["routines", "pending"],
    queryFn: () => getPendingItemsToday(routineId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
