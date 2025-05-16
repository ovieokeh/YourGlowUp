// --- ENUMS ---

import { IconSymbolName } from "@/components/ui/IconSymbol";

// modifier of an interface or type to remove certain fields
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export enum GoalCompletionType {
  INDEFINITE = "INDEFINITE", // Corrected value
  ACTIVITY = "ACTIVITY", // Corrected value
  DATETIME = "DATETIME",
}

export enum GoalCategory {
  SELF_CARE = "self-care",
  HOBBY = "hobby",
  PRODUCTIVITY = "productivity",
  FITNESS = "fitness",
  FINANCE = "finance",
  CUSTOM = "custom",
}

export const CATEGORY_ICON_MAP: Record<GoalCategory, IconSymbolName> = {
  [GoalCategory.SELF_CARE]: "heart.fill",
  [GoalCategory.HOBBY]: "pencil.and.scribble",
  [GoalCategory.PRODUCTIVITY]: "checkmark",
  [GoalCategory.FITNESS]: "figure.cooldown",
  [GoalCategory.FINANCE]: "wallet.bifold",
  [GoalCategory.CUSTOM]: "star",
};

export enum CompletionPromptAnswerType {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  MEDIA = "media",
  DOCUMENT = "document",
}

export enum UnlockConditionType {
  AFTER_COMPLETION = "AFTER_COMPLETION",
  AFTER_X_DAYS = "AFTER_X_DAYS",
  AFTER_DATE = "AFTER_DATE",
}

export enum NotificationRecurrence {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export enum LogType {
  ACTIVITY = "activity", // general log: completed activity
  PROMPT = "prompt", // logs for user-entered answers
  STEP = "step", // logs for guided step progression
  MEDIA_UPLOAD = "media_upload", // photos, audio, etc.
  FEEDBACK = "feedback", // optional: GPT coach feedback log
}

// --- SUPPORT TYPES ---

export type ISO8601Timestamp = string; // Represents YYYY-MM-DDTHH:mm:ssZ or similar
export type ISO8601Date = string; // Represents YYYY-MM-DD

export interface LocalizedString {
  // @TODO: use this in all string fields
  en: string;
  [key: string]: string;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface MediaAsset {
  type: "image" | "video" | "audio" | "document";
  url: string;
  altText?: string;
  size?: number;
  id?: number; // Optional ID for the media asset
}

export interface PromptDependency {
  slug: string;
  value: string | number | boolean;
}

export interface PromptConditionGroup {
  type: "AND" | "OR";
  conditions: PromptDependency[];
}

// --- PROMPTS ---

export interface CompletionPromptBase {
  id: string;
  slug: string;
  prompt: string; // Consider LocalizedString
  reliesOn?: string;
  dependsOn?: PromptDependency | PromptDependency[] | PromptConditionGroup;
  validationRules?: Record<string, any>; // Could be more specific
}

export interface CompletionPromptText extends CompletionPromptBase {
  type: CompletionPromptAnswerType.TEXT;
  minLength: number;
  maxLength: number;
  placeholder?: string; // Consider LocalizedString
}

export interface CompletionPromptNumber extends CompletionPromptBase {
  type: CompletionPromptAnswerType.NUMBER;
  min: number;
  max: number;
}

export interface CompletionPromptBoolean extends CompletionPromptBase {
  type: CompletionPromptAnswerType.BOOLEAN;
}

export interface CompletionPromptSelect extends CompletionPromptBase {
  type: CompletionPromptAnswerType.SELECT;
  options: { label: string; value: string }[]; // Consider label as LocalizedString
}

export interface CompletionPromptMedia extends CompletionPromptBase {
  type: CompletionPromptAnswerType.MEDIA;
  media: MediaAsset;
}

export interface CompletionPromptDocument extends CompletionPromptBase {
  type: CompletionPromptAnswerType.DOCUMENT;
  documentType: "pdf" | "doc"; // Add more if needed
}

export type CompletionPrompt =
  | CompletionPromptText
  | CompletionPromptNumber
  | CompletionPromptBoolean
  | CompletionPromptSelect
  | CompletionPromptMedia
  | CompletionPromptDocument;

export interface PromptAnswer {
  promptId: string;
  type: CompletionPromptAnswerType;
  value: string | number | boolean | string[] | MediaAsset | null; // string[] likely for multi-select
}

// --- ACTIVITIES ---

export interface ActivityDependency {
  slug: string;
}

export interface ActivityScheduleEntry {
  id: string; // The schedule entry's own unique ID from activity_schedules table
  activityId: string; // The parent activity ID
  timeOfDay: string; // Format "HH:MM"
  dayOfWeek?: number; // ISO 8601 day number (1=Mon, 7=Sun), present if weekly
}

export interface Activity {
  id: string;
  goalId?: string;
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  category: GoalCategory;
  notificationsEnabled: boolean;
  recurrence?: NotificationRecurrence;
  steps: ActivityStep[];
  completionPrompts?: CompletionPrompt[];
  reliesOn?: ActivityDependency[];
  unlockCondition?: UnlockConditionType;
  unlockParams?: { days?: number; date?: ISO8601Date };
  meta?: Record<string, any>;
  schedules?: ActivityScheduleEntry[];
}

export interface ActivityScheduleCreateInput {
  timeOfDay: string; // Format "HH:MM"
  dayOfWeek?: number; // ISO 8601 day number (1=Mon, 7=Sun). Provide if recurrence is WEEKLY.
}

export interface ActivityCreateInput {
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  category: GoalCategory;
  steps: ActivityStep[];
  notificationsEnabled: boolean;
  recurrence?: NotificationRecurrence; // Keep this field
  completionPrompts?: CompletionPrompt[];
  reliesOn?: ActivityDependency[];
  unlockCondition?: UnlockConditionType;
  unlockParams?: { days?: number; date?: ISO8601Date };
  meta?: Record<string, any>;
  schedules?: ActivityScheduleCreateInput[];
}

export const hasCompletionPrompts = (activity: Activity): boolean =>
  !!activity.completionPrompts && activity.completionPrompts.length > 0;

export type ActivityStep = {
  id: string;
  slug: string;
  content: string; // Consider LocalizedString
  instructionMedia?: MediaAsset;
  duration?: number;
  durationType?: "seconds" | "minutes" | "hours";
  visibleIf?: ActivityDependency[];
};

// --- GOALS ---
export interface GoalBase {
  id: string;
  slug: string;
  name: string; // Consider LocalizedString
  description: string; // Consider LocalizedString
  featuredImage?: string; // URL or asset reference?
  category: GoalCategory;
  tags: string[];
  activities: Activity[]; // Note: In DB likely represented by relation, not embedded array
  author: Author;
  createdAt: ISO8601Timestamp; // Changed from number
  updatedAt: ISO8601Timestamp; // Changed from number
  isPublic: boolean;
  version: number;
  status: "draft" | "published";
  completionType: GoalCompletionType;
  completionDate?: ISO8601Date; // Use ISO8601Date
  progress?: {
    completedActivities: number;
    totalActivities: number;
    completed: boolean;
  };
  meta?: Record<string, any>;
}

export interface GoalCreateInput {
  slug: string;
  name: string; // Consider LocalizedString
  description: string; // Consider LocalizedString
  featuredImage?: string;
  category: GoalCategory;
  tags: string[];
  author: Author; // Might just need authorId depending on context
  isPublic: boolean;
  completionType: GoalCompletionType;
  completionDate?: ISO8601Date; // Use ISO8601Date
}

export interface IndefiniteGoal extends GoalBase {
  completionType: GoalCompletionType.INDEFINITE;
}

export interface ActivityGoal extends GoalBase {
  completionType: GoalCompletionType.ACTIVITY;
}

export interface DatetimeGoal extends GoalBase {
  completionType: GoalCompletionType.DATETIME;
  completionDate: ISO8601Date; // Make mandatory for this type
}

export type Goal = IndefiniteGoal | ActivityGoal | DatetimeGoal;

// --- LOGS ---

export interface LogBase {
  id: string;
  userId: string;
  goalId: string;
  activityId: string;
  createdAt: ISO8601Timestamp; // Standardized
  meta?: Record<string, any>;
}

export interface ActivityLog extends LogBase {
  type: LogType.ACTIVITY;
  completedAt?: ISO8601Timestamp; // Optional completion time
}

export interface PromptLog extends LogBase {
  type: LogType.PROMPT;
  sessionId?: string; // Optional: To group prompts answered together
  promptId: string;
  answerType: CompletionPromptAnswerType;
  answer: string | number | boolean | string[] | MediaAsset | null;
}

export interface StepLog extends LogBase {
  type: LogType.STEP;
  stepId: string;
  stepIndex: number;
  durationInSeconds?: number; // Optional: Time spent on step
}

export interface MediaUploadLog extends LogBase {
  type: LogType.MEDIA_UPLOAD;
  media: MediaAsset; // Details of the uploaded media
}

export interface FeedbackLog extends LogBase {
  type: LogType.FEEDBACK;
  authorType: "user" | "ai";
  authorId: string; // User ID or AI identifier
  feedback: string; // The feedback content
}

export type Log = ActivityLog | PromptLog | StepLog | MediaUploadLog | FeedbackLog;
export type LogCreateInput = Omit<Log, "id" | "createdAt">;

// Type guards for logs
export const isActivityLog = (log: Log): log is ActivityLog => log.type === LogType.ACTIVITY;
export const isPromptLog = (log: Log): log is PromptLog => log.type === LogType.PROMPT;
export const isStepLog = (log: Log): log is StepLog => log.type === LogType.STEP;
export const isMediaUploadLog = (log: Log): log is MediaUploadLog => log.type === LogType.MEDIA_UPLOAD;
export const isFeedbackLog = (log: Log): log is FeedbackLog => log.type === LogType.FEEDBACK;
