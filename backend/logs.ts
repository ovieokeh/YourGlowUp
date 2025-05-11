import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { localDb } from "./localDb";

import {
  ActivityLog,
  FeedbackLog,
  isActivityLog,
  isFeedbackLog,
  isMediaUploadLog,
  isPromptLog,
  isStepLog,
  Log,
  LogType,
  MediaUploadLog,
  PromptLog,
  StepLog,
} from "./shared";

export async function addActivityLog(log: Omit<ActivityLog, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, activityId, activityType, completedAt, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, log.userId, log.goalId, LogType.ACTIVITY, log.activityId, log.activityType, log.completedAt ?? null, createdAt]
  );
  return id;
}

export async function addPromptLog(log: Omit<PromptLog, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, activityId, sessionId, promptId, answerType, answer, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      log.userId,
      log.goalId,
      LogType.PROMPT,
      log.activityId,
      log.sessionId ?? null,
      log.promptId,
      log.answerType,
      JSON.stringify(log.answer),
      createdAt,
    ]
  );
  return id;
}

export async function addStepLog(log: Omit<StepLog, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, activityId, stepId, stepIndex, durationInSeconds, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      log.userId,
      log.goalId,
      LogType.STEP,
      log.activityId,
      log.stepId,
      log.stepIndex,
      log.durationInSeconds ?? null,
      createdAt,
    ]
  );
  return id;
}

export async function addMediaUploadLog(log: Omit<MediaUploadLog, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, media, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [id, log.userId, log.goalId, LogType.MEDIA_UPLOAD, JSON.stringify(log.media), createdAt]
  );
  return id;
}

export async function addFeedbackLog(log: Omit<FeedbackLog, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, authorType, authorId, feedback, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, log.userId, log.goalId, LogType.FEEDBACK, log.authorType, log.authorId, log.feedback, createdAt]
  );
  return id;
}

export async function addLog(log: Omit<Log, "id" | "createdAt">): Promise<string> {
  const id = uuidv4();

  if (isActivityLog(log as any)) {
    await addActivityLog({ ...log } as ActivityLog);
  } else if (isPromptLog(log as any)) {
    await addPromptLog({ ...log } as PromptLog);
  } else if (isStepLog(log as any)) {
    await addStepLog({ ...log } as StepLog);
  } else if (isMediaUploadLog(log as any)) {
    await addMediaUploadLog({ ...log } as MediaUploadLog);
  } else if (isFeedbackLog(log as any)) {
    await addFeedbackLog({ ...log } as FeedbackLog);
  } else {
    throw new Error(`Unknown log type: ${log.type}`);
  }
  return id;
}

export async function getLogs(goalId: string): Promise<Log[]> {
  const rows = await localDb.getAllAsync<any>(`SELECT * FROM logs WHERE goalId = ? ORDER BY createdAt DESC`, [goalId]);
  return rows.map(deserializeLog);
}

export async function getAllLogs(userId: string): Promise<Log[]> {
  const rows = await localDb.getAllAsync<any>(`SELECT * FROM logs WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows.map(deserializeLog);
}

export async function getTodayLogs(userId: string): Promise<Log[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const isoStart = startOfDay.toISOString();

  const rows = await localDb.getAllAsync<any>(
    `SELECT * FROM logs WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC`,
    [userId, isoStart]
  );
  return rows.map(deserializeLog);
}

export async function getTodayLogsByActivityId(userId: string, activityId: string): Promise<Log[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const isoStart = startOfDay.toISOString();

  const rows = await localDb.getAllAsync<any>(
    `SELECT * FROM logs WHERE userId = ? AND activityId = ? AND createdAt >= ? ORDER BY createdAt DESC`,
    [userId, activityId, isoStart]
  );
  return rows.map(deserializeLog);
}

function deserializeLog(row: any): Log {
  const base = {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    createdAt: row.createdAt,
    meta: row.meta ? JSON.parse(row.meta) : undefined,
  };

  switch (row.type) {
    case LogType.ACTIVITY:
      return {
        ...base,
        type: LogType.ACTIVITY,
        activityId: row.activityId,
        activityType: row.activityType,
        completedAt: row.completedAt,
      } as ActivityLog;
    case LogType.PROMPT:
      return {
        ...base,
        type: LogType.PROMPT,
        activityId: row.activityId,
        sessionId: row.sessionId ?? undefined,
        promptId: row.promptId,
        answerType: row.answerType,
        answer: row.answer ? JSON.parse(row.answer) : null,
      } as PromptLog;
    case LogType.STEP:
      return {
        ...base,
        type: LogType.STEP,
        activityId: row.activityId,
        stepId: row.stepId,
        stepIndex: row.stepIndex,
        durationInSeconds: row.durationInSeconds ?? undefined,
      } as StepLog;
    case LogType.MEDIA_UPLOAD:
      return {
        ...base,
        type: LogType.MEDIA_UPLOAD,
        media: row.media ? JSON.parse(row.media) : [],
      } as MediaUploadLog;
    case LogType.FEEDBACK:
      return {
        ...base,
        type: LogType.FEEDBACK,
        authorType: row.authorType,
        authorId: row.authorId,
        feedback: row.feedback,
      } as FeedbackLog;
    default:
      throw new Error(`Unknown log type: ${row.type}`);
  }
}
