export interface Exercise {
  id: string
  name: string
  description: string
  instructions: string[]
  tips: string[]
  muscleGroups: string[]
  equipment?: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: "Strength" | "Cardio" | "Flexibility" | "Sports"
  videoUrl?: string
  isCustom?: boolean
}

export const exerciseDatabase: Exercise[] = [
  // CHEST EXERCISES
  {
    id: "push-ups",
    name: "Push-ups",
    description: "Classic bodyweight exercise targeting chest, shoulders, and triceps",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulder-width",
      "Keep your body in a straight line from head to heels",
      "Lower your chest toward the ground by bending your elbows",
      "Push back up to the starting position",
      "Repeat for desired repetitions",
    ],
    tips: [
      "Keep your core engaged throughout the movement",
      "Don't let your hips sag or pike up",
      "Modify on knees if full push-ups are too difficult",
      "Focus on controlled movement rather than speed",
    ],
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Core"],
    equipment: ["Bodyweight"],
    difficulty: "Beginner",
    category: "Strength",
    videoUrl: "/placeholder-video.mp4",
  },
  {
    id: "bench-press",
    name: "Bench Press",
    description: "Fundamental chest exercise using a barbell",
    instructions: [
      "Lie on bench with eyes under the barbell",
      "Grip the bar with hands slightly wider than shoulder-width",
      "Unrack the bar and position it over your chest",
      "Lower the bar to your chest with control",
      "Press the bar back up to full arm extension",
    ],
    tips: [
      "Keep your feet flat on the floor",
      "Maintain a slight arch in your back",
      "Don't bounce the bar off your chest",
      "Use a spotter for heavy weights",
    ],
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    equipment: ["Barbell", "Bench"],
    difficulty: "Intermediate",
    category: "Strength",
  },
  {
    id: "dumbbell-flyes",
    name: "Dumbbell Flyes",
    description: "Isolation exercise for chest development",
    instructions: [
      "Lie on bench holding dumbbells above your chest",
      "Lower the weights in a wide arc with slight bend in elbows",
      "Feel a stretch in your chest at the bottom",
      "Bring the weights back together above your chest",
      "Squeeze your chest muscles at the top",
    ],
    tips: [
      "Use lighter weight than bench press",
      "Focus on the stretch and squeeze",
      "Don't lower weights too far to avoid shoulder strain",
      "Maintain slight bend in elbows throughout",
    ],
    muscleGroups: ["Chest"],
    equipment: ["Dumbbells", "Bench"],
    difficulty: "Intermediate",
    category: "Strength",
  },

  // BACK EXERCISES
  {
    id: "pull-ups",
    name: "Pull-ups",
    description: "Compound upper body exercise targeting back and biceps",
    instructions: [
      "Hang from pull-up bar with overhand grip",
      "Start with arms fully extended",
      "Pull your body up until chin clears the bar",
      "Lower yourself back down with control",
      "Repeat for desired repetitions",
    ],
    tips: [
      "Engage your lats and squeeze shoulder blades",
      "Avoid swinging or using momentum",
      "Use assistance bands if needed",
      "Focus on full range of motion",
    ],
    muscleGroups: ["Back", "Biceps", "Shoulders"],
    equipment: ["Pull-up Bar"],
    difficulty: "Advanced",
    category: "Strength",
  },
  {
    id: "barbell-rows",
    name: "Barbell Rows",
    description: "Compound back exercise for building width and thickness",
    instructions: [
      "Stand with feet hip-width apart, holding barbell",
      "Hinge at hips and lean forward with straight back",
      "Let the bar hang at arm's length",
      "Pull the bar to your lower chest/upper abdomen",
      "Lower the bar back down with control",
    ],
    tips: [
      "Keep your back straight throughout",
      "Squeeze shoulder blades together at the top",
      "Don't use your lower back to lift the weight",
      "Pull with your elbows, not your hands",
    ],
    muscleGroups: ["Back", "Biceps", "Shoulders"],
    equipment: ["Barbell"],
    difficulty: "Intermediate",
    category: "Strength",
  },
  {
    id: "dumbbell-rows",
    name: "Dumbbell Rows",
    description: "Unilateral back exercise for balanced development",
    instructions: [
      "Place one knee and hand on bench for support",
      "Hold dumbbell in opposite hand with arm extended",
      "Pull the dumbbell to your hip, leading with your elbow",
      "Squeeze your shoulder blade at the top",
      "Lower the weight back down with control",
    ],
    tips: [
      "Keep your back flat and core engaged",
      "Don't rotate your torso during the movement",
      "Focus on pulling with your back, not your arm",
      "Use full range of motion",
    ],
    muscleGroups: ["Back", "Biceps"],
    equipment: ["Dumbbells", "Bench"],
    difficulty: "Beginner",
    category: "Strength",
  },

  // SHOULDER EXERCISES
  {
    id: "overhead-press",
    name: "Overhead Press",
    description: "Compound shoulder exercise for building strength and stability",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Hold barbell or dumbbells at shoulder height",
      "Press the weight straight up overhead",
      "Lock out your arms at the top",
      "Lower the weight back to shoulder height",
    ],
    tips: [
      "Keep your core tight throughout",
      "Don't arch your back excessively",
      "Press the weight in a straight line",
      "Start with lighter weight to master form",
    ],
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    equipment: ["Barbell", "Dumbbells"],
    difficulty: "Intermediate",
    category: "Strength",
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    description: "Isolation exercise for shoulder width",
    instructions: [
      "Stand with dumbbells at your sides",
      "Raise the weights out to your sides",
      "Lift until arms are parallel to the floor",
      "Hold briefly at the top",
      "Lower the weights back down slowly",
    ],
    tips: [
      "Use lighter weights than you think",
      "Lead with your pinkies, not your thumbs",
      "Don't swing or use momentum",
      "Focus on controlled movement",
    ],
    muscleGroups: ["Shoulders"],
    equipment: ["Dumbbells"],
    difficulty: "Beginner",
    category: "Strength",
  },

  // LEG EXERCISES
  {
    id: "squats",
    name: "Squats",
    description: "Fundamental lower body exercise",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending at hips and knees",
      "Keep your chest up and knees tracking over toes",
      "Descend until thighs are parallel to floor",
      "Drive through your heels to return to standing",
    ],
    tips: [
      "Keep your weight on your heels",
      "Don't let knees cave inward",
      "Maintain neutral spine throughout",
      "Go as deep as your mobility allows",
    ],
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: ["Bodyweight", "Barbell"],
    difficulty: "Beginner",
    category: "Strength",
  },
  {
    id: "lunges",
    name: "Lunges",
    description: "Unilateral leg exercise for balance and strength",
    instructions: [
      "Stand with feet hip-width apart",
      "Step back with one leg into a lunge position",
      "Lower your body until both knees are at 90 degrees",
      "Push through your front heel to return to start",
      "Repeat on the other side",
    ],
    tips: [
      "Keep most of your weight on your front leg",
      "Don't let your front knee go past your toes",
      "Keep your torso upright",
      "Step back rather than forward for better balance",
    ],
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: ["Bodyweight", "Dumbbells"],
    difficulty: "Beginner",
    category: "Strength",
  },
  {
    id: "deadlifts",
    name: "Deadlifts",
    description: "Compound exercise targeting posterior chain",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip the bar",
      "Keep your back straight and chest up",
      "Drive through your heels to lift the bar",
      "Stand tall, then lower the bar back down",
    ],
    tips: [
      "Keep the bar close to your body",
      "Engage your lats to protect your back",
      "Don't round your back",
      "Think about pushing the floor away",
    ],
    muscleGroups: ["Hamstrings", "Glutes", "Back", "Core"],
    equipment: ["Barbell"],
    difficulty: "Advanced",
    category: "Strength",
  },

  // CORE EXERCISES
  {
    id: "plank",
    name: "Plank",
    description: "Isometric core strengthening exercise",
    instructions: [
      "Start in push-up position on forearms",
      "Keep your body in straight line from head to heels",
      "Engage your core and glutes",
      "Hold the position for desired time",
      "Breathe normally throughout",
    ],
    tips: [
      "Don't let your hips sag or pike up",
      "Keep your head in neutral position",
      "Start with shorter holds and build up",
      "Focus on quality over duration",
    ],
    muscleGroups: ["Core", "Shoulders"],
    equipment: ["Bodyweight"],
    difficulty: "Beginner",
    category: "Strength",
  },
  {
    id: "russian-twists",
    name: "Russian Twists",
    description: "Rotational core exercise",
    instructions: [
      "Sit with knees bent and feet slightly off the ground",
      "Lean back to create a V-shape with your torso and thighs",
      "Hold your hands together in front of your chest",
      "Rotate your torso from side to side",
      "Keep your feet elevated throughout",
    ],
    tips: [
      "Keep your chest up and back straight",
      "Move with control, not speed",
      "Add weight for increased difficulty",
      "Focus on rotating from your core",
    ],
    muscleGroups: ["Core", "Obliques"],
    equipment: ["Bodyweight", "Medicine Ball"],
    difficulty: "Intermediate",
    category: "Strength",
  },

  // CARDIO EXERCISES
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    description: "Full-body cardio exercise",
    instructions: [
      "Start standing with feet together and arms at sides",
      "Jump while spreading feet shoulder-width apart",
      "Simultaneously raise arms overhead",
      "Jump back to starting position",
      "Repeat at a steady pace",
    ],
    tips: [
      "Land softly on the balls of your feet",
      "Keep your core engaged",
      "Maintain good posture throughout",
      "Modify by stepping instead of jumping if needed",
    ],
    muscleGroups: ["Cardio", "Legs", "Shoulders"],
    equipment: ["Bodyweight"],
    difficulty: "Beginner",
    category: "Cardio",
  },
  {
    id: "burpees",
    name: "Burpees",
    description: "High-intensity full-body exercise",
    instructions: [
      "Start in standing position",
      "Drop into squat and place hands on floor",
      "Jump feet back into plank position",
      "Do a push-up (optional)",
      "Jump feet back to squat, then jump up with arms overhead",
    ],
    tips: [
      "Move at your own pace",
      "Modify by stepping instead of jumping",
      "Keep your core tight in plank position",
      "Focus on form over speed",
    ],
    muscleGroups: ["Cardio", "Full Body"],
    equipment: ["Bodyweight"],
    difficulty: "Advanced",
    category: "Cardio",
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    description: "Dynamic cardio and core exercise",
    instructions: [
      "Start in plank position",
      "Bring one knee toward your chest",
      "Quickly switch legs, bringing other knee forward",
      "Continue alternating legs rapidly",
      "Maintain plank position throughout",
    ],
    tips: ["Keep your hips level", "Don't let your butt pike up", "Land softly on your feet", "Keep your core engaged"],
    muscleGroups: ["Cardio", "Core", "Shoulders"],
    equipment: ["Bodyweight"],
    difficulty: "Intermediate",
    category: "Cardio",
  },

  // ARM EXERCISES
  {
    id: "bicep-curls",
    name: "Bicep Curls",
    description: "Isolation exercise for bicep development",
    instructions: [
      "Stand with dumbbells at your sides",
      "Keep your elbows close to your body",
      "Curl the weights up toward your shoulders",
      "Squeeze your biceps at the top",
      "Lower the weights back down slowly",
    ],
    tips: [
      "Don't swing or use momentum",
      "Keep your wrists straight",
      "Control the negative portion",
      "Don't fully lock out at the bottom",
    ],
    muscleGroups: ["Biceps"],
    equipment: ["Dumbbells"],
    difficulty: "Beginner",
    category: "Strength",
  },
  {
    id: "tricep-dips",
    name: "Tricep Dips",
    description: "Bodyweight exercise for tricep strength",
    instructions: [
      "Sit on edge of bench with hands beside your hips",
      "Slide your butt off the bench, supporting weight with arms",
      "Lower your body by bending your elbows",
      "Push back up to starting position",
      "Keep your legs extended for more difficulty",
    ],
    tips: [
      "Keep your elbows pointing back, not out",
      "Don't go too low to avoid shoulder strain",
      "Keep your body close to the bench",
      "Bend knees to make it easier",
    ],
    muscleGroups: ["Triceps", "Shoulders"],
    equipment: ["Bench", "Bodyweight"],
    difficulty: "Intermediate",
    category: "Strength",
  },
]
