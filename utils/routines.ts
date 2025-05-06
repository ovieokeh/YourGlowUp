import { db } from "./db";

export const initRoutinesLogsTable = () => {
  db.runSync(
    `
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routineId TEXT,
      addedAt TEXT,
      notificationTime TEXT,
      steps TEXT
  );

    CREATE TABLE IF NOT EXISTS routines_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine TEXT,
      completedAt TEXT
    );
    `
  );
};

export interface RoutineLog {
  id: string;
  routine: string;
  completedAt: string;
}

export const saveRoutineLog = (routine: string) => {
  const now = new Date().toISOString();
  db.runSync(`INSERT INTO routines_logs (routine, completedAt) VALUES (?, ?)`, [routine, now]);
};

export const fetchRoutineLogs = (): RoutineLog[] => {
  const rows = db.getAllSync(`SELECT * FROM routines_logs ORDER BY completedAt DESC;`) as RoutineLog[];
  return rows.map((row) => ({
    id: row.id,
    routine: row.routine,
    completedAt: row.completedAt,
  }));
};

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: string[];
  notificationTime: string;
}
export const addRoutine = (routine: Routine) => {
  db.runSync(`INSERT INTO routines (id, name, description, steps, notificationTime) VALUES (?, ?, ?, ?, ?)`, [
    routine.id,
    routine.name,
    routine.description,
    JSON.stringify(routine.steps),
    routine.notificationTime,
  ]);
};
export const removeRoutine = (routineId: string) => {
  db.runSync(`DELETE FROM routines_logs WHERE routine = ?`, [routineId]);
};
export const getUserRoutines = () => {
  const rows = db.getAllSync(`SELECT * FROM routines;`) as Routine[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    steps: JSON.parse(row.steps as unknown as string) as string[],
    notificationTime: row.notificationTime,
  }));
};
