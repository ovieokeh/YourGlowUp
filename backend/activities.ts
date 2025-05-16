import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { localDb } from "./localDb";
import {
  Activity,
  ActivityCreateInput,
  ActivityScheduleCreateInput,
  ActivityScheduleEntry,
  NotificationRecurrence,
} from "./shared"; // Assuming shared types are in './shared'

// Helper function to filter out nulls from arrays
function nonNullable<T>(value: T | null): value is T {
  return value !== null;
}

let _cachedAllActivities: Activity[] | null = null;

/**
 * Fetches schedule entries for a given list of activity IDs.
 */
async function fetchSchedulesForActivities(activityIds: string[]): Promise<Map<string, ActivityScheduleEntry[]>> {
  const schedulesMap = new Map<string, ActivityScheduleEntry[]>();
  if (activityIds.length === 0) {
    return schedulesMap;
  }

  try {
    const placeholders = activityIds.map(() => "?").join(",");
    const scheduleRows = await localDb.getAllAsync<ActivityScheduleEntry>(
      `SELECT * FROM activity_schedules WHERE activityId IN (${placeholders})`,
      activityIds
    );

    for (const row of scheduleRows) {
      const existing = schedulesMap.get(row.activityId) ?? [];
      existing.push(row);
      schedulesMap.set(row.activityId, existing);
    }
  } catch (error: unknown) {
    console.error("Error fetching schedules for activities:", error);
    // Propagate error as fetching schedules is crucial
    throw error;
  }
  return schedulesMap;
}

/**
 * Deserializes a raw DB row from the 'activities' table into a Activity object.
 * Does NOT populate the 'schedules' field - that requires a separate step.
 */
function deserializeActivity(row: any): Activity | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  if (!row.id || typeof row.steps === "undefined" || row.steps === null) {
    return null;
  }

  try {
    const completionPrompts = JSON.parse(row.completionPrompts ?? "[]");
    const reliesOn = JSON.parse(row.reliesOn ?? "[]");
    const unlockParams = JSON.parse(row.unlockParams ?? "{}");
    const meta = JSON.parse(row.meta ?? "{}");
    const steps = JSON.parse(row.steps);

    const base = {
      ...row,
      notificationsEnabled: !!row.notificationsEnabled,
      completionPrompts,
      reliesOn,
      unlockParams,
      meta,
      steps,
      schedules: [],
    };

    return base as Activity;
  } catch (error: unknown) {
    console.error(`Error deserializing activity JSON (id: ${row.id}):`, error, "\nRow data:", row);
    return null;
  }
}

// --- ADD HELPER for managing schedules during add/update ---
async function syncActivitySchedules(
  activityId: string,
  recurrence: NotificationRecurrence | undefined,
  schedulesInput: ActivityScheduleCreateInput[] | undefined
): Promise<void> {
  // 1. Delete existing schedules for this activity
  await localDb.runAsync(`DELETE FROM activity_schedules WHERE activityId = ?`, [activityId]);

  // 2. Insert new schedules if provided
  if (schedulesInput && schedulesInput.length > 0) {
    const insertStmt = `INSERT INTO activity_schedules (id, activityId, timeOfDay, dayOfWeek) VALUES (?, ?, ?, ?);`;
    // Prepare batch insert if localDb supports it, otherwise loop
    for (const schedule of schedulesInput) {
      // Validate dayOfWeek based on recurrence
      const dayOfWeek = recurrence === NotificationRecurrence.WEEKLY ? schedule.dayOfWeek : null;
      if (recurrence === NotificationRecurrence.WEEKLY && schedule.dayOfWeek === undefined) {
        console.warn(
          `Activity ${activityId} has weekly recurrence but schedule entry ${schedule.timeOfDay} is missing dayOfWeek.`
        );
        // Decide: skip this entry or throw error? Let's skip for now.
        continue;
      }
      // Basic HH:MM format validation could be added here
      const scheduleId = uuidv4();
      await localDb.runAsync(insertStmt, [
        scheduleId,
        activityId,
        schedule.timeOfDay,
        dayOfWeek ?? null, // Use null for daily recurrence
      ]);
    }
    // Consider using localDb.execAsync or batchAsync if available for performance
  }
}

// --- MODIFY addActivity ---
export async function addActivity(goalId: string, activityInput: ActivityCreateInput): Promise<string | null> {
  const activityId = uuidv4();
  // Note: activityInput includes the new `schedules` field, but not `id` or `goalId` yet
  const { schedules, ...activityData } = activityInput; // Separate schedule data

  const stmt = `INSERT INTO activities (
    id, goalId, slug, name, description, featuredImage, category,
    notificationsEnabled, recurrence, completionPrompts,
    steps, reliesOn, unlockCondition, unlockParams, meta
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`; // Adjust parameter count

  try {
    // Perform insertion in a transaction if possible

    await localDb.runAsync(stmt, [
      // Use tx.runAsync inside transaction
      activityId,
      goalId,
      activityData.slug,
      activityData.name,
      activityData.description,
      activityData.featuredImage ?? null,
      activityData.category,
      activityData.notificationsEnabled ? 1 : 0,
      activityData.recurrence ?? null,
      JSON.stringify(activityData.completionPrompts ?? []),
      JSON.stringify(activityData.steps), // FIXME: Steps data missing from ActivityCreateInput? Assuming empty for now.
      JSON.stringify(activityData.reliesOn ?? []),
      activityData.unlockCondition ?? null,
      JSON.stringify(activityData.unlockParams ?? {}),
      JSON.stringify(activityData.meta ?? {}),
    ]);

    // Sync schedules (pass recurrence from input)
    await syncActivitySchedules(activityId, activityData.recurrence, schedules);

    _cachedAllActivities = null; // Invalidate cache
    return activityId;
  } catch (error: unknown) {
    console.error(`Error adding activity (goalId: ${goalId}, slug: ${activityData.slug}):`, error);
    return null;
  }
}

// --- MODIFY updateActivity ---
export async function updateActivity(goalId: string, activity: Activity): Promise<void> {
  if (!activity.id) {
    throw new Error("Cannot update activity without an ID.");
  }

  const { schedules, ...activityData } = activity; // Separate schedules

  const stmt = `UPDATE activities SET
    slug = ?, name = ?, description = ?, featuredImage = ?, category = ?,
    notificationsEnabled = ?, recurrence = ?, completionPrompts = ?,
    steps = ?, reliesOn = ?, unlockCondition = ?, unlockParams = ?, meta = ?
    WHERE id = ? AND goalId = ?;`; // Adjust parameter count

  try {
    // Perform update in a transaction if possible
    // await localDb.transactionAsync(async (tx) => { // Conceptual transaction

    await localDb.runAsync(stmt, [
      // Use tx.runAsync inside transaction
      activityData.slug,
      activityData.name,
      activityData.description,
      activityData.featuredImage ?? null,
      activityData.category,
      activityData.notificationsEnabled ? 1 : 0,
      // scheduledTimes removed
      activityData.recurrence ?? null,
      JSON.stringify(activityData.completionPrompts ?? []),
      JSON.stringify(activityData.steps),
      JSON.stringify(activityData.reliesOn ?? []),
      activityData.unlockCondition ?? null,
      JSON.stringify(activityData.unlockParams ?? {}),
      JSON.stringify(activityData.meta ?? {}),
      activityData.id, // WHERE clause parameter
      goalId, // WHERE clause parameter
    ]);

    // Sync schedules (activityData includes 'id' and 'recurrence')
    await syncActivitySchedules(activityData.id, activityData.recurrence, schedules);

    // }); // End conceptual transaction

    _cachedAllActivities = null; // Invalidate cache
  } catch (error: unknown) {
    console.error(`Error updating activity ${activity.id}:`, error);
    throw error;
  }
}

// --- MODIFY removeActivity ---
export async function removeActivity(activityId: string): Promise<void> {
  try {
    // Assuming ON DELETE CASCADE handles deletion from activity_schedules.
    // If not, delete from activity_schedules first:
    // await localDb.runAsync(`DELETE FROM activity_schedules WHERE activityId = ?`, [activityId]);
    await localDb.runAsync(`DELETE FROM activities WHERE id = ?`, [activityId]);
    _cachedAllActivities = null; // Invalidate cache
  } catch (error: unknown) {
    console.error(`Error removing activity ${activityId}:`, error);
    throw error;
  }
}

// --- MODIFY Fetching Functions ---

// Get all activities for a specific goal, now includes schedules
export async function getActivities(goalId: string): Promise<Activity[]> {
  try {
    // 1. Fetch base activities
    const rows = await localDb.getAllAsync<any>(`SELECT * FROM activities WHERE goalId = ?`, [goalId]);
    const activities = rows.map(deserializeActivity).filter(nonNullable);
    const activityIds = activities.map((a) => a.id);

    // 2. Fetch schedules for these activities
    const schedulesMap = await fetchSchedulesForActivities(activityIds);

    // 3. Combine schedules with activities
    activities.forEach((activity) => {
      activity.schedules = schedulesMap.get(activity.id) ?? [];
    });

    return activities;
  } catch (error: unknown) {
    console.error(`Error fetching activities for goalId ${goalId}:`, error);
    throw error;
  }
}

export async function getActivitiesSnapshot(goalId: string): Promise<{
  count: number;
}> {
  try {
    console.log("getActivitiesSnapshot", goalId);
    const row = await localDb.getFirstAsync<any>(`SELECT COUNT(*) as count FROM activities WHERE goalId = ?`, [goalId]);
    console.log("getActivitiesSnapshot", row);
    if (!row) return { count: 0 };
    return { count: row.count };
  } catch (error: unknown) {
    console.error(`Error fetching activities snapshot for goalId ${goalId}:`, error);
    throw error;
  }
}
// Get single activity by ID, now includes schedules
export async function getActivityById(activityId: string): Promise<Activity | null> {
  try {
    // 1. Fetch base activity
    const row = await localDb.getFirstAsync<any>(`SELECT * FROM activities WHERE id = ?`, [activityId]);
    if (!row) return null;
    const activity = deserializeActivity(row);
    if (!activity) return null; // Handle deserialization failure

    // 2. Fetch schedules
    const schedulesMap = await fetchSchedulesForActivities([activity.id]);
    activity.schedules = schedulesMap.get(activity.id) ?? [];

    return activity;
  } catch (error: unknown) {
    console.error(`Error fetching activity by id ${activityId}:`, error);
    throw error;
  }
}

// Get single activity by slug, now includes schedules
export async function getActivityBySlug(goalId: string, slug: string): Promise<Activity | null> {
  try {
    // 1. Fetch base activity
    const row = await localDb.getFirstAsync<any>(`SELECT * FROM activities WHERE goalId = ? AND slug = ?`, [
      goalId,
      slug,
    ]);
    if (!row) return null;
    const activity = deserializeActivity(row);
    if (!activity) return null;

    // 2. Fetch schedules
    const schedulesMap = await fetchSchedulesForActivities([activity.id]);
    activity.schedules = schedulesMap.get(activity.id) ?? [];

    return activity;
  } catch (error: unknown) {
    console.error(`Error fetching activity by slug (goalId: ${goalId}, slug: ${slug}):`, error);
    throw error;
  }
}

// Gets *all* activities matching filters, potentially hitting cache, includes schedules
export async function getAllActivities(filters?: ActivityFilters): Promise<Activity[]> {
  // ** Caching Note **: The simple cache might become less effective if filters often change.
  // It now needs to store activities *with* schedules. Fetching schedules adds overhead.
  // Consider if caching is still needed or requires a more sophisticated strategy.
  if (!filters && _cachedAllActivities) {
    return _cachedAllActivities;
  }

  // Build WHERE clause for 'activities' table based on filters
  const clauses: string[] = [];
  const params: any[] = [];
  if (filters?.goalId) {
    clauses.push("goalId = ?");
    params.push(filters.goalId);
  }
  if (filters?.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  // Filter by scheduledDate using LIKE is no longer directly possible/meaningful here.
  // You would need to JOIN with activity_schedules or filter in JS.
  // Let's remove the scheduledDate filter from here for now.
  // if (filters?.scheduledDate) { ... }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  try {
    // 1. Fetch filtered base activities
    const rows = await localDb.getAllAsync<any>(`SELECT * FROM activities ${where}`, params);
    const activities = rows.map(deserializeActivity).filter(nonNullable);
    const activityIds = activities.map((a) => a.id);

    // 2. Fetch schedules for these activities
    const schedulesMap = await fetchSchedulesForActivities(activityIds);

    // 3. Combine schedules with activities
    activities.forEach((activity) => {
      activity.schedules = schedulesMap.get(activity.id) ?? [];
    });

    // Update cache only if no filters were applied
    if (!filters) {
      _cachedAllActivities = activities;
    }
    return activities;
  } catch (error: unknown) {
    console.error("Error fetching all activities with filters:", error);
    throw error;
  }
}

// --- MODIFY getPendingActivities ---
// Gets pending activities, optionally filtered by goalId. Excludes completed IDs.
// Now also fetches associated schedules.
export async function getPendingActivities(completedActivityIds: string[], goalId?: string): Promise<Activity[]> {
  let stmt = `SELECT * FROM activities`; // Select from activities table
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (goalId) {
    whereClauses.push("goalId = ?");
    params.push(goalId);
  }
  if (completedActivityIds.length > 0) {
    const placeholders = completedActivityIds.map(() => "?").join(",");
    whereClauses.push(`id NOT IN (${placeholders})`);
    params.push(...completedActivityIds);
  }
  if (whereClauses.length > 0) {
    stmt += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  try {
    // 1. Fetch matching base activities
    const rows = await localDb.getAllAsync<any>(stmt, params);
    const activities = rows.map(deserializeActivity).filter(nonNullable);
    const activityIds = activities.map((a) => a.id);

    // 2. Fetch schedules
    const schedulesMap = await fetchSchedulesForActivities(activityIds);

    // 3. Combine
    activities.forEach((activity) => {
      activity.schedules = schedulesMap.get(activity.id) ?? [];
    });

    return activities;
  } catch (error: unknown) {
    console.error(`Error fetching pending activities (goalId: ${goalId ?? "all"}):`, error);
    throw error;
  }
}

// --- REIMPLEMENT getPendingActivitiesToday ---
// This now performs the primary filtering using SQL JOINs.
export async function getPendingActivitiesToday(completedActivityIds: string[], goalId?: string): Promise<Activity[]> {
  // Need current day (ISO 1-7) and time (HH:MM) for the query
  const now = new Date();
  // Adjust day calculation: JavaScript's getDay() is 0=Sun, 6=Sat. ISO is 1=Mon, 7=Sun.
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Convert to ISO weekday
  // Format time carefully, ensuring leading zeros
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const nowTime = `${hours}:${minutes}`; // HH:MM format

  // Base query joins activities and schedules
  // We select activity fields directly to avoid fetching schedule fields we don't need here,
  // but we still need to fetch the full activity data including schedules later.
  // Strategy: Find the IDs of activities that match the schedule criteria, then fetch those full activities.

  const baseQuery = `
        SELECT DISTINCT a.id
        FROM activities a
        JOIN activity_schedules s ON a.id = s.activityId
    `;
  const whereClauses: string[] = [];
  const params: any[] = [];

  // --- Time/Day Filtering ---
  // Matches if (Recurrence is Daily AND Time matches) OR (Recurrence is Weekly AND Day+Time matches)
  whereClauses.push(`
        (
            (a.recurrence = ? AND s.dayOfWeek IS NULL AND s.timeOfDay = ?) OR
            (a.recurrence = ? AND s.dayOfWeek = ? AND s.timeOfDay = ?)
        )
    `);
  params.push(
    NotificationRecurrence.DAILY,
    nowTime, // Params for daily check
    NotificationRecurrence.WEEKLY,
    currentDayOfWeek,
    nowTime // Params for weekly check
  );

  // --- Optional Goal ID Filter ---
  if (goalId) {
    whereClauses.push("a.goalId = ?");
    params.push(goalId);
  }

  // --- Completed Activities Filter ---
  if (completedActivityIds.length > 0) {
    const placeholders = completedActivityIds.map(() => "?").join(",");
    whereClauses.push(`a.id NOT IN (${placeholders})`);
    params.push(...completedActivityIds);
  }

  const finalQuery = `${baseQuery} WHERE ${whereClauses.join(" AND ")}`;

  try {
    // 1. Find the IDs of activities matching the schedule criteria
    const matchingIdRows = await localDb.getAllAsync<{ id: string }>(finalQuery, params);
    const matchingActivityIds = matchingIdRows.map((row) => row.id);

    if (matchingActivityIds.length === 0) {
      return []; // No activities match the criteria
    }

    // 2. Fetch the full details (including schedules) for these specific activities
    // We use a simplified WHERE clause here, just matching the IDs found.
    const activityPlaceholders = matchingActivityIds.map(() => "?").join(",");
    const activityRows = await localDb.getAllAsync<any>(
      `SELECT * FROM activities WHERE id IN (${activityPlaceholders})`,
      matchingActivityIds
    );
    const activities = activityRows.map(deserializeActivity).filter(nonNullable);

    // 3. Fetch schedules for these activities
    const schedulesMap = await fetchSchedulesForActivities(matchingActivityIds);

    // 4. Combine schedules with activities
    activities.forEach((activity) => {
      activity.schedules = schedulesMap.get(activity.id) ?? [];
    });

    return activities;
  } catch (error: unknown) {
    console.error(`Error fetching pending activities for today (goalId: ${goalId ?? "all"}):`, error);
    throw error;
  }
}

// Interface for filters remains the same, but scheduledDate filter is removed
export interface ActivityFilters {
  goalId?: string;
  category?: string;
  // scheduledDate?: string; // Removed - requires different handling now
}
