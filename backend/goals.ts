import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { addActivity, getActivities } from "./activities";
import { localDb } from "./localDb";
import { Goal, GoalActivity, GoalBase, GoalCreateInput } from "./shared";

export async function addGoal(input: GoalCreateInput): Promise<string> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = `INSERT INTO goals (
    id, slug, name, description, featuredImage, category, tags,
    author_id, author_name, author_avatar, createdAt, updatedAt,
    isPublic, version, status, completionType, completionDate, defaultRecurrence, defaultScheduledTimes,
    progress, meta
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  await localDb.runAsync(stmt, [
    id,
    input.slug,
    JSON.stringify(input.name),
    JSON.stringify(input.description),
    input.featuredImage ?? null,
    input.category,
    JSON.stringify(input.tags),
    input.author.id,
    input.author.name,
    input.author.avatarUrl ?? null,
    now,
    now,
    input.isPublic ? 1 : 0,
    1, // version
    "draft", // status
    input.completionType,
    input.completionDate ?? null,
    input.defaultRecurrence ?? null,
    JSON.stringify(input.defaultScheduledTimes ?? []),
    JSON.stringify({}), // progress
    JSON.stringify({}), // meta
  ]);

  return id;
}

export async function removeGoal(goalId: string): Promise<void> {
  await localDb.runAsync(`DELETE FROM goals WHERE id = ?`, [goalId]);
}

export async function getGoalById(goalId: string): Promise<Goal | null> {
  const result = await localDb.getFirstAsync<GoalBase>(`SELECT * FROM goals WHERE id = ?`, [goalId]);
  if (!result) return null;
  const activities = await getActivities(goalId);
  return deserializeGoal(result, activities);
}

export interface GetGoalsOptions {
  mine?: boolean;
  copied?: boolean;
  public?: boolean;
}
export async function getGoals(currentUserId: string, opts?: GetGoalsOptions): Promise<Goal[]> {
  let query = `SELECT * FROM goals`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (opts?.mine) {
    conditions.push("author_id = ?");
    params.push(currentUserId);
  }

  if (opts?.public) {
    conditions.push("isPublic = 1");
  }

  if (opts?.copied) {
    conditions.push("author_id != ?");
    params.push(currentUserId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY updatedAt DESC`;

  const rows = await localDb.getAllAsync<GoalBase>(query, params);
  return rows.map((row) => {
    return deserializeGoal(row, []);
  });
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
  const now = new Date().toISOString();
  const existingGoal = await getGoalById(goalId);
  if (!existingGoal) {
    throw new Error("Goal not found");
  }

  const stmt = `UPDATE goals SET
    slug = ?, name = ?, description = ?, featuredImage = ?, category = ?, tags = ?,
    isPublic = ?, updatedAt = ?, completionType = ?, completionDate = ?, defaultRecurrence = ?, defaultScheduledTimes = ?,
    progress = ?, meta = ?
    WHERE id = ?;`;

  await localDb.runAsync(stmt, [
    updates.slug ?? existingGoal.slug,
    JSON.stringify(updates.name),
    JSON.stringify(updates.description),
    updates.featuredImage ?? existingGoal.featuredImage ?? null,
    updates.category ?? existingGoal.category,
    JSON.stringify(updates.tags ?? existingGoal.tags ?? []),
    updates.isPublic ? 1 : 0,
    now,
    updates.completionType ?? existingGoal.completionType,
    updates.completionDate ?? existingGoal.completionDate ?? null,
    updates.defaultRecurrence ?? existingGoal.defaultRecurrence ?? null,
    JSON.stringify(updates.defaultScheduledTimes ?? existingGoal.defaultScheduledTimes ?? []),
    JSON.stringify(updates.progress ?? existingGoal.progress ?? {}),
    JSON.stringify(updates.meta ?? existingGoal.meta ?? {}),
    goalId,
  ]);
}

export async function updateGoalActivities(goalId: string, activities: GoalActivity[]): Promise<void> {
  await localDb.runAsync(`DELETE FROM activities WHERE goalId = ?`, [goalId]);
  for (const activity of activities) {
    await addActivity(goalId, activity);
  }
}

export async function copyGoal(original: Goal, newOwnerId: string, newOwnerName: string): Promise<string> {
  const copiedGoal: GoalCreateInput = {
    slug: `${original.slug}-copy-${Date.now()}`,
    name: original.name,
    description: original.description,
    featuredImage: original.featuredImage,
    category: original.category,
    tags: original.tags,
    author: {
      id: newOwnerId,
      name: newOwnerName,
    },
    isPublic: false,
    defaultRecurrence: original.defaultRecurrence,
    defaultScheduledTimes: original.defaultScheduledTimes,
    completionType: original.completionType,
    completionDate: original.completionDate,
  };

  const newGoalId = await addGoal(copiedGoal);
  for (const activity of original.activities) {
    const newActivity = { ...activity, id: uuidv4() };
    await addActivity(newGoalId, newActivity);
  }
  return newGoalId;
}

function deserializeGoal(row: GoalBase, activities: GoalActivity[]): Goal {
  return {
    ...row,
    name: JSON.parse(row.name as any),
    description: JSON.parse(row.description as any),
    tags: JSON.parse(row.tags as any),
    author: {
      id: (row as any).author_id,
      name: (row as any).author_name,
      avatarUrl: (row as any).author_avatar ?? undefined,
    },
    createdAt: Date.parse(row.createdAt as any),
    updatedAt: Date.parse(row.updatedAt as any),
    isPublic: !!row.isPublic,
    defaultScheduledTimes: JSON.parse(row.defaultScheduledTimes as any),
    progress: row.progress ? JSON.parse(row.progress as any) : undefined,
    meta: row.meta ? JSON.parse(row.meta as any) : undefined,
    activities: [...(row.activities ?? []), ...activities],
    completionType: row.completionType,
    completionDate: (row as any).completionDate ? new Date((row as any).completionDate) : undefined,
  } as Goal;
}
