import { Exercise, EXERCISES, Task, TASKS } from "@/constants/Exercises";
import { getLogs, Log } from "./logs";

export interface StatsInput {
  routineId?: number; // Optional filter by routine
  startDate?: number; // Optional filter: UNIX timestamp
  endDate?: number; // Optional filter: UNIX timestamp
}

export interface AreaStat {
  area: string;
  count: number;
  totalDuration: number;
}

export interface ItemStat {
  slug: string;
  name: string;
  type: "exercise" | "task";
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
  date: string; // e.g. "2025-05-10"
  count: number;
  totalDuration: number;
}

export interface NotificationDelayStat {
  avgDelayMinutes: number;
}

export interface StatsOutput {
  totalTimeSpent: number; // In seconds or minutes
  totalCompleted: number; // Tasks + exercises
  areaStats: AreaStat[];
  itemStats: ItemStat[];
  timeSeries: TimeSeriesStat[]; // Grouped by day
  consistency: ConsistencyStat;
  notificationDelay?: NotificationDelayStat;
}

const METADATA_MAP = [...EXERCISES, ...TASKS].reduce((acc, item) => {
  acc[item.slug] = item;
  return acc;
}, {} as Record<string, Exercise | Task>);

export const getStats = async (input: StatsInput): Promise<StatsOutput> => {
  try {
    const logs = await getLogs();

    const filtered = logs.filter((log) => {
      if (input.routineId && log.routineId !== input.routineId) return false;
      const createdAt = new Date(log.createdAt).getTime();
      if (input.startDate && createdAt < input.startDate) return false;
      if (input.endDate && createdAt > input.endDate) return false;
      return true;
    });

    const dateMap = new Map<string, Log[]>();
    const itemMap = new Map<string, ItemStat>();
    const areaMap = new Map<string, AreaStat>();

    let totalTimeSpent = 0;

    for (const log of filtered) {
      const meta = METADATA_MAP[log.slug];
      if (!meta) continue;

      const date = new Date(log.createdAt).toISOString().split("T")[0];
      if (!dateMap.has(date)) dateMap.set(date, []);
      dateMap.get(date)!.push(log);

      // Time spent

      if (log.meta.duration) {
        totalTimeSpent += log.meta.duration ?? 0;
      }

      // Per-item stats
      const existingItem = itemMap.get(log.slug) ?? {
        slug: log.slug,
        name: meta.name,
        type: log.type,
        count: 0,
        totalDuration: 0,
      };
      existingItem.count += 1;
      if (log.meta.duration) {
        existingItem.totalDuration = (existingItem.totalDuration ?? 0) + (log.meta.duration ?? 0);
      }
      itemMap.set(log.slug, existingItem);

      // Per-area stats
      const areaKey = meta.area;
      const existingArea = areaMap.get(areaKey) ?? { area: areaKey, count: 0, totalDuration: 0 };
      existingArea.count += 1;
      if (log.type === "exercise") {
        existingArea.totalDuration += log.meta.duration ?? 0;
      }
      areaMap.set(areaKey, existingArea);
    }

    const timeSeries: TimeSeriesStat[] = [];
    let currentStreak = 0;
    let longestStreak = 0;
    let previousDate = null;

    const sortedDates = Array.from(dateMap.keys()).sort();
    for (const date of sortedDates) {
      const count = dateMap.get(date)!.length;
      const totalDuration = dateMap.get(date)!.reduce((sum, log) => {
        return log.meta.duration ? sum + log.meta.duration : sum;
      }, 0);

      timeSeries.push({ date, count, totalDuration });

      // Streak logic
      if (!previousDate || new Date(date).getTime() - new Date(previousDate).getTime() === 86400000) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
      previousDate = date;
    }

    return {
      totalTimeSpent,
      totalCompleted: filtered.length,
      itemStats: Array.from(itemMap.values()),
      areaStats: Array.from(areaMap.values()),
      timeSeries,
      consistency: {
        totalDays: sortedDates.length,
        activeDays: sortedDates.length,
        currentStreak,
        longestStreak,
      },
      // Optionally: add notification delay
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};
