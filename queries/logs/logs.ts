import { scheduleNotificationWithStats } from "@/utils/notifications";
import { db } from "../../utils/db";
import { getCurrentUserEmail } from "../shared";

export const initLogsTable = (reset?: boolean) => {
  if (reset) {
    // drop the table if it exists
    db.execSync("DROP TABLE IF EXISTS logs;");
    db.execSync("DROP TABLE IF EXISTS photo_logs;");
  }
  // create the table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId INTEGER NOT NULL,
        userEmail TEXT NOT NULL,
        slug TEXT NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
        type TEXT NOT NULL,
        meta TEXT
    );`
  );

  db.execSync(
    `CREATE TABLE IF NOT EXISTS photo_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routineId INTEGER NOT NULL,
        userEmail TEXT NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
        photos TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT "photo",
        notes TEXT
      )
    `
  );
};

export interface Log {
  id: number;
  routineId: number;
  slug: string;
  type: "exercise" | "task";
  meta: any;
  createdAt: number;
}

export const isExerciseLog = (log: Log) => {
  return log.type === "exercise";
};
export const isTaskLog = (log: Log) => {
  return log.type === "task";
};

export const saveLog = async (type: "exercise" | "task", slug: string, routineId: number, meta?: any) => {
  const userEmail = await getCurrentUserEmail();
  await db
    .runAsync(`INSERT INTO logs (type, slug, routineId, meta, userEmail) VALUES (?, ?, ?, ?, ?)`, [
      type,
      slug,
      routineId,
      JSON.stringify(meta),
      userEmail,
    ])
    .catch((err) => {
      console.error("Error saving exercise log", err);
    })
    .finally(() => {
      scheduleNotificationWithStats();
    });
};

export const getLogs = async () => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE userEmail = ? ORDER BY createdAt DESC;`, [
    userEmail,
  ])) as Log[];
  return rows.map((row) => {
    if (row && row.meta) {
      return {
        ...row,
        meta: JSON.parse(row.meta as unknown as string),
      };
    }
    return row;
  });
};

export const getLogsBySlug = async (slug: string, callback?: (rows: Log[]) => void) => {
  const userEmail = await getCurrentUserEmail();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE slug = ? AND userEmail = ? ORDER BY createdAt DESC;`, [
    slug,
    userEmail,
  ])) as Log[];
  const mappedRows = rows.map((row) => {
    if (row && row.meta) {
      return {
        ...row,
        meta: JSON.parse(row.meta as unknown as string),
      };
    }
    return row;
  });
  if (callback) callback(mappedRows);

  return mappedRows;
};

export const getTodayLogs = async () => {
  const userEmail = await getCurrentUserEmail();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const rows = (await db.getAllAsync(`SELECT * FROM logs WHERE userEmail = ? AND createdAt >= ? AND createdAt < ?;`, [
    userEmail,
    startOfDay,
    endOfDay,
  ])) as Log[];
  return rows.map((row) => {
    if (row && row.meta) {
      return {
        ...row,
        meta: JSON.parse(row.meta as unknown as string),
      };
    }
    return row;
  });
};

export const getTodayLogsBySlug = async (slug: string) => {
  const userEmail = await getCurrentUserEmail();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const rows = (await db.getAllAsync(
    `SELECT * FROM logs WHERE slug = ? AND userEmail = ? AND createdAt >= ? AND createdAt < ?;`,
    [slug, userEmail, startOfDay, endOfDay]
  )) as Log[];
  return rows.map((row) => {
    if (row && row.meta) {
      return {
        ...row,
        meta: JSON.parse(row.meta as unknown as string),
      };
    }
    return row;
  });
};

export interface PhotoLogTransform {
  scale: number;
  x: number;
  y: number;
}
export interface PhotoLogCreate {
  front: { uri: string; transform?: PhotoLogTransform } | null;
  left: { uri: string; transform?: PhotoLogTransform } | null;
  right: { uri: string; transform?: PhotoLogTransform } | null;
  notes?: string;
}
export interface PhotoLog {
  id: number;
  routineId: string;
  type: "user";
  createdAt: string;
  photos: PhotoLogCreate;
}
export const savePhotoLog = async (
  log: PhotoLogCreate & {
    routineId: string;
  }
) => {
  const userEmail = await getCurrentUserEmail();
  return db
    .runAsync(`INSERT INTO photo_logs (routineId, photos, notes, userEmail) VALUES (?, ?, ?, ?)`, [
      log.routineId,
      JSON.stringify({
        front: log.front,
        left: log.left,
        right: log.right,
      }),
      log.notes ?? "",
      userEmail,
    ])
    .catch((err) => {
      console.error("Error saving photo log", err);
    })
    .finally(() => {
      scheduleNotificationWithStats();
    });
};

export const getPhotoLogs = async (routineId: number) => {
  const userEmail = await getCurrentUserEmail();
  console.log("photo lologogog", routineId);
  const rows = (await db.getAllAsync(
    `SELECT * FROM photo_logs WHERE routineId = ? AND userEmail = ? ORDER BY createdAt DESC;`,
    [routineId, userEmail]
  )) as PhotoLog[];
  console.log("photo logs>>>>", rows);
  return rows.map((row) => {
    if (row && row.photos) {
      return {
        ...row,
        photos: JSON.parse(row.photos as unknown as string) as PhotoLogCreate,
      };
    }
    return row;
  });
};
