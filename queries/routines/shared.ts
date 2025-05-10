import { Exercise, Task } from "@/constants/Exercises";

export interface Routine {
  id: number;
  slug: string;
  name: string;
  description: string;
  itemsSlugs: string[];
}

export type RoutineTaskItem = Task & {
  id: number;
  routineId: number;
  slug: string;
  addedAt: string;
};
export type RoutineExerciseItem = Exercise & {
  id: number;
  routineId: number;
  slug: string;
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
