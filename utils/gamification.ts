import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

import { IconSymbolName } from "@/components/ui/IconSymbol";

const db = SQLite.openDatabaseSync("face-symmetry.db");

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

export const fetchBadges = async (): Promise<Record<BadgeKey, Badge>> => {
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
    const badges = await fetchBadges();
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

export const initBadgesTable = () => {
  // drop table if exists
  // db.execSync("DROP TABLE IF EXISTS badges;");

  // create table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        level TEXT NOT NULL,
        icon TEXT NOT NULL,
        status TEXT NOT NULL -- "NOT_EARNED" | "EARNED"
    );`
  );
  // insert badges
  // Object.values(BADGES).forEach((badge) => {
  //   db.runSync(`INSERT INTO badges (id, name, description, level, icon, status) VALUES (?, ?, ?, ?, ?, ?)`, [
  //     badge.id,
  //     badge.name,
  //     badge.description,
  //     badge.level,
  //     badge.icon,
  //     badge.status,
  //   ]);
  // });
};
