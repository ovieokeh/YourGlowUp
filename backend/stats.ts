import { getAllActivities } from "./activities";
import { getLogs } from "./logs";
import { ActivityLog, ActivityType, LogType, PromptLog, StepLog } from "./shared";

export interface StatsInput {
  goalId?: string;
  startDate?: number;
  endDate?: number;
  category?: string;
  type?: ActivityType;
  scheduledDate?: string;
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
  totalDuration?: number;
}

export interface ConsistencyStat {
  totalDays: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface TimeSeriesStat {
  date: string;
  count: number;
  totalDuration: number;
}

export interface NotificationDelayStat {
  avgDelayMinutes: number;
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
  notificationDelay?: NotificationDelayStat;
}

export async function getStats(input: StatsInput): Promise<StatsOutput> {
  const logs = await getLogs(input.goalId?.toString() ?? "");
  // inside getStats
  const activities = await getAllActivities({
    goalId: input.goalId?.toString(),
    category: input.category,
    type: input.type,
  });

  const activityLogs = logs.filter((log): log is ActivityLog => log.type === LogType.ACTIVITY);
  const stepLogs = logs.filter((log): log is StepLog => log.type === LogType.STEP);
  const promptLogs = logs.filter((log): log is PromptLog => log.type === LogType.PROMPT);

  const totalTimeSpent = stepLogs.reduce((sum, s) => sum + (s.durationInSeconds || 0), 0);
  const totalCompleted = activityLogs.length;

  const timeSeriesMap: Record<string, TimeSeriesStat> = {};
  const sessionStats: SessionStat[] = [];
  const activityTimingMap: Record<string, ActivityTimingStat> = {};
  const promptMap: Record<string, Record<string, number>> = {};
  const itemMap: Record<string, ItemStat> = {};
  const categoryMap: Record<string, CategoryStat> = {};

  for (const act of activities) {
    itemMap[act.slug] = {
      slug: act.slug,
      name: typeof act.name === "string" ? act.name : "",
      type: act.type,
      count: 0,
      totalDuration: 0,
    };
    categoryMap[act.category] = categoryMap[act.category] ?? {
      category: act.category,
      count: 0,
      totalDuration: 0,
    };
  }

  const dateKey = (ts: string) => ts.split("T")[0];

  for (const log of stepLogs) {
    const date = dateKey(log.createdAt);
    timeSeriesMap[date] = timeSeriesMap[date] || { date, count: 0, totalDuration: 0 };
    timeSeriesMap[date].count++;
    timeSeriesMap[date].totalDuration += log.durationInSeconds || 0;

    sessionStats.push({
      sessionId: undefined,
      activityId: log.activityId,
      start: log.createdAt,
      end: log.createdAt,
      duration: log.durationInSeconds || 0,
    });

    const act = activities.find((a) => a.id === log.activityId);
    if (act) {
      itemMap[act.slug].totalDuration = (itemMap[act.slug].totalDuration ?? 0) + (log.durationInSeconds || 0);
      categoryMap[act.category].totalDuration += log.durationInSeconds || 0;
    }
  }

  for (const log of activityLogs) {
    const t = activityTimingMap[log.activityId] ?? {
      activityId: log.activityId,
      firstCompletedAt: log.createdAt,
      lastCompletedAt: log.createdAt,
      timesCompleted: 0,
    };
    t.firstCompletedAt = t.timesCompleted === 0 ? log.createdAt : t.firstCompletedAt;
    t.lastCompletedAt = log.createdAt;
    t.timesCompleted++;
    activityTimingMap[log.activityId] = t;

    const act = activities.find((a) => a.id === log.activityId);
    if (act) {
      itemMap[act.slug].count++;
      categoryMap[act.category].count++;
    }
  }

  for (const log of promptLogs) {
    if (log.answerType === "select" || log.answerType === "boolean") {
      const key = log.promptId;
      const val = String(log.answer);
      promptMap[key] = promptMap[key] || {};
      promptMap[key][val] = (promptMap[key][val] || 0) + 1;
    }
  }

  const timeSeries = Object.values(timeSeriesMap);
  const activityTimingStats = Object.values(activityTimingMap);
  const promptStats: PromptStat[] = Object.entries(promptMap).map(([promptId, options]) => ({
    promptId,
    optionCounts: options,
  }));

  const uniqueDays = new Set(timeSeries.map((d) => d.date));
  const sorted = [...uniqueDays].sort();
  let streak = 0;
  let longestStreak = 0;
  let prevDate: string | null = null;

  for (const date of sorted) {
    if (!prevDate) {
      streak = 1;
    } else {
      const pd: Date = new Date(prevDate);
      pd.setDate(pd.getDate() + 1);
      const expected = pd.toISOString().split("T")[0];
      if (expected === date) {
        streak++;
      } else {
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);
    prevDate = date;
  }

  const consistency: ConsistencyStat = {
    totalDays: sorted.length,
    activeDays: sorted.length,
    currentStreak: streak,
    longestStreak,
  };

  return {
    totalTimeSpent,
    totalCompleted,
    categoryStats: Object.values(categoryMap),
    itemStats: Object.values(itemMap),
    timeSeries,
    consistency,
    sessionStats,
    activityTimingStats,
    promptStats,
  };
}
