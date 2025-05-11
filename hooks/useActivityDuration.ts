import { GoalActivity, isGuidedActivity } from "@/backend/shared";
import { useMemo } from "react";

export const useActivityDuration = (activity?: GoalActivity | null) => {
  const cumulativeActivityDuration = useMemo(() => {
    if (activity && isGuidedActivity(activity)) {
      console.log("activity", activity.steps.length, typeof activity.steps);
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
