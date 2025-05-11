import * as SQLite from "expo-sqlite";

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
      type TEXT,
      completionPrompts TEXT,
      steps TEXT,
      reliesOn TEXT,
      unlockCondition TEXT,
      unlockParams TEXT,
      meta TEXT,
      FOREIGN KEY(goalId) REFERENCES goals(id) ON DELETE CASCADE
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
    CREATE INDEX IF NOT EXISTS idx_activities_type ON activities (type);
    CREATE INDEX IF NOT EXISTS idx_goals_category ON goals (category);
    CREATE INDEX IF NOT EXISTS idx_logs_userId_createdAt ON logs (userId, createdAt);
  `);
}
