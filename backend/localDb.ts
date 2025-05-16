import * as SQLite from "expo-sqlite";

import { DEFAULT_ACTIVITIES, DEFAULT_GOALS } from "@/constants/Goals";
import { addActivity } from "./activities";
import { addGoal } from "./goals";
import { Activity } from "./shared";

export const localDb = SQLite.openDatabaseSync("sharedstep.db");

export async function initDatabase(reset: boolean): Promise<void> {
  if (reset) {
    await localDb.execAsync(`
      DROP TABLE IF EXISTS goals;
      DROP TABLE IF EXISTS activities;
      DROP TABLE IF EXISTS logs;
    `);
  }
  return localDb.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      featuredImage TEXT,
      category TEXT,
      tags TEXT,
      author_id TEXT,
      author_name TEXT,
      author_avatar TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT,
      isPublic INTEGER,
      version INTEGER,
      status TEXT,
      completionType TEXT,
      completionDate TEXT,
      defaultRecurrence TEXT,
      defaultScheduledTimes TEXT,
      progress TEXT,
      meta TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      goalId TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      featuredImage TEXT,
      category TEXT,
      notificationsEnabled INTEGER,
      scheduledTimes TEXT,
      recurrence TEXT,
      completionPrompts TEXT,
      steps TEXT,
      reliesOn TEXT,
      unlockCondition TEXT,
      unlockParams TEXT,
      meta TEXT,
      FOREIGN KEY(goalId) REFERENCES goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_schedules (
        id TEXT PRIMARY KEY, -- Unique ID for the schedule entry itself
        activityId TEXT NOT NULL, -- Foreign key to the activities table
        timeOfDay TEXT NOT NULL, -- Format 'HH:MM' (e.g., '09:00', '21:30')
        dayOfWeek INTEGER, -- ISO 8601 day number (1=Monday, 7=Sunday), NULL for daily recurrence

        FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      goalId TEXT NOT NULL,
      type TEXT NOT NULL,

      activityId TEXT,
      activityType TEXT,
      completedAt TEXT,

      promptId TEXT,
      answerType TEXT,
      answer TEXT,

      stepId TEXT,
      stepIndex INTEGER,
      durationInSeconds INTEGER,

      media TEXT,
      authorType TEXT,
      authorId TEXT,
      feedback TEXT,

      createdAt TEXT DEFAULT (datetime('now')),
      meta TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_logs_goalId ON logs (goalId);
    CREATE INDEX IF NOT EXISTS idx_logs_userId ON logs (userId);
    CREATE INDEX IF NOT EXISTS idx_logs_activityId ON logs (activityId);
    CREATE INDEX IF NOT EXISTS idx_logs_createdAt ON logs (createdAt);
    CREATE INDEX IF NOT EXISTS idx_activities_goalId ON activities (goalId);
    CREATE INDEX IF NOT EXISTS idx_logs_type ON logs (type);
    CREATE INDEX IF NOT EXISTS idx_activities_category ON activities (category);
    CREATE INDEX IF NOT EXISTS idx_goals_category ON goals (category);
    CREATE INDEX IF NOT EXISTS idx_logs_userId_createdAt ON logs (userId, createdAt);
    CREATE INDEX IF NOT EXISTS idx_activity_schedules_activityId ON activity_schedules(activityId);
    CREATE INDEX IF NOT EXISTS idx_activity_schedules_dayTime ON activity_schedules(dayOfWeek, timeOfDay);
  `);
}

// seed the database with default activities and goals
export async function seedDatabase(): Promise<void> {
  const allGoals = await localDb.getAllAsync("SELECT * FROM goals");
  if (allGoals.length > 0) {
    console.info("Database already seeded with goals");
    return;
  }

  const goals = DEFAULT_GOALS.map((goal) => ({
    ...goal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const GOAL_ID_TO_DEFAULT_ID: {
    [key: string]: string;
  } = {};

  let goalIds: string[] = [];
  for (const goal of goals) {
    const goalId = await addGoal(goal);
    GOAL_ID_TO_DEFAULT_ID[goalId] = goal.id;
    goalIds.push(goalId);
  }

  for (const goalId of goalIds) {
    const defaultId = GOAL_ID_TO_DEFAULT_ID[goalId];

    // find default activities for this goal
    const defaultActivities = DEFAULT_ACTIVITIES.filter((activity) => (activity as Activity).goalId === defaultId);

    await Promise.all(
      defaultActivities.map(async (activity) => {
        const activityId = await addActivity(goalId, {
          ...activity,
          schedules: activity.schedules?.map((schedule) => ({
            ...schedule,
            activityId: activityId,
          })),
        });
        return activityId;
      })
    );
  }
}
