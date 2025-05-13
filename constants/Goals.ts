import {
  ActivityType,
  Goal,
  GoalActivity,
  GoalActivityCompletionPromptAnswerType,
  GoalCategory,
  GoalCompletionType,
  NotificationRecurrence,
  UnlockConditionType,
} from "@/backend/shared";

export const DEFAULT_GOALS: Goal[] = [
  {
    id: "goal-mindful-morning-001",
    slug: "mindful-morning-routine",
    name: "Mindful Morning",
    description: "Start each day with intention and calmness through meditation and journaling.",
    featuredImage: "placeholder_image_url_mindful_mornings.jpg", // morning.jpg
    category: GoalCategory.SELF_CARE,
    tags: ["mindfulness", "meditation", "journaling", "well-being"],
    author: {
      id: "author-sharedstep-001",
      name: "SharedStep",
      avatarUrl: "",
    },
    createdAt: "2025-05-13T10:30:00Z",
    updatedAt: "2025-05-13T10:30:00Z",
    isPublic: true,
    version: 1,
    status: "published",
    completionType: GoalCompletionType.INDEFINITE,
    defaultRecurrence: NotificationRecurrence.DAILY,
    defaultScheduledTimes: ["07:00"],
    progress: {
      completedActivities: 0,
      totalActivities: 2,
      completed: false,
    },
    activities: [
      {
        id: "activity-guided-meditation-001",
        goalId: "goal-mindful-morning-001",
        slug: "daily-guided-meditation",
        name: "Daily Guided Meditation",
        description: "A 10-minute guided meditation to center yourself.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/meditation.jpg", // meditation.jpg
        type: ActivityType.GUIDED_ACTIVITY,
        category: GoalCategory.SELF_CARE,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          {
            id: "schedule-meditation-daily-0700",
            activityId: "activity-guided-meditation-001",
            timeOfDay: "07:00",
          },
        ],
        completionPrompts: [
          {
            id: "prompt-meditation-feeling-001",
            slug: "meditation-feeling-after",
            type: GoalActivityCompletionPromptAnswerType.SELECT,
            prompt: "How do you feel after your meditation session?",
            options: [
              { label: "Refreshed", value: "refreshed" },
              { label: "Calm", value: "calm" },
              { label: "Neutral", value: "neutral" },
              { label: "A bit Anxious", value: "anxious" },
            ],
          },
        ],
        steps: [
          {
            id: "step-meditation-intro-001",
            slug: "meditation-intro",
            content: "Welcome. Find a comfortable position, either sitting or lying down. Close your eyes gently.",
            instructionMedia: {
              type: "audio",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/audio/audio_meditation_intro.mp3",
              altText: "Audio introduction for meditation",
            },
            duration: 40,
            durationType: "seconds",
          },
          {
            id: "step-meditation-breathing-002",
            slug: "meditation-breathing-exercise",
            content:
              "Focus on your breath. Notice the sensation of air entering and leaving your body. Don't try to change it, just observe.",
            instructionMedia: {
              type: "audio",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/audio/audio_meditation_breathing.mp3",
            },
            duration: 3,
            durationType: "minutes",
          },
          {
            id: "step-meditation-bodyscan-003",
            slug: "meditation-body-scan",
            content:
              "Gently bring your awareness to different parts of your body, starting from your toes and moving up to the crown of your head. Notice any sensations without judgment.",
            instructionMedia: {
              type: "audio",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/audio/audio_meditation_bodyscan.mp3",
            },
            duration: 5,
            durationType: "minutes",
          },
          {
            id: "step-meditation-conclude-004",
            slug: "meditation-concluding",
            content:
              "Slowly bring your awareness back to the room. Wiggle your fingers and toes. When you're ready, gently open your eyes.",
            instructionMedia: {
              type: "audio",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/audio/audio_meditation_conclude.mp3",
            },
            duration: 1,
            durationType: "minutes",
          },
        ],
      },
      {
        id: "activity-morning-journaling-002",
        goalId: "goal-mindful-morning-001",
        slug: "daily-morning-journaling",
        name: "Morning Journaling",
        description: "Spend a few minutes journaling to set intentions and practice gratitude.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg", // journaling.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.SELF_CARE,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          {
            id: "schedule-journaling-daily-0715",
            activityId: "activity-morning-journaling-002",
            timeOfDay: "07:15",
          },
        ],
        completionPrompts: [
          {
            id: "prompt-journaling-grateful-001",
            slug: "journaling-grateful-for",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt: "What is one thing you are grateful for today?",
            minLength: 5,
            maxLength: 200,
            placeholder: "e.g., The warm sunshine, a good cup of coffee...",
          },
          {
            id: "prompt-journaling-intention-002",
            slug: "journaling-daily-intention",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt: "What is your main intention or focus for the day?",
            minLength: 5,
            maxLength: 200,
            placeholder: "e.g., To stay present, to complete my report...",
          },
        ],
        steps: [
          {
            id: "step-journaling-reflect-001",
            slug: "journaling-reflect-yesterday",
            content: "Briefly reflect on any insights or feelings from yesterday.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Journal prompt for reflection",
            },
          },
          {
            id: "step-journaling-plan-002",
            slug: "journaling-plan-today",
            content: "Write down your main intention for the day and 1-3 key tasks you'd like to accomplish.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Journal prompt for planning",
            },
          },
          {
            id: "step-journaling-gratitude-003",
            slug: "journaling-note-gratitude",
            content: "Note down at least one thing you are grateful for.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Journal prompt for gratitude",
            },
          },
        ],
      },
    ],
  },
  {
    id: "goal-piano-foundations-002",
    slug: "piano-foundations-scales-chords",
    name: "Piano Foundations: Scales & Chords",
    description: "Build a solid foundation in piano by practicing scales and basic chords.",
    featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/piano.jpg", // piano.jpg
    category: GoalCategory.HOBBY,
    tags: ["piano", "music", "practice", "beginner"],
    author: {
      id: "author-sharedstep-001",
      name: "SharedStep",
      avatarUrl: "",
    },
    createdAt: "2025-05-13T10:30:00Z",
    updatedAt: "2025-05-13T10:30:00Z",
    isPublic: true,
    version: 1,
    status: "published",
    completionType: GoalCompletionType.ACTIVITY,
    progress: {
      completedActivities: 0,
      totalActivities: 3,
      completed: false,
    },
    activities: [
      {
        id: "activity-piano-c-major-scale-001",
        goalId: "goal-piano-foundations-002",
        slug: "piano-c-major-scale-practice",
        name: "C Major Scale Practice",
        description: "Practice the C Major scale with both hands.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg", // sheet_music.jpg
        type: ActivityType.GUIDED_ACTIVITY,
        category: GoalCategory.HOBBY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          {
            id: "sched-piano-cmaj-mon",
            activityId: "activity-piano-c-major-scale-001",
            timeOfDay: "18:00",
            dayOfWeek: 1,
          },
          {
            id: "sched-piano-cmaj-wed",
            activityId: "activity-piano-c-major-scale-001",
            timeOfDay: "18:00",
            dayOfWeek: 3,
          },
          {
            id: "sched-piano-cmaj-fri",
            activityId: "activity-piano-c-major-scale-001",
            timeOfDay: "18:00",
            dayOfWeek: 5,
          },
        ],
        completionPrompts: [
          {
            id: "prompt-piano-fluency-001",
            slug: "piano-scale-fluency",
            type: GoalActivityCompletionPromptAnswerType.NUMBER,
            prompt: "Rate your fluency with the C Major scale today (1=Struggled, 5=Fluent):",
            min: 1,
            max: 5,
          },
          {
            id: "prompt-piano-recording-002",
            slug: "piano-scale-recording",
            type: GoalActivityCompletionPromptAnswerType.MEDIA,
            prompt: "Optional: Upload a short audio recording of your C Major scale practice.",
            media: { type: "audio", url: "placeholder_upload_icon.png" },
          },
        ],
        steps: [
          {
            id: "step-piano-cmaj-rh-001",
            slug: "piano-cmaj-right-hand",
            content:
              "Practice C Major scale, one octave, ascending and descending with your right hand. Focus on evenness and correct fingering.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/c-maj-scale-fingering-right.mp4",
              altText: "Video of C Major right hand",
            },
            duration: 3,
            durationType: "minutes",
          },
          {
            id: "step-piano-cmaj-lh-002",
            slug: "piano-cmaj-left-hand",
            content:
              "Practice C Major scale, one octave, ascending and descending with your left hand. Focus on evenness and correct fingering.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/c-maj-scale-fingering-left.mp4",
              altText: "Video of C Major left hand",
            },
            duration: 3,
            durationType: "minutes",
          },
          {
            id: "step-piano-cmaj-bh-003",
            slug: "piano-cmaj-both-hands",
            content:
              "Practice C Major scale, one octave, ascending and descending with both hands together. Start slowly.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/c-maj-scale-fingering-both.mp4",
              altText: "Video of C Major both hands",
            },
            duration: 4,
            durationType: "minutes",
          },
        ],
      },
      {
        id: "activity-piano-basic-chords-002",
        goalId: "goal-piano-foundations-002",
        slug: "piano-basic-chord-voicings",
        name: "Basic Chord Voicings (C, G, Am, F)",
        description: "Learn and practice basic voicings for C Major, G Major, A minor, and F Major chords.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/scale-practice.jpg", // scale-practice.jpg
        type: ActivityType.GUIDED_ACTIVITY,
        category: GoalCategory.HOBBY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          {
            id: "sched-piano-chords-tue",
            activityId: "activity-piano-basic-chords-002",
            timeOfDay: "18:00",
            dayOfWeek: 2,
          },
          {
            id: "sched-piano-chords-thu",
            activityId: "activity-piano-basic-chords-002",
            timeOfDay: "18:00",
            dayOfWeek: 4,
          },
        ],
        unlockCondition: UnlockConditionType.AFTER_COMPLETION,
        reliesOn: [{ slug: "piano-c-major-scale-practice" }],
        steps: [
          {
            id: "step-piano-chord-c-001",
            slug: "piano-chord-c-major",
            content: "Practice C Major triad (C-E-G) in root position and inversions.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "C Major chord diagram",
            },
            duration: 2,
            durationType: "minutes",
          },
          {
            id: "step-piano-chord-g-002",
            slug: "piano-chord-g-major",
            content: "Practice G Major triad (G-B-D) in root position and inversions.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "G Major chord diagram",
            },
            duration: 2,
            durationType: "minutes",
          },
          {
            id: "step-piano-chord-am-003",
            slug: "piano-chord-a-minor",
            content: "Practice A minor triad (A-C-E) in root position and inversions.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "A minor chord diagram",
            },
            duration: 2,
            durationType: "minutes",
          },
          {
            id: "step-piano-chord-f-004",
            slug: "piano-chord-f-major",
            content: "Practice F Major triad (F-A-C) in root position and inversions.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "F Major chord diagram",
            },
            duration: 2,
            durationType: "minutes",
          },
          {
            id: "step-piano-chord-trans-005",
            slug: "piano-chord-transitions",
            content: "Practice transitioning smoothly between C, G, Am, and F chords.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/c-g-am-f-transitions.mp4",
              altText: "Video of chord transitions",
            },
            duration: 3,
            durationType: "minutes",
          },
        ],
      },
      {
        id: "activity-piano-sight-reading-003",
        goalId: "goal-piano-foundations-002",
        slug: "piano-sight-reading-simple",
        name: "Sight-Reading Simple Piece",
        description: "Practice sight-reading a short, simple musical piece.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg", // sheet-music.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.HOBBY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          {
            id: "sched-piano-sightread-sat",
            activityId: "activity-piano-sight-reading-003",
            timeOfDay: "11:00",
            dayOfWeek: 6,
          },
        ],
        unlockCondition: UnlockConditionType.AFTER_COMPLETION,
        reliesOn: [{ slug: "piano-basic-chord-voicings" }],
        completionPrompts: [
          {
            id: "prompt-piano-sightread-complete-001",
            slug: "piano-sightread-completion-status",
            type: GoalActivityCompletionPromptAnswerType.BOOLEAN,
            prompt: "Were you able to play through the entire piece?",
          },
          {
            id: "prompt-piano-sightread-difficulty-002",
            slug: "piano-sightread-difficulty",
            type: GoalActivityCompletionPromptAnswerType.SELECT,
            prompt: "How difficult did you find this piece?",
            options: [
              { label: "Very Easy", value: "very_easy" },
              { label: "Easy", value: "easy" },
              { label: "Moderate", value: "moderate" },
              { label: "Difficult", value: "difficult" },
              { label: "Very Difficult", value: "very_difficult" },
            ],
            dependsOn: {
              slug: "piano-sightread-completion-status",
              value: true,
            },
          },
        ],
        steps: [
          {
            id: "step-piano-sr-analyze-001",
            slug: "piano-sr-analyze",
            content: "Analyze the piece: Identify key signature, time signature, and any difficult rhythms or notes.",
            instructionMedia: {
              type: GoalActivityCompletionPromptAnswerType.DOCUMENT,
              url: "placeholder_document_simple_piece.pdf",
              altText: "Sheet music for simple piece",
            },
          },
          {
            id: "step-piano-sr-rhythm-002",
            slug: "piano-sr-rhythm",
            content: "Clap or tap out the rhythm of the piece.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "Music notation example",
            },
          },
          {
            id: "step-piano-sr-play-slow-003",
            slug: "piano-sr-play-slowly",
            content: "Play through the piece slowly, focusing on accuracy.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "Hands on piano",
            },
          },
          {
            id: "step-piano-sr-play-tempo-004",
            slug: "piano-sr-play-tempo",
            content: "Once comfortable, try playing the piece at the indicated tempo.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sheet-music.jpg",
              altText: "Metronome",
            },
          },
        ],
      },
    ],
  },
  {
    id: "goal-daily-drawing-challenge-003",
    slug: "30-day-drawing-challenge",
    name: "30-Day Daily Drawing Challenge",
    description: "Develop a consistent drawing habit by sketching daily for 30 days.",
    featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/drawing.jpg", // drawing.jpg
    category: GoalCategory.HOBBY,
    tags: ["drawing", "sketching", "art", "creativity", "habit"],
    author: {
      id: "author-sharedstep-001",
      name: "SharedStep",
      avatarUrl: "",
    },
    createdAt: "2025-05-13T10:30:00Z",
    updatedAt: "2025-05-13T10:30:00Z",
    isPublic: false,
    version: 1,
    status: "published",
    completionType: GoalCompletionType.DATETIME,
    completionDate: "2025-06-12",
    defaultRecurrence: NotificationRecurrence.DAILY,
    defaultScheduledTimes: ["19:00"],
    progress: {
      completedActivities: 0,
      totalActivities: 1,
      completed: false,
    },
    activities: [
      {
        id: "activity-daily-sketch-001",
        goalId: "goal-daily-drawing-challenge-003",
        slug: "daily-sketch-session",
        name: "Daily Sketch Session",
        description:
          "Dedicate at least 15 minutes to sketching. You can use a daily prompt or choose your own subject.",
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sketching.jpg", // sketching.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.HOBBY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          {
            id: "schedule-sketch-daily-1900",
            activityId: "activity-daily-sketch-001",
            timeOfDay: "19:00",
          },
        ],
        completionPrompts: [
          {
            id: "prompt-sketch-subject-001",
            slug: "sketch-subject-today",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt: "What was the subject of your sketch today?",
            minLength: 3,
            maxLength: 150,
            placeholder: "e.g., My cat, a tree outside, a still life...",
          },
          {
            id: "prompt-sketch-upload-002",
            slug: "sketch-upload-artwork",
            type: GoalActivityCompletionPromptAnswerType.MEDIA,
            prompt: "Upload your sketch for today!",
            media: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/review-checklist.jpg", // review-checklist.jpg
              altText: "Upload your sketch",
            },
          },
          {
            id: "prompt-sketch-enjoyment-003",
            slug: "sketch-session-enjoyment",
            type: GoalActivityCompletionPromptAnswerType.BOOLEAN,
            prompt: "Did you enjoy today's sketching session?",
          },
        ],
        steps: [
          {
            id: "step-sketch-prompt-001",
            slug: "sketch-choose-prompt",
            content:
              "Find a drawing prompt for today (you can search online for 'daily drawing prompts' or use one from a personal list). Alternatively, choose any subject that inspires you.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sketching.jpg", // drawing_prompts.jpg
              altText: "Example drawing prompts",
            },
          },
          {
            id: "step-sketch-draw-002",
            slug: "sketch-draw-for-15-min",
            content:
              "Set a timer for at least 15 minutes and start sketching. Focus on observation and letting your creativity flow.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/sketching.jpg", // sketching.jpg
              altText: "Timer and sketchbook",
            },
          },
          {
            id: "step-sketch-review-003",
            slug: "sketch-review-your-work",
            content:
              "Once done, take a moment to look at your sketch. What do you like about it? What could you explore next time?",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/review-checklist.jpg", // complete.jpg
              altText: "Reviewing a sketch",
            },
          },
        ],
      },
    ],
  },
  {
    id: "goal-fitness-kickstart-004",
    slug: "30-day-fitness-kickstart",
    name: "30-Day Fitness Kickstart",
    description: "Get active and build a consistent workout habit over 30 days with a mix of strength and cardio.",
    featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/fitness.jpg", // fitness.jpg
    category: GoalCategory.FITNESS,
    tags: ["fitness", "workout", "exercise", "health", "strength", "cardio"],
    author: {
      id: "author-sharedstep-001",
      name: "SharedStep",
      avatarUrl: "",
    },
    createdAt: "2025-05-13T10:30:00Z",
    updatedAt: "2025-05-13T10:30:00Z",
    isPublic: true,
    version: 1,
    status: "published",
    completionType: GoalCompletionType.ACTIVITY,
    progress: {
      completedActivities: 0,
      totalActivities: 3,
      completed: false,
    },
    activities: [
      {
        id: "activity-fitness-fullbody-001",
        goalId: "goal-fitness-kickstart-004",
        slug: "fitness-day-1-full-body",
        name: "Day 1: Full Body Workout",
        description: "A guided full-body strength workout.",
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/workout.jpg", // workout.jpg
        type: ActivityType.GUIDED_ACTIVITY,
        category: GoalCategory.FITNESS,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          { id: "schedule-fw-mon", activityId: "activity-fitness-fullbody-001", timeOfDay: "08:00", dayOfWeek: 1 },
          { id: "schedule-fw-wed", activityId: "activity-fitness-fullbody-001", timeOfDay: "08:00", dayOfWeek: 3 },
          { id: "schedule-fw-fri", activityId: "activity-fitness-fullbody-001", timeOfDay: "08:00", dayOfWeek: 5 },
        ],
        completionPrompts: [
          {
            id: "prompt-fitness-pushups-001",
            slug: "fitness-pushups-last-set",
            type: GoalActivityCompletionPromptAnswerType.NUMBER,
            prompt: "How many push-ups did you complete in your last set?",
            min: 0,
            max: 100,
          },
          {
            id: "prompt-fitness-intensity-002",
            slug: "fitness-workout-intensity",
            type: GoalActivityCompletionPromptAnswerType.SELECT,
            prompt: "Rate the intensity of this workout:",
            options: [
              { label: "Easy", value: "easy" },
              { label: "Moderate", value: "moderate" },
              { label: "Hard", value: "hard" },
            ],
          },
        ],
        steps: [
          {
            id: "step-fbw-warmup-001",
            slug: "fbw-warmup",
            content: "Dynamic Warm-up: Arm circles, leg swings, torso twists.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/full-body-warm-up-5-mins.mp4",
              altText: "Warm-up exercises video",
            },
            duration: 5,
            durationType: "minutes",
          },
          {
            id: "step-fbw-squats-002",
            slug: "fbw-squats",
            content:
              "Bodyweight Squats: 3 sets of 10-15 repetitions. Focus on form: chest up, back straight, descend until thighs are parallel to the ground.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/how-to-do-squat.mp4",
              altText: "Squat demonstration video",
            },
            duration: 5,
            durationType: "minutes",
          },
          {
            id: "step-fbw-pushups-003",
            slug: "fbw-pushups",
            content: "Push-ups (or Knee Push-ups): 3 sets of maximum repetitions with good form.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/how-to-do-pushup.mp4",
              altText: "Push-up demonstration video",
            },
            duration: 5,
            durationType: "minutes",
          },
          {
            id: "step-fbw-plank-004",
            slug: "fbw-plank",
            content: "Plank: 3 sets, hold for 30-60 seconds. Maintain a straight line from head to heels.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/how-to-do-plank.mp4",
              altText: "Plank demonstration video",
            },
            duration: 4,
            durationType: "minutes",
          },
          {
            id: "step-fbw-cooldown-005",
            slug: "fbw-cooldown",
            content:
              "Cool-down: Static stretches, holding each for 30 seconds (e.g., quad stretch, hamstring stretch, chest stretch).",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/full-body-warm-up-5-mins.mp4",
              altText: "Cool-down stretches video",
            },
            duration: 5,
            durationType: "minutes",
          },
        ],
      },
      {
        id: "activity-fitness-cardio-002",
        goalId: "goal-fitness-kickstart-004",
        slug: "fitness-day-2-cardio-blast",
        name: "Day 2: Cardio Blast",
        description: "A guided cardio session to improve endurance.",
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/cardio.jpg", // cardio.jpg
        type: ActivityType.GUIDED_ACTIVITY,
        category: GoalCategory.FITNESS,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          { id: "schedule-cardio-tue", activityId: "activity-fitness-cardio-002", timeOfDay: "08:00", dayOfWeek: 2 },
          { id: "schedule-cardio-thu", activityId: "activity-fitness-cardio-002", timeOfDay: "08:00", dayOfWeek: 4 },
        ],
        unlockCondition: UnlockConditionType.AFTER_X_DAYS,
        unlockParams: { days: 1 },
        completionPrompts: [
          {
            id: "prompt-fitness-distance-001",
            slug: "fitness-cardio-distance",
            type: GoalActivityCompletionPromptAnswerType.NUMBER,
            prompt: "Approximately how much distance did you cover (in km)?",
            min: 0,
            max: 50,
          },
        ],
        steps: [
          {
            id: "step-cardio-warmup-001",
            slug: "cardio-brisk-walk-warmup",
            content: "Brisk Walk Warm-up: Start with a 5-minute brisk walk to get your heart rate up.",
            duration: 5,
            durationType: "minutes",
          },
          {
            id: "step-cardio-jog-002",
            slug: "cardio-jogging-interval",
            content: "Jogging: Maintain a steady jog for 15 minutes. Adjust pace as needed.",
            duration: 15,
            durationType: "minutes",
          },
          {
            id: "step-cardio-sprints-003",
            slug: "cardio-sprints-interval",
            content:
              "Sprints: Perform 5 sets of 30-second sprints followed by 1 minute of walking or light jogging for recovery.",
            duration: 7,
            durationType: "minutes",
          },
          {
            id: "step-cardio-cooldown-004",
            slug: "cardio-cooldown-walk",
            content: "Cool-down Walk: Finish with a 5-minute cool-down walk and light stretching.",
            duration: 5,
            durationType: "minutes",
          },
        ],
      },
      {
        id: "activity-fitness-recovery-003",
        goalId: "goal-fitness-kickstart-004",
        slug: "fitness-active-recovery-stretch",
        name: "Active Recovery & Stretch",
        description: "Light activity and stretching to aid muscle recovery.",
        featuredImage:
          "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/stretching.jpg", // stretching.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.FITNESS,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.WEEKLY,
        schedules: [
          {
            id: "schedule-recovery-sat",
            activityId: "activity-fitness-recovery-003",
            timeOfDay: "09:00",
            dayOfWeek: 6,
          },
        ],
        completionPrompts: [
          {
            id: "prompt-fitness-muscle-feel-001",
            slug: "fitness-muscle-feeling",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt: "How are your muscles feeling today after the week's workouts?",
            minLength: 5,
            maxLength: 300,
            placeholder: "e.g., A bit sore but good, energized, tired...",
          },
        ],
        steps: [
          {
            id: "step-recovery-walk-001",
            slug: "recovery-light-walk",
            content: "Go for a light 15-20 minute walk.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/couple-walking.jpg", // walking.jpg
              altText: "Scenic walking path",
            },
          },
          {
            id: "step-recovery-stretch-002",
            slug: "recovery-full-body-stretch",
            content:
              "Perform a full-body stretching routine. Hold each stretch for 30 seconds. Include stretches for legs, back, chest, and arms.",
            instructionMedia: {
              type: "video",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/video/full-body-warm-up-5-mins.mp4",
              altText: "Full body stretching routine video",
            },
          },
        ],
      },
    ],
  },
  {
    id: "goal-read-thinking-fast-slow-005",
    slug: "read-thinking-fast-and-slow",
    name: 'Read "Thinking, Fast and Slow" by Daniel Kahneman',
    description: "Dive into the complexities of human thought and decision-making by reading this influential book.",
    featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/reading.jpg", // reading.jpg
    category: GoalCategory.PRODUCTIVITY,
    tags: ["reading", "psychology", "decision-making", "learning", "self-improvement"],
    author: {
      id: "author-sharedstep-001",
      name: "SharedStep",
      avatarUrl: "",
    },
    createdAt: "2025-05-13T10:30:00Z",
    updatedAt: "2025-05-13T10:30:00Z",
    isPublic: true,
    version: 1,
    status: "published",
    completionType: GoalCompletionType.ACTIVITY,
    progress: {
      completedActivities: 0,
      totalActivities: 3,
      completed: false,
    },
    activities: [
      {
        id: "activity-read-tfs-part1-001",
        goalId: "goal-read-thinking-fast-slow-005",
        slug: "read-tfs-part-1",
        name: "Read Part 1: Two Systems (Chapters 1-9)",
        description: 'Read and reflect on the first part of "Thinking, Fast and Slow".',
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/book.jpg", // book.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.PRODUCTIVITY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          { id: "schedule-read-tfs-daily-2100", activityId: "activity-read-tfs-part1-001", timeOfDay: "21:00" },
        ],
        completionPrompts: [
          {
            id: "prompt-read-tfs-p1-takeaway-001",
            slug: "read-tfs-p1-key-takeaway",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt: "What was your most significant takeaway from today's reading session in Part 1?",
            minLength: 10,
            maxLength: 500,
            placeholder: "Describe a concept or idea that stood out...",
          },
          {
            id: "prompt-read-tfs-p1-pages-002",
            slug: "read-tfs-p1-pages-read",
            type: GoalActivityCompletionPromptAnswerType.NUMBER,
            prompt: "How many pages did you read today?",
            min: 1,
            max: 200,
          },
        ],
        steps: [
          {
            id: "step-read-tfs-p1-allocate-001",
            slug: "read-tfs-p1-allocate-time",
            content: "Allocate 30-45 minutes for focused reading. Find a quiet place.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/person-reading.jpg", // person-reading.jpg
              altText: "Quiet reading environment",
            },
          },
          {
            id: "step-read-tfs-p1-read-002",
            slug: "read-tfs-p1-read-chapters",
            content: "Read through the assigned chapters for Part 1. Take brief notes on key concepts.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/book.jpg", // book.jpg
              altText: "Notebook and pen for notes",
            },
          },
          {
            id: "step-read-tfs-p1-reflect-003",
            slug: "read-tfs-p1-reflect",
            content:
              "After reading, spend 5 minutes reflecting on what you've learned and how it relates to your own experiences.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Person thinking or reflecting",
            },
          },
        ],
      },
      {
        id: "activity-read-tfs-part2-002",
        goalId: "goal-read-thinking-fast-slow-005",
        slug: "read-tfs-part-2",
        name: "Read Part 2: Heuristics and Biases (Chapters 10-18)",
        description: "Explore the heuristics and biases discussed in the second part of the book.",
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/reading.jpg", // reading.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.PRODUCTIVITY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          { id: "schedule-read-tfs-p2-daily-2100", activityId: "activity-read-tfs-part2-002", timeOfDay: "21:00" },
        ],
        unlockCondition: UnlockConditionType.AFTER_COMPLETION,
        reliesOn: [{ slug: "read-tfs-part-1" }],
        completionPrompts: [
          {
            id: "prompt-read-tfs-p2-surprising-001",
            slug: "read-tfs-p2-surprising-concept",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt:
              "What was one concept from Part 2 (Heuristics and Biases) that you found particularly surprising or insightful?",
            minLength: 10,
            maxLength: 500,
          },
        ],
        steps: [
          {
            id: "step-read-tfs-p2-allocate-001",
            slug: "read-tfs-p2-allocate-time",
            content: "Dedicate 30-45 minutes for your reading session.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/person-reading.jpg", // person-reading.jpg
              altText: "Quiet reading environment",
            },
          },
          {
            id: "step-read-tfs-p2-read-002",
            slug: "read-tfs-p2-read-chapters",
            content:
              "Read through the chapters in Part 2. Try to identify examples of these heuristics and biases in your own thinking or observations.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/book.jpg", // book.jpg
              altText: "Book with highlighted text",
            },
          },
          {
            id: "step-read-tfs-p2-summarize-003",
            slug: "read-tfs-p2-summarize",
            content: "Briefly summarize each chapter or key bias discussed in your notes.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Summary notes",
            },
          },
        ],
      },
      {
        id: "activity-read-tfs-part3-003",
        goalId: "goal-read-thinking-fast-slow-005",
        slug: "read-tfs-part-3",
        name: "Read Part 3: Overconfidence (Chapters 19-24)",
        description: "Delve into the concepts of overconfidence and the illusion of understanding in Part 3.",
        featuredImage: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/reading.jpg", // reading.jpg
        type: ActivityType.TASK_ACTIVITY,
        category: GoalCategory.PRODUCTIVITY,
        notificationsEnabled: true,
        recurrence: NotificationRecurrence.DAILY,
        schedules: [
          { id: "schedule-read-tfs-p3-daily-2100", activityId: "activity-read-tfs-part3-003", timeOfDay: "21:00" },
        ],
        unlockCondition: UnlockConditionType.AFTER_COMPLETION,
        reliesOn: [{ slug: "read-tfs-part-2" }],
        completionPrompts: [
          {
            id: "prompt-read-tfs-p3-application-001",
            slug: "read-tfs-p3-apply-systems",
            type: GoalActivityCompletionPromptAnswerType.TEXT,
            prompt:
              "How can you consciously apply the understanding of System 1 vs. System 2 thinking (from the whole book, but particularly relevant after Part 3) in your upcoming week?",
            minLength: 10,
            maxLength: 500,
          },
        ],
        steps: [
          {
            id: "step-read-tfs-p3-allocate-001",
            slug: "read-tfs-p3-allocate-time",
            content: "Set aside 30-45 minutes for today's reading.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/person-reading.jpg", // person-reading.jpg
              altText: "Quiet reading environment",
            },
          },
          {
            id: "step-read-tfs-p3-read-002",
            slug: "read-tfs-p3-read-chapters",
            content: "Read the chapters in Part 3. Pay attention to how overconfidence can affect judgment.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/book.jpg", // book.jpg
              altText: "Book with reading glasses",
            },
          },
          {
            id: "step-read-tfs-p3-identify-apps-003",
            slug: "read-tfs-p3-identify-applications",
            content:
              "Think about practical applications of the concepts in your personal or professional life. Note them down.",
            instructionMedia: {
              type: "image",
              url: "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/content/images/journaling.jpg",
              altText: "Idea lightbulb",
            },
          },
        ],
      },
    ],
  },
];

export const DEFAULT_ACTIVITIES: Omit<GoalActivity, "goalId">[] = DEFAULT_GOALS.flatMap((goal) =>
  goal.activities.map((activity) => ({
    ...activity,
    goalId: goal.id,
  }))
);
