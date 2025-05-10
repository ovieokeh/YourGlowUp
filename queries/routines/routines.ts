import { EXERCISES, NotificationType, TASKS } from "@/constants/Exercises";
import { scheduleNotificationWithStats } from "@/utils/notifications";
import { db } from "../../utils/db";
import { getLogs } from "../logs/logs";
import { getCurrentUserEmail } from "../shared";
import { Routine, RoutineExerciseItem, RoutineItem, RoutineTaskItem } from "./shared";

export enum RoutineItemCompletionType {
  RECURRING = "recurring",
  ONE_TIME = "one_time",
}

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
  userEmail TEXT,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  itemsSlugs TEXT,
  addedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
  `
  );
  db.runSync(
    `
CREATE TABLE IF NOT EXISTS routine_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routineId INTEGER,
  userEmail TEXT,
  slug TEXT,
  name TEXT,
  description TEXT,
  type TEXT,
  notificationType TEXT DEFAULT NULL,
  notificationTimes TEXT DEFAULT NULL,
  addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
);
  `
  );
};

const dailyNotificationTime = ["09:00"]; // Default time for tasks
const weeklyNotificationTime = [
  "monday-09:00",
  "tuesday-09:00",
  "wednesday-09:00",
  "thursday-09:00",
  "friday-09:00",
  "saturday-11:00",
]; // Default time for exercises

const defaultSlugToRoutineItem = (slug: string) => {
  const item = EXERCISES.find((e) => e.slug === slug) || TASKS.find((t) => t.slug === slug);
  if (!item) return null;

  const isTask = item.type === "task";
  const DEFAULT_NOTIFICATION_TIME = Math.random() > 0.5 ? dailyNotificationTime : weeklyNotificationTime;
  const notificationTimes = isTask ? DEFAULT_NOTIFICATION_TIME : null;

  return {
    ...item,
    notificationType: NotificationType.DAILY,
    notificationTimes,
    addedAt: new Date().toISOString(),
  };
};

export const addRoutine = async (routine: Omit<Routine, "id">) => {
  const userEmail = await getCurrentUserEmail();

  const add = await db
    .runAsync(`INSERT INTO routines (slug, name, description, userEmail) VALUES (?, ?, ?, ?)`, [
      routine.slug,
      routine.name,
      routine.description,
      userEmail,
    ])
    .catch((error) => {
      console.error("Error adding routine", error);
      throw error;
    });
  const id = add.lastInsertRowId;

  for (const itemSlug of routine.itemsSlugs) {
    const item = defaultSlugToRoutineItem(itemSlug);
    if (item) {
      await addItemToRoutine(id, {
        ...item,
        slug: itemSlug,
        routineId: id,
      }).catch((error) => {
        console.error("Error adding item to routine", error);
        throw error;
      });
    }
  }

  return id;
};
export const removeRoutine = async (id: number) => {
  const userEmail = await getCurrentUserEmail();

  await db.runAsync(`DELETE FROM routine_items WHERE id = ? AND userEmail = ?`, [id, userEmail]);
  await db.runAsync(`DELETE FROM routines WHERE id = ? AND userEmail = ?`, [id, userEmail]);
};
export const getUserRoutines = async () => {
  const userEmail = await getCurrentUserEmail();

  const rows = (await db.getAllAsync(`SELECT * FROM routines WHERE userEmail = ?`, [userEmail])) as Routine[];
  const mappedRows =
    rows.map((row) => ({
      ...row,
    })) || [];

  return mappedRows as Routine[];
};

export const getRoutineById = async (id: number) => {
  const userEmail = await getCurrentUserEmail();

  const rows = (await db.getAllAsync(`SELECT * FROM routines WHERE id = ? AND userEmail = ?`, [
    +id,
    userEmail,
  ])) as Routine[];

  const mappedRows =
    rows.map((row) => ({
      ...row,
      itemsSlugs: row.itemsSlugs ? JSON.parse(row.itemsSlugs as any) : [],
    })) || [];

  return (mappedRows[0] as unknown as Routine) || null;
};
export const updateRoutine = async (id: number, updatedRoutine: Partial<Routine>, replace?: boolean) => {
  try {
    const userEmail = await getCurrentUserEmail();
    const { name, description } = updatedRoutine;
    const originalRoutine = await getRoutineById(id);

    const finalName = name ?? originalRoutine.name;
    const finalDescription = description ?? originalRoutine.description;

    if (!originalRoutine) {
      throw new Error("Routine not found");
    }

    const update = await db.runAsync(`UPDATE routines SET name = ?, description = ? WHERE id = ? AND userEmail = ?`, [
      finalName,
      finalDescription,
      id,
      userEmail,
    ]);

    return update;
  } catch (error) {
    console.error("Error updating routine", error);
    throw error;
  } finally {
    scheduleNotificationWithStats();
  }
};

export const addItemToRoutine = async (routineId: number, item: Omit<RoutineItem, "id" | "addedAt">) => {
  const userEmail = await getCurrentUserEmail();
  try {
    const { slug, name, description, type, notificationTimes } = item;
    const add = await db.runAsync(
      `INSERT INTO routine_items (slug, routineId, userEmail, name, description, type, notificationTimes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, routineId, userEmail, name, description, type, JSON.stringify(notificationTimes)]
    );
    return add;
  } catch (error) {
    console.error("Error adding item to routine", error);
    return null;
  } finally {
    scheduleNotificationWithStats();
  }
};

export const deleteItemFromRoutine = async (slug: string, routineId: number) => {
  const userEmail = await getCurrentUserEmail();
  try {
    const remove = await db.runAsync(`DELETE FROM routine_items WHERE slug = ? AND routineId = ? AND userEmail = ?`, [
      slug,
      routineId,
      userEmail,
    ]);
    return remove;
  } catch (error) {
    console.error("Error deleting item from routine", error);
    return null;
  } finally {
    scheduleNotificationWithStats();
  }
};

export const updateRoutineItems = async (
  routineId: number,
  items: Omit<RoutineItem, "id" | "routineId" | "addedAt">[]
) => {
  const userEmail = await getCurrentUserEmail();
  try {
    // get the current items slugs
    const currentItems = (await db.getAllAsync(`SELECT * FROM routine_items WHERE routineId = ? AND userEmail = ?`, [
      routineId,
      userEmail,
    ])) as RoutineItem[];
    const itemsToRemove = currentItems.filter((item) => !items.some((i) => i.slug === item.slug));
    const itemsToAdd = items.filter((item) => !currentItems.some((i) => i.slug === item.slug));
    // remove the items that are not in the new list
    for (const item of itemsToRemove) {
      await deleteItemFromRoutine(item.slug, routineId).catch((error) => {
        console.error("Error deleting item from routine", error);
        throw error;
      });
    }
    // add the new items
    for (const item of itemsToAdd) {
      if (item) {
        await addItemToRoutine(routineId, {
          ...item,
          routineId,
        }).catch((error) => {
          console.error("Error adding item to routine", error);
          throw error;
        });
      }
    }
    // update the routine items slugs
    const update = await db.runAsync(`UPDATE routines SET itemsSlugs = ? WHERE id = ? AND userEmail = ?`, [
      JSON.stringify(items.map((item) => item.slug)),
      routineId,
      userEmail,
    ]);
    return update;
  } catch (error) {
    console.error("Error updating routine items", error);
    return null;
  } finally {
    scheduleNotificationWithStats();
  }
};

export const getRoutineItem = async (id: number) => {
  const userEmail = await getCurrentUserEmail();
  try {
    const item = (await db.getFirstAsync(`SELECT * FROM routine_items WHERE id = ? AND userEmail = ?`, [
      id,
      userEmail,
    ])) as RoutineItem;
    if (!item) return null;

    const exercise = EXERCISES.find((e) => e.slug === item.slug);
    const task = TASKS.find((t) => t.slug === item.slug);
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

export const getAllRoutineItems = async () => {
  const userEmail = await getCurrentUserEmail();
  try {
    const items = (await db.getAllAsync(`SELECT * FROM routine_items WHERE userEmail = ?`, [
      userEmail,
    ])) as RoutineItem[];
    const mappedItems = items.map((item) => {
      const exercise = EXERCISES.find((e) => e.slug === item.slug);
      const task = TASKS.find((t) => t.slug === item.slug);
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
    });
    return mappedItems.filter(Boolean) as RoutineItem[];
  } catch (error) {
    console.error("Error getting all routine items", error);
    return null;
  }
};

export const getRoutineItems = async (routineId: number) => {
  const userEmail = await getCurrentUserEmail();
  try {
    const items = (await db.getAllAsync(`SELECT * FROM routine_items WHERE routineId = ? AND userEmail = ?`, [
      routineId,
      userEmail,
    ])) as RoutineItem[];

    const mappedItems = items.map((item) => {
      const exercise = EXERCISES.find((e) => e.slug === item.slug);
      const task = TASKS.find((t) => t.slug === item.slug);
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
    });

    return mappedItems.filter(Boolean) as RoutineItem[];
  } catch (error) {
    console.error("Error getting routine items", error);
    return null;
  }
};

export const updateRoutineItem = async (id: number, updatedItem: Partial<RoutineItem>) => {
  const userEmail = await getCurrentUserEmail();
  try {
    const { name, description, notificationType, notificationTimes } = updatedItem;
    const originalItem = await getRoutineItem(id);
    if (!originalItem) return null;

    const finalName = name ?? originalItem.name;
    const finalDescription = description ?? originalItem.description;
    const finalNotificationTimes = notificationTimes ?? originalItem.notificationTimes;
    const finalNotificationType = notificationType ?? notificationType ?? NotificationType.NONE;

    const update = await db.runAsync(
      `UPDATE routine_items SET name = ?, description = ?, notificationType = ?, notificationTimes = ? WHERE id = ? AND userEmail = ?`,
      [finalName, finalDescription, finalNotificationType, JSON.stringify(finalNotificationTimes), id, userEmail]
    );
    return update;
  } catch (error) {
    console.error("Error updating routine item", error);
    return null;
  } finally {
    scheduleNotificationWithStats();
  }
};

export const getPendingItemsToday = async () => {
  const userEmail = await getCurrentUserEmail();
  const logs = await getLogs();
  const items = (await db.getAllAsync(`SELECT * FROM routine_items userEmail = ?`, [userEmail])) as RoutineItem[];

  const pendingItems: RoutineItem[] = [];

  for (const item of items) {
    const todayLogs = (() => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      return logs
        .filter((log) => {
          return log.slug === item.slug;
        })
        .filter((log) => {
          const completed = new Date(log.createdAt).getTime();
          return completed >= startOfDay.getTime() && completed <= endOfDay.getTime();
        });
    })();
    if (!todayLogs.length) {
      pendingItems.push(item);
      break;
    }
  }

  return pendingItems;
};
