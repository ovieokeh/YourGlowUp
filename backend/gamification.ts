import AsyncStorage from "@react-native-async-storage/async-storage";

import { IconSymbolName } from "@/components/ui/IconSymbol";
import { Log, LogType } from "./shared";

export enum BadgeStatus {
  NOT_EARNED = "NOT_EARNED",
  EARNED = "EARNED",
}

export type BadgeKey =
  | "new-beginnings" // account creation
  | "explorer" // first visit to the marketplace
  | "testing-waters" // first exercise
  | "face-gym-rat" // 10 exercises
  | "face-gym-enthusiast" // 30 exercises
  | "face-gym-sweat" // 50 exercises
  | "face-gym-obsessed" // 100 exercises
  | "say-cheese" // first selfie
  | "junior-reporter" // 10 selfies
  | "medior-reporter" // 30 selfies
  | "senior-reporter" // 50 selfies
  | "established-reporter" // 100 selfies
  | "narcissus" // 200 selfies
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
  "say-cheese": {
    id: "reporter",
    name: "Say Cheese",
    description: "You took your first selfie. Smile!",
    icon: "camera.aperture",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "junior-reporter": {
    id: "reporter",
    name: "Junior Reporter",
    description: "You took 10 selfies. You're getting the hang of it!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.BRONZE,
    status: BadgeStatus.NOT_EARNED,
  },
  "medior-reporter": {
    id: "reporter",
    name: "Medior Reporter",
    description: "You took 30 selfies. So stunning!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.SILVER,
    status: BadgeStatus.NOT_EARNED,
  },
  "senior-reporter": {
    id: "reporter",
    name: "Senior Reporter",
    description: "You took 50 selfies. We can't get enough of you!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  "established-reporter": {
    id: "reporter",
    name: "Established Reporter",
    description: "You took 100 selfies. You are majestic and we love you!",
    icon: "pencil.and.scribble",
    level: BadgeLevel.GOLD,
    status: BadgeStatus.NOT_EARNED,
  },
  narcissus: {
    id: "reporter",
    name: "Narcissus",
    description: "You took 200 selfies. Do you know the story of Narcissus?",
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

export const resetBadges = async () => {
  try {
    const badges = Object.keys(BADGES).reduce((acc, key) => {
      acc[key as BadgeKey] = {
        ...BADGES[key as BadgeKey],
        status: BadgeStatus.NOT_EARNED,
      };
      return acc;
    }, {} as Record<BadgeKey, Badge>);
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch (error) {
    console.error("Error resetting badges:", error);
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
  activity: 10,
  media_upload: 5,
  step: 1,
  prompt: 2,
  feedback: 3,
};
export const getStreak = (logs: Log[]) => {
  const MS_IN_DAY = 86_400_000;
  const daySet = new Set(
    logs.map((log) => {
      const createdAtDate = new Date(log.createdAt);
      const createdAt = createdAtDate.getTime();
      return Math.floor(createdAt / MS_IN_DAY);
    })
  );

  let streak = 0;
  let currentDay = Math.floor(Date.now() / MS_IN_DAY);

  while (daySet.has(currentDay)) {
    streak++;
    currentDay--; // check previous day
  }

  return streak;
};
type BadgeConditionFn = (params: { logs: Log[]; streak: number }) => boolean;

export const badgeConditions: Record<BadgeKey, BadgeConditionFn> = {
  "testing-waters": ({ logs }) => countLogs(logs, LogType.ACTIVITY) >= 1,
  "face-gym-rat": ({ logs }) => countLogs(logs, LogType.ACTIVITY) >= 10,
  "face-gym-enthusiast": ({ logs }) => countLogs(logs, LogType.ACTIVITY) >= 30,
  "face-gym-sweat": ({ logs }) => countLogs(logs, LogType.ACTIVITY) >= 50,
  "face-gym-obsessed": ({ logs }) => countLogs(logs, LogType.ACTIVITY) >= 100,

  "say-cheese": ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 1,
  "junior-reporter": ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 10,
  "medior-reporter": ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 30,
  "senior-reporter": ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 50,
  "established-reporter": ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 100,
  narcissus: ({ logs }) => countLogs(logs, LogType.MEDIA_UPLOAD) >= 200,

  "beginner-task-master": ({ logs }) => countLogs(logs, LogType.FEEDBACK) >= 10,
  "dilligent-task-master": ({ logs }) => countLogs(logs, LogType.FEEDBACK) >= 30,
  "pro-task-master": ({ logs }) => countLogs(logs, LogType.FEEDBACK) >= 50,
  "established-task-master": ({ logs }) => countLogs(logs, LogType.FEEDBACK) >= 100,

  // non-log based (example, you can check account creation, selfie taken, etc.)
  "new-beginnings": () => false,
  explorer: () => false,
};

const countLogs = (logs: Log[], type: Log["type"]) => logs.filter((l) => l.type === type).length;

const SHOWN_TOASTS_KEY = "shown_toasts";
export const getShownToasts = async (): Promise<Set<BadgeKey>> => {
  try {
    const shown = await AsyncStorage.getItem(SHOWN_TOASTS_KEY);
    if (shown) {
      return new Set(JSON.parse(shown));
    }
    return new Set();
  } catch (error) {
    console.error("Error fetching shown toasts:", error);
    return new Set();
  }
};
export const setShownToasts = async (shown: Set<BadgeKey>) => {
  try {
    await AsyncStorage.setItem(SHOWN_TOASTS_KEY, JSON.stringify(Array.from(shown)));
  } catch (error) {
    console.error("Error setting shown toasts:", error);
  }
};
export const resetShownToasts = async () => {
  try {
    await AsyncStorage.setItem(SHOWN_TOASTS_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Error resetting shown toasts:", error);
  }
};
