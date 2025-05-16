import { Activity, ActivityStep } from "@/backend/shared";
import { useMemo } from "react";
export const getTotalActivityDuration = (steps: ActivityStep[]) => {
  return steps.reduce((total, step) => {
    const stepDuration = step.duration || 0;
    const stepDurationType = step.durationType || "seconds";

    if (stepDurationType === "seconds") {
      return total + stepDuration;
    } else if (stepDurationType === "minutes") {
      return total + stepDuration * 60;
    } else if (stepDurationType === "hours") {
      return total + stepDuration * 3600;
    }
    return total;
  }, 0);
};
export const useActivityDuration = (activity?: Activity | null) => {
  const cumulativeActivityDuration = useMemo(() => {
    if (!activity) return 0;
    const totalDuration = getTotalActivityDuration(activity.steps);
    return totalDuration;
  }, [activity]);
  return cumulativeActivityDuration;
};
