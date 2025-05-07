import { Exercise, EXERCISES, Task, TASKS } from "@/constants/Exercises";
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

export type RoutineTaskItem = Task & {
  id: number;
  addedAt: string;
  notificationTime: string | null;
};
export type RoutineExerciseItem = Exercise & {
  id: number;
  addedAt: string;
  notificationTime: string | null;
};

export const isRoutineTaskItem = (item: RoutineItem): item is RoutineTaskItem => {
  return (item as RoutineTaskItem).type === "task";
};
export const isRoutineExerciseItem = (item: RoutineItem): item is RoutineExerciseItem => {
  return (item as RoutineExerciseItem).type === "exercise";
};

export type RoutineItem = RoutineTaskItem | RoutineExerciseItem;
export interface RoutineWithItems extends Routine {
  items: RoutineItem[];
}
export const addRoutine = (routine: Omit<Routine, "id">) => {
  const items = routine.steps.map((itemId) => {
    const item = EXERCISES.find((e) => e.itemId === itemId) || TASKS.find((t) => t.itemId === itemId);
    if (!item) return null;

    const isTask = item.type === "task";
    const DEFAULT_NOTIFICATION_TIME = "09:00"; // Default time for tasks
    const notificationTime = isTask ? DEFAULT_NOTIFICATION_TIME : null;

    return {
      itemId: item.itemId,
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
        item.itemId,
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
    routine.items = items.map((item) => {
      const exercise = EXERCISES.find((e) => e.itemId === item.itemId);
      const task = TASKS.find((t) => t.itemId === item.itemId);
      if (exercise) {
        return {
          ...exercise,
          ...item,
        };
      } else if (task) {
        return {
          ...task,
          ...item,
        };
      }
      return item;
    });
  }

  return mappedRows as RoutineWithItems[];
};
