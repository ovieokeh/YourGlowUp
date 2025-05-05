import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("face-symmetry.db");

export const initLogsTable = () => {
  // drop the table if it exists
  // db.execSync("DROP TABLE IF EXISTS logs;");
  // create the table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- "exercise" | "user"
        exercise TEXT,
        duration INTEGER,
        dominantSide TEXT,
        chewingDuration INTEGER,
        gumUsed INTEGER,
        gumChewingDuration INTEGER,
        symmetryRating INTEGER,
        notes TEXT,
        photoUri TEXT,
        completedAt TEXT NOT NULL
    );`
  );
};

export const saveExerciseLog = (exercise: string, duration: number) => {
  const now = new Date().toISOString();
  db.runSync(`INSERT INTO logs (type, exercise, duration, completedAt) VALUES ("exercise", ?, ?, ?)`, [
    exercise,
    duration,
    now,
  ]);
};

export interface UserLogCreate {
  dominantSide: string;
  chewingDuration: number;
  gumUsed: boolean;
  gumChewingDuration?: number;
  symmetryRating: number;
  notes?: string;
  photoUri?: string;
}
export interface UserLog extends UserLogCreate {
  id: number;
  type: "user";
  completedAt: string;
}
export const saveUserLog = async (log: UserLogCreate) => {
  const now = new Date().toISOString();
  console.log("Saving user log", log);
  return db.runAsync(
    `INSERT INTO logs 
       (type, dominantSide, chewingDuration, gumUsed, gumChewingDuration, symmetryRating, notes, photoUri, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      "user",
      log.dominantSide,
      log.chewingDuration,
      log.gumUsed ? 1 : 0,
      log.gumChewingDuration || 0,
      log.symmetryRating,
      log.notes || "",
      log.photoUri || "",
      now,
    ]
  );
};

export interface ExerciseLog {
  id: number;
  type: "exercise";
  exercise: string;
  duration: number;
  completedAt: string;
}

export type Log = UserLog | ExerciseLog;
export const isUserLog = (log: Log): log is UserLog => {
  return log.type === "user";
};
export const isExerciseLog = (log: Log): log is ExerciseLog => {
  return log.type === "exercise";
};

export const getLogs = (callback: (rows: Log[]) => void) => {
  const rows = db.getAllSync(`SELECT * FROM logs ORDER BY completedAt DESC;`) as ExerciseLog[];
  callback(rows);
};
