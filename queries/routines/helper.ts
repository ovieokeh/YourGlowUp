import { EXERCISES, TASKS } from "@/constants/Exercises";
import { db } from "@/utils/db";
import { RoutineExerciseItem, RoutineItem, RoutineTaskItem, RoutineWithItems } from "./shared";

// duplicate of getRoutineById to avoid circular dependency
const getRoutineById = async (routineId: string) => {
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

export const withRoutine = async (routineId: string, cb: (routine: RoutineWithItems) => Promise<any>) => {
  const routine = await getRoutineById(routineId);
  if (!routine) {
    throw new Error("Routine not found");
  }
  return cb(routine);
};
