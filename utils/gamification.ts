import AsyncStorage from "@react-native-async-storage/async-storage";

import { IconSymbolName } from "@/components/ui/IconSymbol";
import { Log } from "./logs";

export enum BadgeStatus {
  NOT_EARNED = "NOT_EARNED",
  EARNED = "EARNED",
}

export type BadgeKey =
  | "new-beginnings" // account creation
  | "say-cheese" // first selfie
  | "explorer" // first visit to the marketplace
  | "testing-waters" // first exercise
  | "face-gym-rat" // 10 exercises
  | "face-gym-enthusiast" // 30 exercises
  | "face-gym-sweat" // 50 exercises
  | "face-gym-obsessed" // 100 exercises
  | "testing-pen" // first self-log
  | "junior-reporter" // 10 self-logs
  | "medior-reporter" // 30 self-logs
  | "senior-reporter" // 50 self-logs
  | "established-reporter" // 100 self-logs
  | "narcissus" // 200 exercises & 200 self-logs
  | "beginner-task-master" // 10 tasks
  | "dilligent-task-master" // 30 tasks
  | "pro-task-master" // 50 tasks
  | "established-task-master"; // 100 tasks

export enum BadgeLevel {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  level: BadgeLevel;
  icon: IconSymbolName;
  status: BadgeStatus;
}

export const BADGES: Record<BadgeKey, Badge> = {
  "new-beginnings": {
    id: "new-beginnings",
    name: "New Beginnings",
    description: "You created your account. Welcome to the family!",
    icon: "camera.macro",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "say-cheese": {
    id: "say-cheese",
    name: "Say Cheese",
    description: "You took your first selfie. Smile!",
    icon: "camera.aperture",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  explorer: {
    id: "explorer",
    name: "Explorer",
    description: "You visited the marketplace for the first time. Explore!",
    icon: "globe.desk",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "testing-waters": {
    id: "testing-waters",
    name: "Testing the Waters",
    description: "You completed your first exercise. Keep it up!",
    icon: "figure.gymnastics",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "face-gym-rat": {
    id: "face-gym",
    name: "Face Gym Rat",
    description: "You completed 10 exercises. You're on a roll!",
    icon: "figure.gymnastics",
    level: BadgeLevel.SILVER,
    status: BadgeStatus.NOT_EARNED,
  },
  "face-gym-enthusiast": {
    id: "face-gym",
    name: "Face Gym Enthusiast",
    description: "You completed 30 exercises. You're getting serious!",
    icon: "figure.gymnastics",
    level: BadgeLevel.SILVER,
    status: BadgeStatus.NOT_EARNED,
  },
  "face-gym-sweat": {
    id: "face-gym",
    name: "Face Gym Sweat",
    description: "You completed 50 exercises. You're sweating it out!",
    icon: "figure.gymnastics",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  "face-gym-obsessed": {
    id: "face-gym",
    name: "Face Gym Obsessed",
    description: "You completed 100 exercises. You're obsessed!",
    icon: "figure.gymnastics",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  "testing-pen": {
    id: "testing-pen",
    name: "Testing the Pen",
    description: "You completed your first self-log. Tell us more!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "junior-reporter": {
    id: "reporter",
    name: "Junior Reporter",
    description: "You completed 10 self-logs. You're getting the hang of it!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "medior-reporter": {
    id: "reporter",
    name: "Medior Reporter",
    description: "You completed 30 self-logs. You're a pro!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.SILVER,
    status: BadgeStatus.NOT_EARNED,
  },
  "senior-reporter": {
    id: "reporter",
    name: "Senior Reporter",
    description: "You completed 50 self-logs. You're a master!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  "established-reporter": {
    id: "reporter",
    name: "Established Reporter",
    description: "You completed 100 self-logs. You're a legend!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  narcissus: {
    id: "narcissus",
    name: "Narcissus",
    description: "You completed 200 exercises and 200 self-logs. You're the ultimate face gym enthusiast!",
    icon: "person.and.background.dotted",
    level: BadgeLevel.PLATINUM,
    status: BadgeStatus.NOT_EARNED,
  },
  "beginner-task-master": {
    id: "task-master",
    name: "Beginner Task Master",
    description: "You completed 10 tasks. You're getting the hang of it!",
    icon: "bolt.heart",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "dilligent-task-master": {
    id: "task-master",
    name: "Dilligent Task Master",
    description: "You completed 30 tasks. You're dilligent!",
    icon: "bolt.heart",
    level: BadgeLevel.SILVER,
    status: BadgeStatus.NOT_EARNED,
  },
  "pro-task-master": {
    id: "task-master",
    name: "Pro Task Master",
    description: "You completed 50 tasks. You're a master!",
    icon: "bolt.heart",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  "established-task-master": {
    id: "task-master",
    name: "Established Task Master",
    description: "You completed 100 tasks. You're a legend!",
    icon: "bolt.heart",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
};

const BADGES_KEY = "badges";

export const fetchUserBadges = async (): Promise<Record<BadgeKey, Badge>> => {
  try {
    const badges = await AsyncStorage.getItem(BADGES_KEY);
    if (badges) {
      const parsedBadges = JSON.parse(badges);
      return parsedBadges;
    }
    return BADGES;
  } catch (error) {
    console.error("Error fetching badges data:", error);
    return BADGES;
  }
};

export const setBadgeStatus = async (key: BadgeKey, status: BadgeStatus) => {
  try {
    const badges = await fetchUserBadges();
    const updatedBadges = {
      ...badges,
      [key]: {
        ...badges[key],
        status,
      },
    };
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(updatedBadges));
  } catch (error) {
    console.error("Error setting badge status:", error);
  }
};

const XP_KEY = "xp";
export const fetchUserXP = async (): Promise<number> => {
  try {
    const xp = await AsyncStorage.getItem(XP_KEY);
    if (xp) {
      return parseInt(xp, 10);
    }
    return 0;
  } catch (error) {
    console.error("Error fetching XP data:", error);
    return 0;
  }
};
export const addXP = async (xp: number) => {
  try {
    const currentXP = await fetchUserXP();
    const newXP = currentXP + xp;
    await AsyncStorage.setItem(XP_KEY, newXP.toString());
  } catch (error) {
    console.error("Error adding XP:", error);
  }
};
export const resetXP = async () => {
  try {
    await AsyncStorage.setItem(XP_KEY, "0");
  } catch (error) {
    console.error("Error resetting XP:", error);
  }
};
export const LOG_TYPE_XP_MAP: Record<Log["type"], number> = {
  exercise: 10,
  user: 5,
  task: 2,
};

export const getStreak = (logs: Log[]) => {
  const today = new Date();
  const streak = logs.reduce((acc, log) => {
    const logDate = new Date(log.completedAt);
    if (logDate.toDateString() === today.toDateString()) {
      acc += 1;
    } else if (logDate.getTime() === today.getTime() - 86400000) {
      acc += 1;
    } else {
      acc = 0;
    }
    return acc;
  }, 0);
  return streak;
};

type BadgeConditionFn = (params: { logs: Log[]; streak: number }) => boolean;

export const badgeConditions: Record<BadgeKey, BadgeConditionFn> = {
  "testing-waters": ({ logs }) => count(logs, "exercise") >= 1,
  "face-gym-rat": ({ logs }) => count(logs, "exercise") >= 10,
  "face-gym-enthusiast": ({ logs }) => count(logs, "exercise") >= 30,
  "face-gym-sweat": ({ logs }) => count(logs, "exercise") >= 50,
  "face-gym-obsessed": ({ logs }) => count(logs, "exercise") >= 100,

  "testing-pen": ({ logs }) => count(logs, "user") >= 1,
  "junior-reporter": ({ logs }) => count(logs, "user") >= 10,
  "medior-reporter": ({ logs }) => count(logs, "user") >= 30,
  "senior-reporter": ({ logs }) => count(logs, "user") >= 50,
  "established-reporter": ({ logs }) => count(logs, "user") >= 100,

  "beginner-task-master": ({ logs }) => count(logs, "task") >= 10,
  "dilligent-task-master": ({ logs }) => count(logs, "task") >= 30,
  "pro-task-master": ({ logs }) => count(logs, "task") >= 50,
  "established-task-master": ({ logs }) => count(logs, "task") >= 100,

  narcissus: ({ logs }) => count(logs, "exercise") >= 200 && count(logs, "user") >= 200,
  "say-cheese": ({ logs }) => logs.some((log) => log.type === "user" && !!log.photoUri),

  // non-log based (example, you can check account creation, selfie taken, etc.)
  "new-beginnings": () => false,
  explorer: () => false,
};

const count = (logs: Log[], type: Log["type"]) => logs.filter((l) => l.type === type).length;
