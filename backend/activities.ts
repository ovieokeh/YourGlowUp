import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { localDb } from "./localDb";
import { ActivityType, GoalActivity, NotificationRecurrence } from "./shared";

export async function addActivity(goalId: string, activity: GoalActivity): Promise<string> {
  const id = activity.id ?? uuidv4();
  const stmt = `INSERT INTO activities (
    id, goalId, slug, name, description, featuredImage, category,
    notificationsEnabled, scheduledTimes, recurrence, type, completionPrompts,
    steps, reliesOn, unlockCondition, unlockParams, meta
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  await localDb
    .runAsync(stmt, [
      id,
      goalId,
      activity.slug,
      JSON.stringify(activity.name),
      JSON.stringify(activity.description),
      activity.featuredImage ?? null,
      activity.category,
      activity.notificationsEnabled ? 1 : 0,
      JSON.stringify(activity.scheduledTimes ?? []),
      activity.recurrence ?? null,
      activity.type,
      JSON.stringify(activity.completionPrompts ?? []),
      JSON.stringify(activity.steps),
      JSON.stringify(activity.reliesOn ?? []),
      activity.unlockCondition ?? null,
      JSON.stringify(activity.unlockParams ?? {}),
      JSON.stringify(activity.meta ?? {}),
    ])
    .catch((error) => {
      console.error("Error adding activity:", error);
    });

  return id;
}

export async function getActivities(goalId: string): Promise<GoalActivity[]> {
  try {
    const rows = await localDb.getAllAsync<any>(`SELECT * FROM activities WHERE goalId = ?`, [goalId]);
    return rows.map(deserializeActivity);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

export async function getActivityById(activityId: string): Promise<GoalActivity | null> {
  const row = await localDb.getFirstAsync<any>(`SELECT * FROM activities WHERE id = ?`, [activityId]);
  if (!row) return null;
  return deserializeActivity(row);
}

export async function getActivityBySlug(goalId: string, slug: string): Promise<GoalActivity | null> {
  const row = await localDb.getFirstAsync<any>(`SELECT * FROM activities WHERE goalId = ? AND slug = ?`, [
    goalId,
    slug,
  ]);
  if (!row) return null;
  return deserializeActivity(row);
}

export async function removeActivity(activityId: string): Promise<void> {
  await localDb.runAsync(`DELETE FROM activities WHERE id = ?`, [activityId]);
}

export async function updateActivity(goalId: string, activity: GoalActivity): Promise<void> {
  const stmt = `UPDATE activities SET
    slug = ?, name = ?, description = ?, featuredImage = ?, category = ?,
    notificationsEnabled = ?, scheduledTimes = ?, recurrence = ?, type = ?, completionPrompts = ?,
    steps = ?, reliesOn = ?, unlockCondition = ?, unlockParams = ?, meta = ?
    WHERE id = ? AND goalId = ?;`;

  await localDb.runAsync(stmt, [
    activity.slug,
    JSON.stringify(activity.name),
    JSON.stringify(activity.description),
    activity.featuredImage ?? null,
    activity.category,
    activity.notificationsEnabled ? 1 : 0,
    JSON.stringify(activity.scheduledTimes ?? []),
    activity.recurrence ?? null,
    activity.type,
    JSON.stringify(activity.completionPrompts ?? []),
    JSON.stringify(activity.steps),
    JSON.stringify(activity.reliesOn ?? []),
    activity.unlockCondition ?? null,
    JSON.stringify(activity.unlockParams ?? {}),
    JSON.stringify(activity.meta ?? {}),
    activity.id,
    goalId,
  ]);
}

export async function getPendingActivities(goalId: string, completedActivityIds: string[]): Promise<GoalActivity[]> {
  const all = await getActivities(goalId);
  return all.filter((a) => !completedActivityIds.includes(a.id));
}

export async function getPendingActivitiesToday(
  goalId: string,
  completedActivityIds: string[]
): Promise<GoalActivity[]> {
  const all = await getPendingActivities(goalId, completedActivityIds);
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase();
  const nowTime = new Date().toTimeString().slice(0, 5);

  return all.filter((activity) => {
    if (!activity.recurrence || activity.scheduledTimes?.length === 0) return false;
    const matchesDaily = activity.recurrence === "daily" && activity.scheduledTimes?.some((t) => t === nowTime);
    const matchesWeekly =
      activity.recurrence === "weekly" && activity.scheduledTimes?.some((t) => t.toLowerCase().startsWith(today));
    return matchesDaily || matchesWeekly;
  });
}

export async function getAllPendingActivitiesToday(): Promise<GoalActivity[]> {
  const all = await getAllActivities();
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase();
  const nowTime = new Date().toTimeString().slice(0, 5);

  const allScheduledTimes = all
    .map((activity) => activity.scheduledTimes)
    .flat()
    .filter((time) => time && typeof time === "string");
  //
  console.log("allScheduledTimes", allScheduledTimes, nowTime);
  const allRecurrences = all.map((activity) => activity.recurrence);

  console.log("allRecurrences", allRecurrences);

  const filtered = all.filter((activity) => {
    if (!activity.recurrence || activity.scheduledTimes?.length === 0) return false;
    const matchesDaily =
      activity.recurrence === NotificationRecurrence.DAILY &&
      activity.scheduledTimes?.some((t) => {
        // compare hours and minutes
        const [hours, minutes] = t.split(":");
        const [nowHours, nowMinutes] = nowTime.split(":");

        // if total time is less than nowTime, then it's a match
        const isLessThanNowTime =
          parseInt(hours) < parseInt(nowHours) ||
          (parseInt(hours) === parseInt(nowHours) && parseInt(minutes) < parseInt(nowMinutes));
        return isLessThanNowTime;
      });
    const matchesWeekly =
      activity.recurrence === NotificationRecurrence.WEEKLY &&
      activity.scheduledTimes?.some((t) => t.toLowerCase().startsWith(today));
    return matchesDaily || matchesWeekly;
  });

  console.log("filtered", filtered);
  return filtered;
}

export async function getAllPendingActivities(goalId: string, completedActivityIds: string[]): Promise<GoalActivity[]> {
  const stmt = `SELECT * FROM activities WHERE goalId = ? AND id NOT IN (${completedActivityIds})`;
  const rows = await localDb.getAllAsync<any>(stmt, [goalId]);
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase();
  const nowTime = new Date().toTimeString().slice(0, 5);
  return rows.filter((activity) => {
    if (!activity.recurrence || activity.scheduledTimes?.length === 0) return false;
    const matchesDaily = activity.recurrence === "daily" && activity.scheduledTimes?.some((t: string) => t === nowTime);
    const matchesWeekly =
      activity.recurrence === "weekly" &&
      activity.scheduledTimes?.some((t: string) => t.toLowerCase().startsWith(today));
    return matchesDaily || matchesWeekly;
  });
}

export interface ActivityFilters {
  goalId?: string;
  category?: string;
  type?: ActivityType;
  scheduledDate?: string; // e.g., "monday" or "08:00" match
}

let _cachedAllActivities: GoalActivity[] | null = null;

export async function getAllActivities(filters?: ActivityFilters): Promise<GoalActivity[]> {
  const clauses: string[] = [];
  const params: any[] = [];

  if (!filters && _cachedAllActivities) return _cachedAllActivities;

  if (filters?.goalId) {
    clauses.push("goalId = ?");
    params.push(filters.goalId);
  }
  if (filters?.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  if (filters?.type) {
    clauses.push("type = ?");
    params.push(filters.type);
  }
  if (filters?.scheduledDate) {
    clauses.push("scheduledTimes LIKE ?");
    params.push(`%${filters.scheduledDate}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await localDb.getAllAsync<any>(`SELECT * FROM activities ${where}`, params);
  const parsed = rows.map(deserializeActivity);
  if (!filters) _cachedAllActivities = parsed;
  return parsed;
}

function deserializeActivity(row: any): GoalActivity {
  try {
    const base = {
      ...row,
      notificationsEnabled: !!row.notificationsEnabled,
      scheduledTimes: JSON.parse(row.scheduledTimes ?? "[]"),
      completionPrompts: JSON.parse(row.completionPrompts ?? "[]"),
      reliesOn: JSON.parse(row.reliesOn ?? "[]"),
      unlockParams: JSON.parse(row.unlockParams ?? "{}"),
      meta: JSON.parse(row.meta ?? "{}"),
      steps: JSON.parse(row.steps),
    };

    return base as GoalActivity;
  } catch (error) {
    console.error("Error deserializing activity:", error);
    return row;
  }
}
