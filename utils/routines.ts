import { EXERCISES, TASKS } from "@/constants/Exercises";
import { db } from "./db";

export const initRoutinesTables = () => {
  // reset all tables
  // db.runSync(`DROP TABLE IF EXISTS routines;`);
  // db.runSync(`DROP TABLE IF EXISTS routine_items;`);
  // db.runSync(`DROP TABLE IF EXISTS routines_logs;`);

  db.runSync(
    `
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routineId TEXT,
      name TEXT,
      description TEXT,
      notificationTime TEXT,
      steps TEXT,
      addedAt TEXT
  );
  `
  );
  db.runSync(
    `
  CREATE TABLE IF NOT EXISTS routine_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId TEXT,
      routineId INTEGER,
      notificationTime TEXT DEFAULT NULL,
      addedAt TEXT
  );
  `
  );
  db.runSync(
    `
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
  id: number;
  routineId: string;
  name: string;
  description: string;
  steps: string[];
  notificationTime: string;
}

export interface RoutineItem {
  id: number;
  itemId: string;
  name: string;
  description: string;
  notificationTime: string | null;
  addedAt: string;
}
export interface RoutineWithItems extends Routine {
  items: RoutineItem[];
}
export const addRoutine = (routine: Omit<Routine, "id">) => {
  const items = routine.steps.map((itemId) => {
    const item = EXERCISES.find((e) => e.id === itemId) || TASKS.find((t) => t.id === itemId);
    if (!item) return null;

    const isTask = item.type === "task";
    const DEFAULT_NOTIFICATION_TIME = "09:00"; // Default time for tasks
    const notificationTime = isTask ? DEFAULT_NOTIFICATION_TIME : null;

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      notificationTime,
      addedAt: new Date().toISOString(),
    };
  });

  db.runSync(`INSERT INTO routines (routineId, name, description, steps, notificationTime) VALUES (?, ?, ?, ?, ?)`, [
    routine.routineId,
    routine.name,
    routine.description,
    JSON.stringify(routine.steps),
    routine.notificationTime,
  ]);

  items.forEach((item) => {
    if (item) {
      db.runSync(`INSERT INTO routine_items (itemId, routineId, notificationTime, addedAt) VALUES (?, ?, ?, ?)`, [
        item.id,
        routine.routineId,
        item.notificationTime,
        item.addedAt,
      ]);
    }
  });
};
export const removeRoutine = (routineId: string) => {
  db.runSync(`DELETE FROM routines_logs WHERE routine = ?`, [routineId]);
};
export const getUserRoutines = async () => {
  const rows = (await db.getAllAsync(`SELECT * FROM routines;`)) as RoutineWithItems[];
  const mappedRows = rows.map((row) => ({
    ...row,
    steps: JSON.parse(row.steps as unknown as string) as string[],
  }));

  for (const routine of mappedRows) {
    const items = (await db.getAllAsync(`SELECT * FROM routine_items WHERE routineId = ?`, [
      routine.routineId,
    ])) as RoutineItem[];
    routine.items = items.map((item) => ({
      ...item,
    }));
  }

  return mappedRows as RoutineWithItems[];
};
