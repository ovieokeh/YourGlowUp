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
  LogCreateInput, // Assuming Log is a union type: ActivityLog | PromptLog | ...
  LogType,
  MediaUploadLog,
  PromptLog,
  StepLog,
} from "./shared"; // Ensure these types include id and createdAt

// --- Modified Specific Add Log Functions ---
// These functions now expect the full log object, including id and createdAt,
// and are primarily responsible for DB insertion. They no longer generate id/createdAt themselves.

export async function addActivityLog(log: ActivityLog): Promise<void> {
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, activityId, completedAt, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [log.id, log.userId, log.goalId, log.type, log.activityId, log.completedAt ?? null, log.createdAt]
  );
}

export async function addPromptLog(log: PromptLog): Promise<void> {
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, activityId, sessionId, promptId, answerType, answer, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      log.id,
      log.userId,
      log.goalId,
      log.type,
      log.activityId,
      log.sessionId ?? null,
      log.promptId,
      log.answerType,
      JSON.stringify(log.answer),
      log.createdAt,
    ]
  );
}

export async function addStepLog(log: Omit<StepLog, "id">): Promise<void> {
  await localDb
    .runAsync(
      `INSERT INTO logs (
      id, userId, goalId, type, activityId, stepId, stepIndex, durationInSeconds, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        uuidv4(),
        log.userId,
        log.goalId,
        log.type,
        log.activityId,
        log.stepId,
        log.stepIndex,
        log.durationInSeconds ?? null,
        new Date().toISOString(),
      ]
    )
    .catch((error) => {
      console.error("Error adding step log:", error);
      throw error; // Rethrow the error to be handled by the caller if needed
    });
}

export async function addMediaUploadLog(log: MediaUploadLog): Promise<void> {
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, media, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [log.id, log.userId, log.goalId, log.type, JSON.stringify(log.media), log.createdAt]
  );
}

export async function addFeedbackLog(log: FeedbackLog): Promise<void> {
  await localDb.runAsync(
    `INSERT INTO logs (
      id, userId, goalId, type, authorType, authorId, feedback, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [log.id, log.userId, log.goalId, log.type, log.authorType, log.authorId, log.feedback, log.createdAt]
  );
}

// --- Robust addLog Function ---
// This function is now the primary entry point for adding logs.
// It generates id and createdAt, then dispatches to the specific record insertion functions.

export async function addLog(logData: LogCreateInput): Promise<string> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  // The 'type' property must be present in logData for the type guards to work.
  // Omit<Log, "id" | "createdAt"> ensures this, as Log is a discriminated union by 'type'.
  const fullLogBase = { ...logData, id, createdAt };

  // Using `logData as Log` or `fullLogBase as Log` for type guards is appropriate here,
  // as they need to operate on the common structure of the Log union type (specifically the 'type' discriminant).
  // After the type guard, TypeScript will correctly narrow down the type of `fullLogBase` or `logData`.

  if (isActivityLog(fullLogBase as Log)) {
    // fullLogBase is now inferred as ActivityLog (or should be compatible)
    await addActivityLog(fullLogBase as ActivityLog);
  } else if (isPromptLog(fullLogBase as Log)) {
    await addPromptLog(fullLogBase as PromptLog);
  } else if (isStepLog(fullLogBase as Log)) {
    await addStepLog(fullLogBase as StepLog);
  } else if (isMediaUploadLog(fullLogBase as Log)) {
    await addMediaUploadLog(fullLogBase as MediaUploadLog);
  } else if (isFeedbackLog(fullLogBase as Log)) {
    await addFeedbackLog(fullLogBase as FeedbackLog);
  } else {
    // This case should ideally not be reached if Log is a comprehensive union
    // and logData.type is one of the known LogType values.
    throw new Error(`Unknown log type: ${(logData as any).type}`);
  }

  return id;
}

// --- Log Fetching (Unchanged from previous refactoring) ---
export interface GetLogsFilters {
  userId?: string;
  goalId?: string;
  activityId?: string;
  logType?: LogType;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

export async function getFilteredLogs(filters: GetLogsFilters): Promise<Log[]> {
  const queryParts: string[] = ["SELECT * FROM logs"];
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (filters.userId !== undefined) {
    whereClauses.push("userId = ?");
    params.push(filters.userId);
  }
  if (filters.goalId !== undefined) {
    whereClauses.push("goalId = ?");
    params.push(filters.goalId);
  }
  if (filters.activityId !== undefined) {
    whereClauses.push("activityId = ?");
    params.push(filters.activityId);
  }
  if (filters.logType !== undefined) {
    whereClauses.push("type = ?");
    params.push(filters.logType);
  }
  if (filters.startDate !== undefined) {
    whereClauses.push("createdAt >= ?");
    params.push(filters.startDate);
  }
  if (filters.endDate !== undefined) {
    whereClauses.push("createdAt <= ?");
    params.push(filters.endDate);
  }

  if (whereClauses.length > 0) {
    queryParts.push("WHERE " + whereClauses.join(" AND "));
  }

  queryParts.push("ORDER BY createdAt DESC");

  const finalQuery = queryParts.join(" ");
  const rows = await localDb.getAllAsync<any>(finalQuery, params);
  // console.log("Fetched logs:", JSON.stringify(rows, null, 2));
  return rows.map(deserializeLog);
}

function deserializeLog(row: any): Log {
  // console.log("Deserializing log row:", JSON.stringify(row, null, 2));
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
      console.error(`Unknown log type encountered during deserialization: ${row.type}`, row);
      throw new Error(`Unknown log type: ${row.type}`);
  }
}
