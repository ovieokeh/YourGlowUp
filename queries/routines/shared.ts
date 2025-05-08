import { Exercise, Task } from "@/constants/Exercises";

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
