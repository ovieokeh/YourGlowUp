// --- ENUMS ---

export enum GoalCompletionType {
  INDEFINITE = "INFINITE",
  ACTIVITY = "ACTACTIVITY",
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

export enum ActivityType {
  GUIDED_ACTIVITY = "GUIDED_ACTIVITY",
  TASK_ACTIVITY = "TASK_ACTIVITY",
}

export enum GoalActivityCompletionPromptAnswerType {
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

// --- SUPPORT TYPES ---

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
  type: "image" | "video" | "audio";
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

export interface GoalActivityCompletionPromptBase {
  id: string;
  slug: string;
  prompt: string;
  reliesOn?: string;
  dependsOn?: PromptDependency | PromptDependency[] | PromptConditionGroup;
  validationRules?: Record<string, any>;
}

export interface GoalActivityCompletionPromptText extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.TEXT;
  minLength: number;
  maxLength: number;
  placeholder?: string;
}

export interface GoalActivityCompletionPromptNumber extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.NUMBER;
  min: number;
  max: number;
}

export interface GoalActivityCompletionPromptBoolean extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.BOOLEAN;
}

export interface GoalActivityCompletionPromptSelect extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.SELECT;
  options: { label: string; value: string }[];
}

export interface GoalActivityCompletionPromptMedia extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.MEDIA;
  media: MediaAsset;
}

export interface GoalActivityCompletionPromptDocument extends GoalActivityCompletionPromptBase {
  type: GoalActivityCompletionPromptAnswerType.DOCUMENT;
  documentType: "pdf" | "doc";
}

export type GoalActivityCompletionPrompt =
  | GoalActivityCompletionPromptText
  | GoalActivityCompletionPromptNumber
  | GoalActivityCompletionPromptBoolean
  | GoalActivityCompletionPromptSelect
  | GoalActivityCompletionPromptMedia
  | GoalActivityCompletionPromptDocument;

export interface PromptAnswer {
  promptId: string;
  type: GoalActivityCompletionPromptAnswerType;
  value: string | number | boolean | string[] | MediaAsset | null;
}

// --- ACTIVITIES ---

export interface ActivityDependency {
  slug: string;
}

export enum NotificationRecurrence {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface ActivityBase {
  id: string;
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  type: ActivityType;
  category: GoalCategory;
  notificationsEnabled: boolean;
  scheduledTimes?: string[]; // e.g., ['08:00', 'monday-08:00']
  recurrence?: NotificationRecurrence;
  completionPrompts?: GoalActivityCompletionPrompt[];
  reliesOn?: ActivityDependency[];
  unlockCondition?: UnlockConditionType;
  unlockParams?: { days?: number; date?: string };
  meta?: Record<string, any>;
}
export const hasCompletionPrompts = (activity: ActivityBase): boolean =>
  !!activity.completionPrompts && activity.completionPrompts.length > 0;

export interface GuidedActivityStep {
  id: string;
  slug: string;
  content: string;
  instructionMedia: MediaAsset;
  duration: number;
  durationType: "seconds" | "minutes" | "hours";
  visibleIf?: PromptDependency[];
}

export interface GuidedActivity extends ActivityBase {
  type: ActivityType.GUIDED_ACTIVITY;
  steps: GuidedActivityStep[];
}

export interface TaskActivityStep {
  id: string;
  slug: string;
  content: string;
  instructionMedia: MediaAsset;
}

export interface TaskActivity extends ActivityBase {
  type: ActivityType.TASK_ACTIVITY;
  steps: TaskActivityStep[];
}

export type GoalActivity = GuidedActivity | TaskActivity;
export const isTaskActivity = (activity: GoalActivity): activity is TaskActivity =>
  activity.type === ActivityType.TASK_ACTIVITY;
export const isGuidedActivity = (activity: GoalActivity): activity is GuidedActivity =>
  activity.type === ActivityType.GUIDED_ACTIVITY;

// --- GOALS ---

export interface GoalBase {
  id: string;
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  category: GoalCategory;
  tags: string[];
  activities: GoalActivity[];
  author: Author;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  version: number;
  status: "draft" | "published";
  completionType: GoalCompletionType;
  completionDate?: string;
  defaultRecurrence?: "daily" | "weekly";
  defaultScheduledTimes?: string[];
  progress?: {
    completedActivities: number;
    totalActivities: number;
    completed: boolean;
  };
  meta?: Record<string, any>;
}

export interface GoalCreateInput {
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  category: GoalCategory;
  tags: string[];
  author: Author;
  isPublic: boolean;
  defaultRecurrence?: "daily" | "weekly";
  defaultScheduledTimes?: string[];
  completionType: GoalCompletionType;
  completionDate?: string;
}

export interface ActivityCreateInput {
  slug: string;
  name: string;
  description: string;
  featuredImage?: string;
  category: GoalCategory;
  notificationsEnabled: boolean;
  scheduledTimes?: string[]; // e.g., ['08:00', 'monday-08:00']
  recurrence?: "daily" | "weekly";
  completionPrompts?: GoalActivityCompletionPrompt[];
  reliesOn?: ActivityDependency[];
  unlockCondition?: UnlockConditionType;
  unlockParams?: { days?: number; date?: string };
}

export interface IndefiniteGoal extends GoalBase {
  completionType: GoalCompletionType.INDEFINITE;
}

export interface ActivityGoal extends GoalBase {
  completionType: GoalCompletionType.ACTIVITY;
}

export interface DatetimeGoal extends GoalBase {
  completionType: GoalCompletionType.DATETIME;
  completionDate: string;
}

export type Goal = IndefiniteGoal | ActivityGoal | DatetimeGoal;

export enum LogType {
  ACTIVITY = "activity", // general log: completed activity
  PROMPT = "prompt", // logs for user-entered answers
  STEP = "step", // logs for guided step progression
  MEDIA_UPLOAD = "media_upload", // photos, audio, etc.
  FEEDBACK = "feedback", // optional: GPT coach feedback log
}

export type ISO8601Timestamp = string;

export interface LogBase {
  id: string;
  userId: string;
  goalId: string;
  createdAt: ISO8601Timestamp;
  meta?: Record<string, any>;
}

export interface ActivityLog extends LogBase {
  type: LogType.ACTIVITY;
  activityId: string;
  activityType: ActivityType;
  completedAt?: ISO8601Timestamp;
}

export interface PromptLog extends LogBase {
  type: LogType.PROMPT;
  activityId: string;
  sessionId?: string;
  promptId: string;
  answerType: GoalActivityCompletionPromptAnswerType;
  answer: string | number | boolean | string[] | MediaAsset | null;
}

export interface StepLog extends LogBase {
  type: LogType.STEP;
  activityId: string;
  stepId: string;
  stepIndex: number;
  durationInSeconds?: number;
}

export interface MediaUploadLog extends LogBase {
  type: LogType.MEDIA_UPLOAD;
  media: MediaAsset;
}

export interface FeedbackLog extends LogBase {
  type: LogType.FEEDBACK;
  authorType: "user" | "ai";
  authorId: string;
  feedback: string;
}

export type Log = ActivityLog | PromptLog | StepLog | MediaUploadLog | FeedbackLog;

export const isActivityLog = (log: Log): log is ActivityLog => log.type === LogType.ACTIVITY;
export const isPromptLog = (log: Log): log is PromptLog => log.type === LogType.PROMPT;
export const isStepLog = (log: Log): log is StepLog => log.type === LogType.STEP;
export const isMediaUploadLog = (log: Log): log is MediaUploadLog => log.type === LogType.MEDIA_UPLOAD;
export const isFeedbackLog = (log: Log): log is FeedbackLog => log.type === LogType.FEEDBACK;
