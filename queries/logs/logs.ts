import { scheduleNotificationWithStats } from "@/utils/notifications";
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
        notes TEXT
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
  createdAt: number;
}

export const saveExerciseLog = async (slug: string, duration: number, routineId: number) => {
  const userEmail = await getCurrentUserEmail();
  db.runAsync(`INSERT INTO logs (type, routineId, slug, duration, userEmail) VALUES ("exercise", ?, ?, ?, ?)`, [
    routineId,
    slug,
    duration,
    userEmail,
  ])
    .catch((err) => {
      console.error("Error saving exercise log", err);
    })
    .finally(() => {
      scheduleNotificationWithStats();
    });
};

export interface TaskLog {
  id: number;
  routineId: number;
  slug: string;
  type: "task";
  notes: string;
  createdAt: number;
}
export const saveTaskLog = async (slug: string, routineId: number, note?: string) => {
  const userEmail = await getCurrentUserEmail();
  db.runAsync(`INSERT INTO logs (type, slug, routineId, notes, userEmail) VALUES ("task", ?, ?, ?, ?)`, [
    slug,
    routineId,
    note ?? "",
    userEmail,
  ])
    .catch((err) => {
      console.error("Error saving task log", err);
    })
    .finally(() => {
      scheduleNotificationWithStats();
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
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE userEmail = ? ORDER BY createdAt DESC;`, [
    userEmail,
  ])) as Log[];
  return rows;
};

export const getLogsBySlug = async (slug: string, callback?: (rows: ExerciseLog[]) => void) => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE slug = ? AND userEmail = ? ORDER BY createdAt DESC;`, [
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
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE userEmail = ? AND createdAt >= ? AND createdAt < ?;`, [
    userEmail,
    startOfDay,
    endOfDay,
  ])) as Log[];
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
  return db
    .runAsync(`INSERT INTO photo_logs (routineId, photos, notes, userEmail) VALUES (?, ?, ?, ?)`, [
      log.routineId,
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
    })
    .finally(() => {
      scheduleNotificationWithStats();
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
