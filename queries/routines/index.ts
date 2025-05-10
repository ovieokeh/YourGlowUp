import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRoutine,
  getAllRoutineItems,
  getPendingItemsToday,
  getRoutineById,
  getRoutineItem,
  getRoutineItems,
  getUserRoutines,
  removeRoutine,
  updateRoutine,
  updateRoutineItem,
  updateRoutineItems,
} from "./routines";
import { Routine, RoutineItem } from "./shared";

export const useGetRoutines = () => {
  return useQuery({
    queryKey: ["routines"],
    queryFn: getUserRoutines,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetRoutineById = (id?: string | number) => {
  return useQuery({
    queryKey: ["routines", id],
    queryFn: () => getRoutineById(id ? Number(id) : 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run the query if id is defined
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
    mutationFn: () => removeRoutine(+routineId),
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
      updateRoutine(+routineId, updatedRoutine, updatedRoutine.replace),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useUpdateRoutineItems = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routine-items", routineId],
    mutationFn: (updatedItems: Omit<RoutineItem, "id" | "routineId" | "addedAt">[]) =>
      updateRoutineItems(+routineId, updatedItems),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routine-items"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetRoutineItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ["routines", id],
    queryFn: () => getRoutineItem(id ? Number(id) : 0),
    enabled: !!id, // Only run the query if routineId is defined
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetRoutineItems = (routineId: string | undefined) => {
  return useQuery({
    queryKey: ["routine-items", routineId],
    queryFn: () => getRoutineItems(routineId ? Number(routineId) : 0),
    enabled: !!routineId, // Only run the query if routineId is defined
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetAllRoutineItems = () => {
  return useQuery({
    queryKey: ["routines", "all"],
    queryFn: getAllRoutineItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateRoutineItem = (itemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["routines", itemId],
    mutationFn: (updatedItem: Partial<RoutineItem>) => updateRoutineItem(itemId ? Number(itemId) : 0, updatedItem),
    onSuccess: () => {
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["routine-items"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
};

export const useGetPendingItemsToday = () => {
  return useQuery({
    queryKey: ["routines", "pending"],
    queryFn: () => getPendingItemsToday(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
