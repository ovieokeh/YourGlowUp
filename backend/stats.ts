import { getAllActivities } from "./activities";
import { getFilteredLogs } from "./logs";
import { ActivityType, GoalActivity, isActivityLog, isPromptLog, isStepLog, Log, PromptLog } from "./shared";

export interface StatsInput {
  goalId?: string;
  startDate?: number;
  endDate?: number;
  category?: string;
  type?: ActivityType;
}

export interface CategoryStat {
  category: string;
  count: number;
  totalDuration: number;
}

export interface ItemStat {
  slug: string;
  name: string;
  type: ActivityType;
  count: number;
  totalDuration: number;
}

export interface ConsistencyStat {
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface TimeSeriesStat {
  date: string;
  count: number;
  totalDuration: number;
}

export interface SessionStat {
  sessionId?: string;
  activityId: string;
  start: string;
  end: string;
  duration: number;
}

export interface PromptStat {
  promptId: string;
  optionCounts: Record<string, number>;
}

export interface ActivityTimingStat {
  activityId: string;
  firstCompletedAt: string;
  lastCompletedAt: string;
  timesCompleted: number;
}

export interface StatsOutput {
  totalTimeSpent: number;
  totalCompleted: number;
  categoryStats: CategoryStat[];
  itemStats: ItemStat[];
  timeSeries: TimeSeriesStat[];
  consistency: ConsistencyStat;
  sessionStats: SessionStat[];
  activityTimingStats: ActivityTimingStat[];
  promptStats: PromptStat[];
}

function getActivityName(activity: GoalActivity): string {
  if (typeof activity.name === "string") {
    return activity.name;
  }
  return String(activity.name || "Unnamed Activity");
}

function getLogDuration(log: Log): number {
  if (isStepLog(log) && typeof log.durationInSeconds !== "undefined") {
    console.log("Step log duration:", log.durationInSeconds);
    return log.durationInSeconds;
  }

  return 0;
}

export async function getStats(input: StatsInput): Promise<StatsOutput> {
  const logs = await getFilteredLogs({
    goalId: input.goalId,
    startDate: input.startDate ? new Date(input.startDate).toISOString() : undefined,
    endDate: input.endDate ? new Date(input.endDate).toISOString() : undefined,
  });

  const logTypes = new Set(logs.map((log) => log.type));
  console.log("Log types:", logTypes);

  const activitiesInputFiltered = await getAllActivities({
    goalId: input.goalId,
    category: input.category,
    type: input.type,
  });

  const activityMapById: Record<string, GoalActivity> = activitiesInputFiltered.reduce((acc, act) => {
    acc[act.id] = act;
    return acc;
  }, {} as Record<string, GoalActivity>);

  const activityLogs = logs.filter(isActivityLog);

  let totalTimeSpent = 0;
  logs.forEach((log) => {
    // console.log("Log:", log);
    totalTimeSpent += getLogDuration(log);
  });

  console.log("Total time spent:", totalTimeSpent);
  const totalCompleted = activityLogs.length;

  const timeSeriesMap: Record<string, TimeSeriesStat> = {};
  const sessionStats: SessionStat[] = [];
  const activityTimingMap: Record<string, ActivityTimingStat> = {};
  const promptResponseMap: Record<string, Record<string, number>> = {};
  const itemStatsMap: Record<string, ItemStat> = {};
  const categoryStatsMap: Record<string, CategoryStat> = {};

  for (const activity of activitiesInputFiltered) {
    itemStatsMap[activity.slug] = {
      slug: activity.slug,
      name: getActivityName(activity),
      type: activity.type,
      count: 0,
      totalDuration: 0,
    };
    if (!categoryStatsMap[activity.category]) {
      categoryStatsMap[activity.category] = {
        category: activity.category,
        count: 0,
        totalDuration: 0,
      };
    }
  }

  const dateToISOStringKey = (dateStr: string) => dateStr.split("T")[0];

  for (const log of logs) {
    try {
      if (!log.createdAt) {
        console.warn("Log without createdAt:", log);
        continue;
      }
      console.log("Processing log:", log.createdAt, log.type, log.activityType);
      const dateKey = dateToISOStringKey(log.createdAt);
      timeSeriesMap[dateKey] = timeSeriesMap[dateKey] || { date: dateKey, count: 0, totalDuration: 0 };

      // console.log("timeSeriesMap[dateKey]:", timeSeriesMap[dateKey]);
      const duration = getLogDuration(log);
      console.log("Duration:", duration);
      if (duration > 0) {
        timeSeriesMap[dateKey].totalDuration += duration;
      }

      sessionStats.push({
        sessionId: (log as PromptLog).sessionId ?? undefined,
        activityId: log.activityId,
        start: log.createdAt,
        end: log.createdAt,
        duration: duration,
      });

      const activityForLog = activityMapById[log.activityId];
      if (activityForLog && duration > 0) {
        if (itemStatsMap[activityForLog.slug]) {
          itemStatsMap[activityForLog.slug].totalDuration += duration;
        }
        if (categoryStatsMap[activityForLog.category]) {
          categoryStatsMap[activityForLog.category].totalDuration += duration;
        }
      }

      if (isActivityLog(log)) {
        timeSeriesMap[dateKey].count++;

        if (activityForLog) {
          if (itemStatsMap[activityForLog.slug]) {
            itemStatsMap[activityForLog.slug].count++;
          }
          if (categoryStatsMap[activityForLog.category]) {
            categoryStatsMap[activityForLog.category].count++;
          }
        }

        const currentLogTimestamp = new Date(log.createdAt).getTime();
        const existingTimingStat = activityTimingMap[log.activityId];
        if (!existingTimingStat) {
          activityTimingMap[log.activityId] = {
            activityId: log.activityId,
            firstCompletedAt: log.createdAt,
            lastCompletedAt: log.createdAt,
            timesCompleted: 1,
          };
        } else {
          existingTimingStat.timesCompleted++;
          if (currentLogTimestamp < new Date(existingTimingStat.firstCompletedAt).getTime()) {
            existingTimingStat.firstCompletedAt = log.createdAt;
          }
          if (currentLogTimestamp > new Date(existingTimingStat.lastCompletedAt).getTime()) {
            existingTimingStat.lastCompletedAt = log.createdAt;
          }
        }
      } else if (isPromptLog(log)) {
        if (log.promptId && log.answer !== undefined && log.answer !== null) {
          const key = log.promptId;
          promptResponseMap[key] = promptResponseMap[key] || {};

          const answersToProcess: any[] = Array.isArray(log.answer) ? log.answer : [log.answer];

          for (const answer of answersToProcess) {
            const answerStringKey =
              typeof answer === "object" && answer !== null ? JSON.stringify(answer) : String(answer);
            promptResponseMap[key][answerStringKey] = (promptResponseMap[key][answerStringKey] || 0) + 1;
          }
        }
      }
    } catch (error) {
      console.error("Error processing log:", log, error);
    }
  }

  console.log("Time series map:", timeSeriesMap);
  const timeSeries = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));
  const activityTimingStats = Object.values(activityTimingMap);
  const promptStatsResult: PromptStat[] = Object.entries(promptResponseMap).map(([promptId, optionCounts]) => ({
    promptId,
    optionCounts,
  }));

  const activeDaysSorted = Object.values(timeSeriesMap)
    .filter((d) => d.count > 0)
    .map((d) => d.date)
    .sort();

  let currentStreak = 0;
  let longestStreak = 0;

  if (activeDaysSorted.length > 0) {
    let ongoingStreak = 0;
    let previousDateInStreakLoop: Date | null = null;

    for (const dateStr of activeDaysSorted) {
      const currentDateInStreakLoop = new Date(dateStr);
      if (previousDateInStreakLoop) {
        const expectedPreviousDate = new Date(currentDateInStreakLoop);
        expectedPreviousDate.setUTCDate(currentDateInStreakLoop.getUTCDate() - 1);

        if (previousDateInStreakLoop.getTime() === expectedPreviousDate.getTime()) {
          ongoingStreak++;
        } else {
          ongoingStreak = 1;
        }
      } else {
        ongoingStreak = 1;
      }
      longestStreak = Math.max(longestStreak, ongoingStreak);
      previousDateInStreakLoop = currentDateInStreakLoop;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const lastActiveDayDate = new Date(activeDaysSorted[activeDaysSorted.length - 1]);

    if (lastActiveDayDate.getTime() === today.getTime()) {
      currentStreak = ongoingStreak;
    } else {
      currentStreak = 0;
    }
  }

  const consistency: ConsistencyStat = {
    totalActiveDays: activeDaysSorted.length,
    currentStreak: currentStreak,
    longestStreak: longestStreak,
  };

  return {
    totalTimeSpent,
    totalCompleted,
    categoryStats: Object.values(categoryStatsMap),
    itemStats: Object.values(itemStatsMap),
    timeSeries,
    consistency,
    sessionStats,
    activityTimingStats,
    promptStats: promptStatsResult,
  };
}
