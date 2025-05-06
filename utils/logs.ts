import { db } from "./db";

export const initLogsTable = () => {
  // drop the table if it exists
  // db.execSync("DROP TABLE IF EXISTS logs;");
  // create the table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId TEXT,
        type TEXT NOT NULL, -- "exercise" | "user" | "task"
        exercise TEXT,
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

export interface UserLogCreate {
  dominantSide: string;
  chewingDuration: number;
  gumUsed: boolean;
  gumChewingDuration?: number;
  symmetryRating: number;
  notes?: string;
  photoUri?: string;
  transform?: {
    scale: number;
    x: number;
    y: number;
  };
}
export interface UserLog extends UserLogCreate {
  id: number;
  type: "user";
  completedAt: string;
}
export const saveUserLog = async (log: UserLogCreate) => {
  const now = new Date().toISOString();
  return db.runAsync(
    `INSERT INTO logs 
       (type, dominantSide, chewingDuration, gumUsed, gumChewingDuration, symmetryRating, notes, photoUri, transform, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      "user",
      log.dominantSide,
      log.chewingDuration,
      log.gumUsed ? 1 : 0,
      log.gumChewingDuration || 0,
      log.symmetryRating,
      log.notes || "",
      log.photoUri || "",
      log.transform ? JSON.stringify(log.transform) : "",
      now,
    ]
  );
};

export interface TaskLog {
  id: number;
  type: "task";
  task: string;
  completedAt: string;
}
export const saveTaskLog = (task: string) => {
  const now = new Date().toISOString();
  db.runSync(`INSERT INTO logs (type, task, completedAt) VALUES ("task", ?, ?)`, [task, now]);
};

export type Log = UserLog | ExerciseLog | TaskLog;
export const isUserLog = (log: Log): log is UserLog => {
  return log.type === "user";
};
export const isExerciseLog = (log: Log): log is ExerciseLog => {
  return log.type === "exercise";
};
export const isTaskLog = (log: Log): log is TaskLog => {
  return log.type === "task";
};

export const getLogs = (callback?: (rows: Log[]) => void) => {
  const rows = db.getAllSync(`SELECT * FROM logs ORDER BY completedAt DESC;`) as Log[];
  const processed = rows.map((row) => {
    if (row && isUserLog(row)) {
      return {
        ...row,
        transform: row.transform ? JSON.parse(row.transform as unknown as string) : undefined,
      };
    } else if (isExerciseLog(row)) {
      return {
        ...row,
        exercise: row.exercise || "",
      };
    }
    return row;
  });
  if (callback)
    // Check if callback is defined before calling it

    callback(processed);

  return processed;
};
