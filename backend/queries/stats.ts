import { useQuery } from "@tanstack/react-query";
import { getStats } from "../stats";

export const useGetStats = (goalId?: string, startDate?: number, endDate?: number) => {
  return useQuery({
    queryKey: ["stats", goalId, startDate, endDate],
    queryFn: () =>
      getStats({
        goalId,
        startDate,
        endDate,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!goalId,
  });
};
