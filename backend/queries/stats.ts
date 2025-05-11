import { useQuery } from "@tanstack/react-query";
import { getStats, StatsInput } from "../stats";

export const useGetStats = (opts: StatsInput) => {
  return useQuery({
    queryKey: ["stats", JSON.stringify(opts)],
    queryFn: () => getStats(opts),
    staleTime: 1000 * 60 * 5,
    enabled: !!opts.goalId,
  });
};
