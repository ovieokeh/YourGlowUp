import { Exercise, EXERCISES, Task, TASKS } from "@/constants/Exercises";
import { db } from "../../utils/db";
import { getLogs } from "../logs/logs";

export const initRoutinesTables = (reset?: boolean) => {
  // reset all tables
  if (reset) {
    db.runSync(`DROP TABLE IF EXISTS routines;`);
    db.runSync(`DROP TABLE IF EXISTS routine_items;`);
  }

  db.runSync(
    `
CREATE TABLE IF NOT EXISTS routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routineId TEXT UNIQUE,
  name TEXT,
  description TEXT,
  items TEXT,
  addedAt TEXT
);
  `
  );
  db.runSync(
    `
CREATE TABLE IF NOT EXISTS routine_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemId TEXT,
  routineId TEXT,
  name TEXT,
  description TEXT,
  type TEXT,
  notificationTimes TEXT DEFAULT NULL,
  addedAt TEXT,
  FOREIGN KEY (routineId) REFERENCES routines(routineId) ON DELETE CASCADE
);
  `
  );
};

export interface Routine {
  id: number;
  routineId: string;
  name: string;
  description: string;
  itemsIds: string[];
}

export type RoutineTaskItem = Task & {
  id: number;
  addedAt: string;
};
export type RoutineExerciseItem = Exercise & {
  id: number;
  addedAt: string;
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
export const addRoutine = async (routine: Omit<Routine, "id">) => {
  const items = routine.itemsIds.map((itemId) => {
    const item = EXERCISES.find((e) => e.itemId === itemId) || TASKS.find((t) => t.itemId === itemId);
    if (!item) return null;

    const isTask = item.type === "task";
    const DEFAULT_NOTIFICATION_TIME = "09:00"; // Default time for tasks
    const notificationTimes = isTask ? [DEFAULT_NOTIFICATION_TIME] : null;

    return {
      itemId: item.itemId,
      name: routine.name ?? item.name,
      description: routine.description ?? item.description,
      notificationTimes: notificationTimes,
      type: item.type,
      addedAt: new Date().toISOString(),
    };
  });

  const add = await db.runAsync(`INSERT INTO routines (routineId, name, description) VALUES (?, ?, ?)`, [
    routine.routineId,
    routine.name,
    routine.description,
  ]);

  for (const item of items) {
    if (item) {
      await db.runAsync(
        `INSERT INTO routine_items (itemId, routineId, name, description, type, notificationTimes, addedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.itemId,
          routine.routineId,
          item.name,
          item.description,
          item.type,
          JSON.stringify(item.notificationTimes),
          item.addedAt,
        ]
      );
    }
  }

  return add;
};
export const removeRoutine = async (routineId: string) => {
  await db.runAsync(`DELETE FROM routine_items WHERE routineId = ?`, [routineId]);
  await db.runAsync(`DELETE FROM routines WHERE routineId = ?`, [routineId]);
};
export const getUserRoutines = async () => {
  const rows = (await db.getAllAsync(`SELECT * FROM routines;`)) as Routine[];
  const mappedRows =
    rows.map((row) => ({
      ...row,
      items: JSON.parse(row.itemsIds as unknown as string) as string[],
    })) || [];

  return mappedRows as Routine[];
};

export const getRoutineById = async (routineId: string) => {
  const rows = (await db.getAllAsync(`SELECT * FROM routines WHERE routineId = ?`, [routineId])) as RoutineWithItems[];
  const mappedRows = rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items as unknown as string) as string[],
  }));

  for (const routine of mappedRows) {
    const items = (await db.getAllAsync(`SELECT * FROM routine_items WHERE routineId = ?`, [
      routine.routineId,
    ])) as RoutineItem[];
    (routine as unknown as RoutineWithItems).items = items.map((item) => {
      const exercise = EXERCISES.find((e) => e.itemId === item.itemId);
      const task = TASKS.find((t) => t.itemId === item.itemId);
      if (exercise) {
        return {
          ...exercise,
          ...item,
          notificationTimes: item.notificationTimes ? JSON.parse((item as any).notificationTimes) : null,
          type: "exercise",
        } as RoutineExerciseItem;
      } else if (task) {
        return {
          ...task,
          ...item,
          notificationTimes: item.notificationTimes ? JSON.parse((item as any).notificationTimes) : null,
          type: "task",
        } as RoutineTaskItem;
      }
      return item;
    });
  }

  return (mappedRows[0] as unknown as RoutineWithItems) || null;
};
export const updateRoutine = async (routineId: string, updatedRoutine: Partial<Routine>, replace?: boolean) => {
  try {
    const { name, description, itemsIds } = updatedRoutine;
    const originalRoutine = await getRoutineById(routineId);

    const finalName = name ?? originalRoutine.name;
    const finalDescription = description ?? originalRoutine.description;
    const finalItems = itemsIds ?? originalRoutine?.itemsIds;

    if (!originalRoutine || originalRoutine.routineId !== routineId) {
      const add = await addRoutine({
        routineId,
        name: finalName,
        description: finalDescription,
        itemsIds: itemsIds || [],
      });
      return add;
    }
    let changes = 0;

    const update = await db.runAsync(`UPDATE routines SET name = ?, description = ?, items = ? WHERE routineId = ?`, [
      finalName,
      finalDescription,
      JSON.stringify(finalItems),
      routineId,
    ]);
    changes = update.changes;

    if (replace) {
      // remove items that are not in the new items
      const itemsToRemove = originalRoutine.items?.filter((item) => !finalItems.includes(item.itemId));
      for (const item of itemsToRemove) {
        await db.runAsync(`DELETE FROM routine_items WHERE itemId = ? AND routineId = ?`, [item.itemId, routineId]);
        changes++;
      }
    }
    // add new items that are in the new items
    const itemsToAdd = finalItems.filter((itemId) => !originalRoutine.items.some((item) => item.itemId === itemId));
    for (const itemId of itemsToAdd) {
      const item = EXERCISES.find((e) => e.itemId === itemId) || TASKS.find((t) => t.itemId === itemId);
      if (!item) continue;
      const isTask = item.type === "task";
      const DEFAULT_NOTIFICATION_TIME = "09:00"; // Default time for tasks
      const notificationTimes = isTask ? [DEFAULT_NOTIFICATION_TIME] : null;
      await db.runAsync(
        `INSERT INTO routine_items (itemId, routineId, name, description, type, notificationTimes, addedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.itemId,
          routineId,
          item.name,
          item.description,
          item.type,
          JSON.stringify(notificationTimes),
          new Date().toISOString(),
        ]
      );
      changes++;
    }
    // update items that are in the new items
    for (const item of originalRoutine.items) {
      if (finalItems.includes(item.itemId)) {
        const itemId = item.itemId;
        const itemData = EXERCISES.find((e) => e.itemId === itemId) || TASKS.find((t) => t.itemId === itemId);
        if (!itemData) continue;
        const isTask = itemData.type === "task";
        const DEFAULT_NOTIFICATION_TIME = "09:00"; // Default time for tasks
        const notificationTimes = isTask ? [DEFAULT_NOTIFICATION_TIME] : null;
        await db.runAsync(
          `UPDATE routine_items SET name = ?, description = ?, type = ?, notificationTimes = ? WHERE itemId = ? AND routineId = ?`,
          [itemData.name, itemData.description, itemData.type, JSON.stringify(notificationTimes), itemId, routineId]
        );
        changes++;
      }
    }
    console.log("Changes made", changes);

    return update;
  } catch (error) {
    console.error("Error updating routine", error);
    throw error;
  }
};

export const getRoutineItem = async (itemId: string, routineId: string) => {
  try {
    const item = (await db.getFirstAsync(`SELECT * FROM routine_items WHERE itemId = ? AND routineId = ?`, [
      itemId,
      routineId,
    ])) as RoutineItem;
    console.log("item >>>>>", item);
    if (!item) return null;

    const exercise = EXERCISES.find((e) => e.itemId === item.itemId);
    const task = TASKS.find((t) => t.itemId === item.itemId);
    if (exercise) {
      return {
        ...exercise,
        ...item,
        notificationTimes: item.notificationTimes ? JSON.parse((item as any).notificationTimes) : null,
        type: "exercise",
      } as RoutineExerciseItem;
    } else if (task) {
      return {
        ...task,
        ...item,
        notificationTimes: item.notificationTimes ? JSON.parse((item as any).notificationTimes) : null,
        type: "task",
      } as RoutineTaskItem;
    }
    return null;
  } catch (error) {
    console.error("Error getting routine item", error);
    return null;
  }
};

export const updateRoutineItem = async (itemId: string, routineId: string, updatedItem: Partial<RoutineItem>) => {
  const { name, description, notificationTimes } = updatedItem;
  const originalItem = await getRoutineItem(itemId, routineId);
  if (!originalItem) return null;

  const finalName = name ?? originalItem.name;
  const finalDescription = description ?? originalItem.description;
  const finalNotificationTimes = notificationTimes ?? originalItem.notificationTimes;

  const update = await db.runAsync(
    `UPDATE routine_items SET name = ?, description = ?, notificationTimes = ? WHERE itemId = ? AND routineId = ?`,
    [finalName, finalDescription, JSON.stringify(finalNotificationTimes), itemId, routineId]
  );
  return update;
};

export const getPendingItemsToday = async (routineId: string) => {
  const logs = await getLogs();
  const today = new Date().toISOString().split("T")[0];
  const items = (await db.getAllAsync(`SELECT * FROM routine_items WHERE routineId = ? AND addedAt LIKE ?`, [
    routineId,
    `${today}%`,
  ])) as RoutineItem[];
  const pendingItems = items.filter((item) => {
    const itemDate = new Date(item.addedAt).toISOString().split("T")[0];
    return itemDate === today && !logs.some((log) => ["task", "exercise"].includes(log.type));
  });
  return pendingItems;
};
