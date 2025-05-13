import { GoalActivity, isGuidedActivity } from "@/backend/shared";
import { useMemo } from "react";

export const useActivityDuration = (activity?: GoalActivity | null) => {
  const cumulativeActivityDuration = useMemo(() => {
    if (activity && isGuidedActivity(activity)) {
      return activity.steps?.reduce((acc, step) => {
        if (step.duration) {
          return acc + step.duration;
        }
        return acc;
      }, 0);
    }
    return 0;
  }, [activity]);
  return cumulativeActivityDuration;
};
