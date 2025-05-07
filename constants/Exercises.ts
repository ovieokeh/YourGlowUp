export interface Exercise {
  itemId: string;
  type: "exercise";
  name: string;
  area: string;
  duration: number;
  description: string;
  instructions: string[];
  featureImage: string;
  animation: string;
  color: string;
  itemsNeeded?: string[];
  notificationTimes?: string[] | null;
}

export const EXERCISES: Exercise[] = [
  {
    itemId: "tongue-posture",
    type: "exercise",
    name: "Tongue Posture (Mewing)",
    area: "Skull support",
    duration: 12,
    description: "Proper tongue posture trains the muscles that support the mid-face and skull base.",
    instructions: [
      "Close your lips gently.",
      "Place the entire tongue flat against the roof of your mouth — not just the tip.",
      "Keep your teeth lightly touching.",
      "Breathe through your nose.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/mewing-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/mewing-feature-image.png",
    color: "#FF5733",
  },
  {
    itemId: "chin-tuck",
    type: "exercise",
    name: "Chin Tucks",
    area: "Neck posture",
    duration: 45,
    description: "Chin tucks help align your cervical spine and strengthen deep neck flexors.",
    instructions: [
      "Stand or sit upright.",
      "Pull your chin straight back (not down), making a 'double chin'.",
      "Hold for 5 seconds, then relax. Repeat.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/chin-tuck-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/chin-tuck-feature-image.png",
    color: "#FAC800",
  },
  {
    itemId: "smile-symmetry",
    type: "exercise",
    name: "Smile Symmetry Drill",
    area: "Zygomatic control",
    duration: 60,
    description: "This trains symmetric engagement of the zygomatic muscles involved in smiling.",
    instructions: [
      "Look in a mirror.",
      "Smile slowly, focusing on even pull from both sides.",
      "Hold for 3–5 seconds, then relax.",
      "Repeat, correcting imbalances consciously.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/smile-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/smile-feature-image.png",
    color: "#00BFFF",
  },
  {
    itemId: "chewing",
    type: "exercise",
    name: "Chewing (Mastic Gum)",
    area: "Masseter hypertrophy",
    duration: 300,
    description: "Chewing tough gum targets the masseter muscles, enhancing jawline definition.",
    instructions: [
      "Use a piece of firm mastic gum.",
      "Chew evenly on both sides.",
      "Focus on controlled, deliberate motion.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/chewing-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/chewing-feature-image.png",
    color: "#DCFF00",
    itemsNeeded: ["gum"],
  },
  {
    itemId: "fish-face",
    type: "exercise",
    name: "Fish Face",
    area: "Buccinator tone",
    duration: 45,
    description: "This facial isometric strengthens the buccinator and improves cheek definition.",
    instructions: ["Suck in your cheeks like making a 'fish face'.", "Hold for 10 seconds.", "Relax and repeat."],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/fish-face-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/fish-face-feature-image.png",
    color: "#A0FF00",
  },
  {
    itemId: "jaw-push-resist",
    type: "exercise",
    name: "Jaw Push-Resist",
    area: "Jaw strength",
    duration: 60,
    description: "This isometric exercise strengthens jaw muscles through resistance.",
    instructions: [
      "Place your hand against your chin.",
      "Push your jaw forward while resisting with your hand.",
      "Hold for 5 seconds. Repeat from other directions (left, right).",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/jaw-push-resist-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/jaw-push-resist-feature-image.png",
    color: "#00FF7F",
  },
  {
    itemId: "neck-curl-ups",
    type: "exercise",
    name: "Neck Curl-Ups",
    area: "Cervical tone",
    duration: 60,
    description: "Neck curl-ups strengthen the anterior neck muscles and improve head posture.",
    instructions: [
      "Lie on your back with knees bent, tongue pressed to the roof of your mouth.",
      "Lift your chin toward your chest without lifting shoulders.",
      "Hold briefly and return slowly.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/neck-curl-ups-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/neck-curl-ups-feature-image.png",
    color: "#CEFF00",
  },
];

export interface Task {
  itemId: string;
  type: "task";
  name: string;
  area: string;
  description: string;
  frequency?: number;
  duration?: number;
  featureImage?: string;
  animation?: string;
  instructions?: string[];
  color?: string;
  itemsNeeded?: string[];
  notificationTimes?: string[] | null;
}
export const TASKS: Task[] = [
  {
    itemId: "cleanse",
    type: "task",
    name: "Cleanse",
    area: "Facial Care",
    frequency: 5,
    description: "Wash your face with a gentle cleanser to remove impurities.",
    instructions: [
      "Use lukewarm water to wet your face.",
      "Apply a small amount of cleanser to your fingertips.",
      "Gently massage the cleanser onto your face in circular motions.",
      "Rinse thoroughly with lukewarm water.",
      "Pat your face dry with a clean towel.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/cleanser-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/cleanser-feature-image.png",
    color: "#FF6347",
    itemsNeeded: ["cleanser"],
  },
  {
    itemId: "exfoliate",
    type: "task",
    name: "Exfoliate",
    area: "Facial Care",
    frequency: 10,
    description: "Exfoliate your skin to remove dead cells and promote cell turnover.",
    instructions: [
      "Apply a small amount of exfoliator to your fingertips.",
      "Gently massage it onto your face in circular motions, avoiding the eye area.",
      "Rinse thoroughly with lukewarm water.",
      "Pat your face dry with a clean towel.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/exfoliate-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/exfoliate-feature-image.png",
    color: "#FF8C00",
    itemsNeeded: ["exfoliator"],
  },
  {
    itemId: "serum",
    type: "task",
    name: "Apply Serum",
    area: "Facial Care",
    frequency: 1,
    description: "Apply a hydrating serum to nourish your skin.",
    instructions: [
      "Take a few drops of serum on your fingertips.",
      "Gently press the serum onto your face and neck.",
      "Allow it to absorb for a few minutes before applying moisturizer.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/serum-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/serum-feature-image.png",
    color: "#FF4500",
    itemsNeeded: ["serum"],
  },
  {
    itemId: "moisturize",
    type: "task",
    name: "Moisturize",
    area: "Facial Care",
    frequency: 2,
    description: "Use a moisturizer to lock in hydration.",
    instructions: [
      "Take a small amount of moisturizer on your fingertips.",
      "Gently massage it onto your face and neck in upward motions.",
      "Allow it to absorb for a few minutes before applying sunscreen.",
    ],
    itemsNeeded: ["moisturizer"],
  },
  {
    itemId: "sunscreen",
    type: "task",
    name: "Apply Sunscreen",
    area: "Facial Care",
    duration: 5,
    description: "Protect your skin with sunscreen.",
    instructions: [
      "Take a generous amount of sunscreen on your fingertips.",
      "Apply it evenly on your face and neck.",
      "Reapply every 2 hours if exposed to sunlight.",
    ],
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/sunscreen-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/sunscreen-feature-image.png",
    color: "#FFD700",
    itemsNeeded: ["sunscreen"],
  },
  {
    itemId: "hydrate",
    type: "task",
    name: "Hydrate",
    area: "Hydration",
    frequency: 30,
    description: "Drink a glass of water to stay hydrated.",
    featureImage:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/hydrate-feature-image.png",
    animation:
      "https://lvaengmvyffyrughoqmc.supabase.co/storage/v1/object/public/app-assets/images/hydrate-feature-image.png",
    color: "#00FF00",
    notificationTimes: ["random"],
  },
];

export const ROUTINES = [
  {
    itemId: "morning-routine",
    name: "Morning Routine",
    description: "A routine for facial care and exercises to start your day.",
    notificationTime: "08:00",
    steps: ["cleanse", "serum", "moisturize", "sunscreen", "smile-symmetry"],
  },
  {
    itemId: "self-love-routine",
    name: "Self-Love Routine",
    description: "A routine for keeping your skin and mind healthy.",
    notificationTime: "random",
    steps: ["hydrate", "breath", "tongue-posture"],
  },
  {
    itemId: "evening-routine",
    name: "Evening Routine",
    description: "A routine for facial care and exercises to end your day.",
    notificationTime: "20:00",
    steps: ["cleanse", "exfoliate", "serum", "moisturize", "fish-face", "chewing"],
  },
  {
    itemId: "workout-routine",
    name: "Workout Routine",
    description: "A routine for facial exercises to enhance your workout.",
    notificationTime: "07:00",
    steps: ["tongue-posture", "chin-tuck", "jaw-push-resist"],
  },
];
