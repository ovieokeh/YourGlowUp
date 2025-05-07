import { db } from "../../utils/db";

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
        routineId TEXT,
        type TEXT NOT NULL, -- "exercise" | "task"
        exercise TEXT,
        task TEXT,
        duration INTEGER,
        dominantSide TEXT,
        chewingDuration INTEGER,
        gumUsed INTEGER,
        gumChewingDuration INTEGER,
        symmetryRating INTEGER,
        notes TEXT,
        photoUri TEXT,
        transform TEXT,
        completedAt TEXT NOT NULL
    );`
  );

  db.execSync(
    `CREATE TABLE IF NOT EXISTS photo_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId TEXT NOT NULL,
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
  type: "exercise";
  exercise: string;
  duration: number;
  completedAt: string;
}

export const saveExerciseLog = async (exercise: string, duration: number, routineId: string = "") => {
  const now = new Date().toISOString();
  db.runAsync(`INSERT INTO logs (type, routineId, exercise, duration, completedAt) VALUES ("exercise", ?, ?, ?, ?)`, [
    routineId,
    exercise,
    duration,
    now,
  ]).catch((err) => {
    console.error("Error saving exercise log", err);
  });
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
  const now = new Date().toISOString();
  return db
    .runAsync(`INSERT INTO photo_logs (routineId, createdAt, photos, notes) VALUES (?, ?, ?, ?)`, [
      log.routineId,
      now,
      JSON.stringify({
        front: log.front,
        left: log.left,
        right: log.right,
      }),
      log.notes ?? "",
    ])
    .catch((err) => {
      console.error("Error saving photo log", err);
    });
};

export const getPhotoLogs = async (routineId: string) => {
  const rows = (await db.getAllAsync(`SELECT * FROM photo_logs WHERE routineId = ? ORDER BY createdAt DESC;`, [
    routineId,
  ])) as PhotoLog[];
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

export interface TaskLog {
  id: number;
  type: "task";
  task: string;
  notes: string;
  completedAt: string;
}
export const saveTaskLog = async (task: string, note?: string) => {
  const now = new Date().toISOString();
  db.runAsync(`INSERT INTO logs (type, task, notes, completedAt) VALUES ("task", ?, ?, ?)`, [task, note ?? "", now]);
};

export type Log = ExerciseLog | TaskLog;

export const isExerciseLog = (log: Log): log is ExerciseLog => {
  return log.type === "exercise";
};
export const isTaskLog = (log: Log): log is TaskLog => {
  return log.type === "task";
};

export const getLogs = async () => {
  const rows = (await db.getAllAsync(`SELECT * FROM logs ORDER BY completedAt DESC;`)) as Log[];
  return rows;
};

export const getLogsByExercise = async (exercise: string, callback?: (rows: ExerciseLog[]) => void) => {
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE exercise = ? ORDER BY completedAt DESC;`, [
    exercise,
  ])) as ExerciseLog[];
  if (callback)
    // Check if callback is defined before calling it

    callback(rows);

  return rows;
};

export const getLogsByTask = async (task: string, callback?: (rows: TaskLog[]) => void) => {
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE task = ? ORDER BY completedAt DESC;`, [
    task,
  ])) as TaskLog[];
  if (callback)
    // Check if callback is defined before calling it

    callback(rows);

  return rows;
};
