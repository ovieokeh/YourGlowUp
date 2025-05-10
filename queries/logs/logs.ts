import { db } from "../../utils/db";
import { getCurrentUserEmail } from "../shared";

export const initLogsTable = (reset?: boolean) => {
  if (reset) {
    // drop the table if it exists
    db.execSync("DROP TABLE IF EXISTS logs;");
    db.execSync("DROP TABLE IF EXISTS photo_logs;");
  }
  // create the table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId INTEGER NOT NULL,
        userEmail TEXT NOT NULL,
        slug TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL, -- "exercise" | "task"
        duration INTEGER,
        dominantSide TEXT,
        chewingDuration INTEGER,
        gumUsed INTEGER,
        gumChewingDuration INTEGER,
        symmetryRating INTEGER,
        notes TEXT,
        completedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );`
  );

  db.execSync(
    `CREATE TABLE IF NOT EXISTS photo_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId INTEGER NOT NULL,
        userEmail TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        photos TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT "photo",
        notes TEXT
      )
    `
  );
};

export interface ExerciseLog {
  id: number;
  routineId: number;
  slug: string;
  type: "exercise";
  duration: number;
  completedAt: number;
}

export const saveExerciseLog = async (slug: string, duration: number, routineId: number) => {
  const userEmail = await getCurrentUserEmail();
  const nowEpoch = new Date();
  const now = nowEpoch.getTime();
  db.runAsync(
    `INSERT INTO logs (type, routineId, slug, duration, completedAt, userEmail) VALUES ("exercise", ?, ?, ?, ?)`,
    [routineId, slug, duration, now, userEmail]
  ).catch((err) => {
    console.error("Error saving exercise log", err);
  });
};

export interface TaskLog {
  id: number;
  routineId: number;
  slug: string;
  type: "task";
  notes: string;
  completedAt: number;
}
export const saveTaskLog = async (task: string, routineId: number, note?: string) => {
  const userEmail = await getCurrentUserEmail();
  const now = new Date().getTime();
  db.runAsync(`INSERT INTO logs (type, task, routineId, notes, completedAt, userEmail) VALUES ("task", ?, ?, ?, ?)`, [
    task,
    routineId,
    note ?? "",
    now,
    userEmail,
  ]).catch((err) => {
    console.error("Error saving task log", err);
  });
};

export type Log = ExerciseLog | TaskLog;

export const isExerciseLog = (log: Log): log is ExerciseLog => {
  return log.type === "exercise";
};
export const isTaskLog = (log: Log): log is TaskLog => {
  return log.type === "task";
};

export const getLogs = async () => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE userEmail = ? ORDER BY completedAt DESC;`, [
    userEmail,
  ])) as Log[];
  return rows;
};

export const getLogsBySlug = async (slug: string, callback?: (rows: ExerciseLog[]) => void) => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE slug = ? AND userEmail = ? ORDER BY completedAt DESC;`, [
    slug,
    userEmail,
  ])) as ExerciseLog[];
  if (callback) callback(rows);

  return rows;
};

export const getTodayLogs = async () => {
  const userEmail = await getCurrentUserEmail();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const rows = (await db.getAllAsync(
    `SELECT * FROM logs WHERE userEmail = ? AND completedAt >= ? AND completedAt < ?;`,
    [userEmail, startOfDay, endOfDay]
  )) as Log[];
  return rows;
};

export interface PhotoLogTransform {
  scale: number;
  x: number;
  y: number;
}
export interface PhotoLogCreate {
  front: { uri: string; transform?: PhotoLogTransform } | null;
  left: { uri: string; transform?: PhotoLogTransform } | null;
  right: { uri: string; transform?: PhotoLogTransform } | null;
  notes?: string;
}
export interface PhotoLog {
  id: number;
  routineId: string;
  type: "user";
  createdAt: string;
  photos: PhotoLogCreate;
}
export const savePhotoLog = async (
  log: PhotoLogCreate & {
    routineId: string;
  }
) => {
  const userEmail = await getCurrentUserEmail();
  const now = new Date().toISOString();
  return db
    .runAsync(`INSERT INTO photo_logs (routineId, createdAt, photos, notes, userEmail) VALUES (?, ?, ?, ?, ?)`, [
      log.routineId,
      now,
      JSON.stringify({
        front: log.front,
        left: log.left,
        right: log.right,
      }),
      log.notes ?? "",
      userEmail,
    ])
    .catch((err) => {
      console.error("Error saving photo log", err);
    });
};

export const getPhotoLogs = async (routineId: string) => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(
    `SELECT * FROM photo_logs WHERE routineId = ? AND userEmail = ? ORDER BY createdAt DESC;`,
    [routineId, userEmail]
  )) as PhotoLog[];
  return rows.map((row) => {
    if (row && row.photos) {
      return {
        ...row,
        photos: JSON.parse(row.photos as unknown as string) as PhotoLogCreate,
      };
    }
    return row;
  });
};
