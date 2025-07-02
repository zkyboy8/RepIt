"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Save,
  Play,
  Pause,
  Clock,
  Dumbbell,
  History,
  BookOpen,
  Target,
  Copy,
  Check,
  Timer,
  Trophy,
  MoreVertical,
} from "lucide-react"
import { useWorkoutStore, type Exercise, type ExerciseSet } from "@/lib/workout-store"
import { usePersonalDataStore } from "@/lib/personal-data-store"
import { useTrainingProgramsStore } from "@/lib/training-programs-store"
import { toast } from "@/hooks/use-toast"
import ExerciseSelector from "@/components/exercise-selector"

interface WorkoutTemplate {
  id: string
  name: string
  description: string
  exercises: Exercise[]
  category: string
  estimatedDuration: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  muscleGroups: string[]
}

export default function WorkoutLogger({ onSessionStart, onSessionEnd, forceSelectMode, onBrowseTrainingPrograms }: { onSessionStart?: () => void, onSessionEnd?: () => void, forceSelectMode?: boolean, onBrowseTrainingPrograms?: () => void }) {
  const { workouts, addWorkout, getPersonalBests, setCurrentWorkout, clearCurrentWorkout, currentWorkout } = useWorkoutStore()
  const { updateTrainingRecord } = usePersonalDataStore()
  const currentProgram = useTrainingProgramsStore((state) => state.currentProgram);

  const [workoutMode, setWorkoutMode] = useState<"select" | "new" | "template">("select")
  const [workoutName, setWorkoutName] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutTime, setWorkoutTime] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)
  const [showTemplateDetail, setShowTemplateDetail] = useState(false)
  const [restTimers, setRestTimers] = useState<{ [key: string]: number }>({})
  const [restIntervals, setRestIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false)
  const [completedWorkout, setCompletedWorkout] = useState<any>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [now, setNow] = useState(Date.now());
  const elapsed = currentWorkout?.startTime ? Math.floor((now - currentWorkout.startTime) / 1000) : 0;

  // Built-in workout templates
  const workoutTemplates: WorkoutTemplate[] = [
    {
      id: "push-day",
      name: "Push Day",
      description: "Chest, shoulders, and triceps focused workout",
      category: "Strength",
      estimatedDuration: 60,
      difficulty: "Intermediate",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: [
        {
          name: "Bench Press",
          targetSets: 4,
          targetReps: 8,
          targetWeight: 135,
          sets: [],
          previousBest: { weight: 130, reps: 8, date: "2024-01-15" },
        },
        {
          name: "Overhead Press",
          targetSets: 3,
          targetReps: 10,
          targetWeight: 95,
          sets: [],
          previousBest: { weight: 90, reps: 10, date: "2024-01-15" },
        },
        {
          name: "Incline Dumbbell Press",
          targetSets: 3,
          targetReps: 12,
          targetWeight: 60,
          sets: [],
          previousBest: { weight: 55, reps: 12, date: "2024-01-15" },
        },
        {
          name: "Lateral Raises",
          targetSets: 3,
          targetReps: 15,
          targetWeight: 20,
          sets: [],
          previousBest: { weight: 17.5, reps: 15, date: "2024-01-15" },
        },
        {
          name: "Tricep Dips",
          targetSets: 3,
          targetReps: 12,
          sets: [],
          previousBest: { reps: 10, date: "2024-01-15" },
        },
        {
          name: "Push-ups",
          targetSets: 2,
          targetReps: 15,
          sets: [],
          previousBest: { reps: 12, date: "2024-01-15" },
        },
      ],
    },
    {
      id: "pull-day",
      name: "Pull Day",
      description: "Back and biceps focused workout",
      category: "Strength",
      estimatedDuration: 55,
      difficulty: "Intermediate",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        {
          name: "Pull-ups",
          targetSets: 4,
          targetReps: 8,
          sets: [],
          previousBest: { reps: 6, date: "2024-01-15" },
        },
        {
          name: "Barbell Rows",
          targetSets: 4,
          targetReps: 10,
          targetWeight: 115,
          sets: [],
          previousBest: { weight: 110, reps: 10, date: "2024-01-15" },
        },
        {
          name: "Lat Pulldown",
          targetSets: 3,
          targetReps: 12,
          targetWeight: 100,
          sets: [],
          previousBest: { weight: 95, reps: 12, date: "2024-01-15" },
        },
        {
          name: "Face Pulls",
          targetSets: 3,
          targetReps: 15,
          targetWeight: 40,
          sets: [],
          previousBest: { weight: 35, reps: 15, date: "2024-01-15" },
        },
        {
          name: "Bicep Curls",
          targetSets: 3,
          targetReps: 12,
          targetWeight: 30,
          sets: [],
          previousBest: { weight: 27.5, reps: 12, date: "2024-01-15" },
        },
        {
          name: "Hammer Curls",
          targetSets: 3,
          targetReps: 12,
          targetWeight: 25,
          sets: [],
          previousBest: { weight: 22.5, reps: 12, date: "2024-01-15" },
        },
      ],
    },
    {
      id: "leg-day",
      name: "Leg Day",
      description: "Complete lower body workout",
      category: "Strength",
      estimatedDuration: 70,
      difficulty: "Advanced",
      muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        {
          name: "Squats",
          targetSets: 4,
          targetReps: 8,
          targetWeight: 185,
          sets: [],
          previousBest: { weight: 180, reps: 8, date: "2024-01-15" },
        },
        {
          name: "Romanian Deadlifts",
          targetSets: 4,
          targetReps: 10,
          targetWeight: 155,
          sets: [],
          previousBest: { weight: 150, reps: 10, date: "2024-01-15" },
        },
        {
          name: "Lunges",
          targetSets: 3,
          targetReps: 12,
          sets: [],
          previousBest: { reps: 10, date: "2024-01-15" },
        },
        {
          name: "Leg Press",
          targetSets: 3,
          targetReps: 15,
          targetWeight: 270,
          sets: [],
          previousBest: { weight: 260, reps: 15, date: "2024-01-15" },
        },
        {
          name: "Leg Curls",
          targetSets: 3,
          targetReps: 12,
          targetWeight: 80,
          sets: [],
          previousBest: { weight: 75, reps: 12, date: "2024-01-15" },
        },
        {
          name: "Calf Raises",
          targetSets: 4,
          targetReps: 20,
          targetWeight: 45,
          sets: [],
          previousBest: { weight: 40, reps: 20, date: "2024-01-15" },
        },
      ],
    },
    {
      id: "hiit-cardio",
      name: "HIIT Cardio",
      description: "High-intensity interval training for fat burning",
      category: "Cardio",
      estimatedDuration: 30,
      difficulty: "Intermediate",
      muscleGroups: ["Full Body"],
      exercises: [
        {
          name: "Burpees",
          targetSets: 4,
          targetReps: 10,
          sets: [],
          previousBest: { reps: 8, date: "2024-01-15" },
        },
        {
          name: "Mountain Climbers",
          targetSets: 4,
          targetReps: 20,
          sets: [],
          previousBest: { reps: 18, date: "2024-01-15" },
        },
        {
          name: "Jump Squats",
          targetSets: 4,
          targetReps: 15,
          sets: [],
          previousBest: { reps: 12, date: "2024-01-15" },
        },
        {
          name: "High Knees",
          targetSets: 4,
          targetReps: 30,
          sets: [],
          previousBest: { reps: 25, date: "2024-01-15" },
        },
        {
          name: "Plank",
          targetSets: 3,
          targetReps: 1,
          sets: [],
          previousBest: { reps: 1, date: "2024-01-15" },
        },
      ],
    },
    {
      id: "full-body-beginner",
      name: "Full Body Beginner",
      description: "Perfect starter workout for beginners",
      category: "Strength",
      estimatedDuration: 45,
      difficulty: "Beginner" as const,
      muscleGroups: ["Full Body"],
      exercises: [
        {
          name: "Bodyweight Squats",
          targetSets: 3,
          targetReps: 12,
          sets: [],
          previousBest: { reps: 10, date: "2024-01-15" },
        },
        {
          name: "Push-ups",
          targetSets: 3,
          targetReps: 8,
          sets: [],
          previousBest: { reps: 6, date: "2024-01-15" },
        },
        {
          name: "Assisted Pull-ups",
          targetSets: 3,
          targetReps: 5,
          sets: [],
          previousBest: { reps: 3, date: "2024-01-15" },
        },
        {
          name: "Plank",
          targetSets: 3,
          targetReps: 1,
          sets: [],
          previousBest: { reps: 1, date: "2024-01-15" },
        },
        {
          name: "Lunges",
          targetSets: 2,
          targetReps: 10,
          sets: [],
          previousBest: { reps: 8, date: "2024-01-15" },
        },
        {
          name: "Glute Bridges",
          targetSets: 3,
          targetReps: 15,
          sets: [],
          previousBest: { reps: 12, date: "2024-01-15" },
        },
      ],
    },
  ]

  // Get previous workouts as templates
  const previousWorkouts = workouts.slice(0, 5).map((workout) => ({
    id: `previous-${workout.id}`,
    name: `${workout.name} (Previous)`,
    description: `Completed on ${new Date(workout.date).toLocaleDateString()}`,
    category: "Previous",
    estimatedDuration: workout.duration,
    difficulty: "Intermediate" as const,
    muscleGroups: [...new Set(workout.exercises.map((e) => e.name.split(" ")[0]))],
    exercises: workout.exercises,
  }))

  // Get recommended workouts from active training program
  const recommendedWorkouts = (currentProgram?.weeks?.length ?? 0) > 0
    ? currentProgram?.weeks?.[0]?.sessions.map((session: any) => ({
        id: `program-${session.name}`,
        name: `${session.name} (${currentProgram?.name ?? ''})`,
        description: session.notes || `Session from your training program`,
        category: "Program",
        estimatedDuration: session.estimatedDuration,
        difficulty: currentProgram?.difficulty ?? 'Beginner',
        muscleGroups: session.exercises.map((e: any) => e.name.split(" ")[0]),
        exercises: session.exercises.map((e: any) => ({
          name: e.name,
          targetSets: e.sets,
          targetReps: typeof e.reps === "string" ? 10 : e.reps,
          targetWeight: typeof e.weight === "string" ? undefined : e.weight,
          sets: [],
          notes: e.notes ?? '',
        })),
      })) ?? []
    : [];

  const allTemplates = [...recommendedWorkouts, ...workoutTemplates, ...previousWorkouts]

  const startTimer = () => {
    setIsTimerRunning(true)
    const interval = setInterval(() => {
      setWorkoutTime((prev) => prev + 1)
    }, 1000)
    timerIntervalRef.current = interval
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRestTimer = (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`
    setRestTimers((prev) => ({ ...prev, [key]: 90 })) // Default 90 seconds rest

    const interval = setInterval(() => {
      setRestTimers((prev) => {
        const newTime = (prev[key] || 0) - 1
        if (newTime <= 0) {
          clearInterval(restIntervals[key])
          setRestIntervals((prev) => {
            const newIntervals = { ...prev }
            delete newIntervals[key]
            return newIntervals
          })
          toast('Rest Complete! Time for your next set')
          return { ...prev, [key]: 0 }
        }
        return { ...prev, [key]: newTime }
      })
    }, 1000)

    setRestIntervals((prev) => ({ ...prev, [key]: interval }))
  }

  const addSet = (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    // Defensive: ensure sets is always an array
    if (!Array.isArray(exercise.sets)) {
      exercise.sets = [];
    }
    const newSet: ExerciseSet = {
      id: `${Date.now()}-${Math.random()}`,
      weight: exercise.targetWeight,
      reps: exercise.targetReps,
      completed: false,
    };
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    };
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      ...updates,
    }
    setExercises(updatedExercises)
  }

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, { completed: true })
    startRestTimer(exerciseIndex, setIndex)
    toast('Rest timer started')
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(updatedExercises)
  }

  const saveWorkout = async () => {
    try {
      const workout = {
        id: crypto.randomUUID(),
        name: workoutName.trim(),
        date: new Date().toISOString(),
        duration: Math.floor(workoutTime / 60),
        exercises: exercises,
        workoutTime: workoutTime,
      };

      console.log("Workout object created:", workout);

      // Save workout to store and Supabase
      await addWorkout(workout); // Await the async call
      console.log("Workout added to store and Supabase");

      // Calculate workout summary
      const totalSets = (exercises ?? []).reduce((sum, ex) => sum + ((ex.sets ?? []).filter((s) => s.completed).length), 0);
      const totalVolume = (exercises ?? []).reduce((sum, ex) => sum + ((ex.sets ?? []).filter((s) => s.completed).reduce((setSum, set) => setSum + ((set.weight || 0) * set.reps), 0)), 0);

      console.log("Summary calculated - Sets:", totalSets, "Volume:", totalVolume);

      // Check for new personal bests and update training records
      const personalBests = getPersonalBests();
      const newPersonalBests: string[] = [];

      exercises?.forEach((exercise) => {
        (exercise.sets ?? []).forEach((set) => {
          if (set.completed) {
            const currentBest = personalBests[exercise.name];
            const isNewBest =
              !currentBest ||
              ((set.weight && (!currentBest.weight || set.weight > currentBest.weight)) || false) ||
              ((!set.weight && set.reps > currentBest.reps) || false);

            if (isNewBest) {
              newPersonalBests.push(exercise.name);
              // Update training records for strength exercises
              if (set.weight) {
                updateTrainingRecord({
                  exercise: exercise.name,
                  category: "strength",
                  value: set.weight,
                  unit: "kg",
                  notes: `${set.reps} reps - New PR from workout!`,
                });
              }
            }
          }
        });
      });

      console.log("New personal bests:", newPersonalBests);

      // Set completed workout for summary
      setCompletedWorkout({
        ...workout,
        totalSets,
        totalVolume,
        newPersonalBests,
      });

      // Show workout summary
      setShowWorkoutSummary(true);
      console.log("Showing workout summary");

      toast("Workout Saved!");
    } catch (error) {
      const err = error as any;
      console.error("Error saving workout:", err, JSON.stringify(err), err?.message, err?.stack);
      toast("Failed to save workout. Please try again.");
    }
  };

  const finishWorkout = () => {
    // Reset form
    setWorkoutName("")
    setExercises([])
    setWorkoutTime(0)
    setWorkoutMode("select")
    setShowWorkoutSummary(false)
    setCompletedWorkout(null)
    clearCurrentWorkout()
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setIsTimerRunning(false)
    if (onSessionEnd) onSessionEnd()
  }

  const startNewWorkout = () => {
    setWorkoutMode("new")
    setWorkoutName("")
    setExercises([])
    setWorkoutTime(0)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setIsTimerRunning(false)
    // Set current workout in store and trigger navigation
    const newWorkout = {
      id: `current-${Date.now()}`,
      name: "",
      date: new Date().toISOString(),
      duration: 0,
      exercises: [],
      workoutTime: 0,
      startTime: Date.now(),
    }
    setCurrentWorkout(newWorkout)
    if (onSessionStart) onSessionStart()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Program":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Previous":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Strength":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Cardio":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleUseTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateDetail(true)
  }

  // Helper to populate sets for each exercise from template
  const populateSets = (exercise: Exercise) => {
    const sets = [];
    for (let i = 0; i < (exercise.targetSets || 0); i++) {
      sets.push({
        id: `${Date.now()}-${Math.random()}`,
        weight: exercise.targetWeight,
        reps: exercise.targetReps,
        completed: false,
      });
    }
    return { ...exercise, sets };
  };

  const useTemplate = (template: WorkoutTemplate) => {
    setWorkoutMode("new");
    setWorkoutName(template.name.replace(" (Previous)", "").replace(` (${currentProgram?.name})`, ""));
    setExercises(template.exercises.map(populateSets));
    setWorkoutTime(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    toast("Template Loaded");
  };

  const handleUseTemplateClick = (template: WorkoutTemplate) => {
    setWorkoutMode("new");
    const cleanName = template.name.replace(" (Previous)", "").replace(` (${currentProgram?.name})`, "");
    const populatedExercises = template.exercises.map(populateSets);
    setWorkoutName(cleanName);
    setExercises(populatedExercises);
    setWorkoutTime(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setShowTemplateDetail(false);
    // Create a new workout object with a fresh startTime
    const newWorkout = {
      id: `current-${Date.now()}`,
      name: cleanName,
      date: new Date().toISOString(),
      duration: 0,
      exercises: populatedExercises,
      workoutTime: 0,
      startTime: Date.now(),
    };
    setCurrentWorkout(newWorkout);
    toast("Template Loaded");
  };

  const handleCancelWorkout = () => {
    setShowCancelDialog(true)
  }

  const confirmCancelWorkout = () => {
    clearCurrentWorkout()
    setShowCancelDialog(false)
    if (onSessionEnd) onSessionEnd()
  }

  if (typeof window !== "undefined") {
    const pendingWorkout = localStorage.getItem("pendingWorkout")
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("pendingWorkout")
  }

  useEffect(() => {
    // Check for pending workout from training program
    if (typeof window !== "undefined") {
      const pendingWorkout = localStorage.getItem("pendingWorkout")
      if (pendingWorkout) {
        try {
          const workout = JSON.parse(pendingWorkout)
          setWorkoutMode("new")
          setWorkoutName(workout.name)
          setExercises(workout.exercises)
          setWorkoutTime(workout.workoutTime || 0)
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
            timerIntervalRef.current = null
          }
          setIsTimerRunning(false)

          // Clear the pending workout
          localStorage.removeItem("pendingWorkout")

          toast("Training Session Loaded!")
        } catch (error) {
          console.error("Error loading pending workout:", error)
          localStorage.removeItem("pendingWorkout")
        }
      }
    }
  }, [])

  // Restore session from persisted currentWorkout
  useEffect(() => {
    if (currentWorkout) {
      setWorkoutMode("new");
      setWorkoutName(currentWorkout.name || "");
      setExercises(currentWorkout.exercises || []);
      setWorkoutTime(currentWorkout.workoutTime || 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkout]);

  // Persist user input to currentWorkout in the store, but only if changed
  const lastSyncedRef = useRef<{ name: string; exercises: Exercise[]; workoutTime: number } | null>(null);
  useEffect(() => {
    // Always run, but only update if in 'new' mode and values changed
    if (workoutMode === "new") {
      const last = lastSyncedRef.current;
      const hasChanged =
        !last || last.name !== workoutName || JSON.stringify(last.exercises) !== JSON.stringify(exercises) || last.workoutTime !== workoutTime;
      if (hasChanged) {
        setCurrentWorkout({
          ...(currentWorkout || { id: `current-${Date.now()}`, date: new Date().toISOString(), duration: 0 }),
          name: workoutName,
          exercises: exercises,
          workoutTime: workoutTime,
        });
        lastSyncedRef.current = { name: workoutName, exercises, workoutTime };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutName, exercises, workoutTime, workoutMode, currentWorkout]);

  // Automatically start timer when workoutMode is 'new'
  useEffect(() => {
    if (workoutMode === "new") {
      setIsTimerRunning(true);
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setWorkoutTime((prev) => prev + 1);
        }, 1000);
      }
    } else {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutMode]);

  useEffect(() => {
    if (forceSelectMode) {
      setWorkoutMode('select');
    }
  }, [forceSelectMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (workoutMode === 'new' && currentWorkout?.startTime) {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutMode, currentWorkout?.startTime]);

  if (forceSelectMode) {
    // Always render the select mode UI
    // ... render the two options as in workoutMode === 'select' ...
    if (workoutMode !== 'select') setWorkoutMode('select');
  }

  if (workoutMode === "select") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Your Workout</CardTitle>
            <CardDescription>Choose how you'd like to begin your training session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={startNewWorkout}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Start New Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a custom workout from scratch. Add exercises as you go.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setWorkoutMode("template")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Use Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from saved workouts, previous sessions, or training program recommendations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Options */}
        {(recommendedWorkouts.length > 0 || previousWorkouts.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Jump right into a recommended or recent workout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {recommendedWorkouts.slice(0, 3).map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimatedDuration}min
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <Button size="sm" onClick={() => handleUseTemplate(template)} className="w-full">
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {previousWorkouts.slice(0, 2).map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge variant="outline">{((template.estimatedDuration) || 0)}min</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          Previous
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseTemplate(template)}
                        className="w-full"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Repeat Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (workoutMode === "template") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose a Workout Template</h2>
            <p className="text-muted-foreground">Select from recommended, previous, or built-in workout templates</p>
          </div>
        </div>

        <Tabs defaultValue="recommended" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommended">Recommended ({((recommendedWorkouts ?? []).length)})</TabsTrigger>
            <TabsTrigger value="previous">Previous ({((previousWorkouts ?? []).length)})</TabsTrigger>
            <TabsTrigger value="strength">
              Strength ({((workoutTemplates ?? []).filter((t) => t.category === "Strength").length)})
            </TabsTrigger>
            <TabsTrigger value="cardio">
              Cardio ({((workoutTemplates ?? []).filter((t) => t.category === "Cardio").length)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="space-y-4">
            {((recommendedWorkouts ?? []).length > 0) ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedWorkouts.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {((template.estimatedDuration) || 0)}min
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateDetail(true)
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplateClick(template)} className="flex-1">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Training Program Active</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a training program to get personalized workout recommendations.
                  </p>
                  <Button variant="outline" onClick={onBrowseTrainingPrograms}>Browse Training Programs</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="previous" className="space-y-4">
            {((previousWorkouts ?? []).length > 0) ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {previousWorkouts.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge variant="outline">{((template.estimatedDuration) || 0)}min</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          Previous
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateDetail(true)
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplateClick(template)} className="flex-1">
                          <Copy className="h-3 w-3 mr-1" />
                          Repeat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Previous Workouts</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete some workouts to see them here for easy repetition.
                  </p>
                  <Button onClick={startNewWorkout}>Start Your First Workout</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {((workoutTemplates ?? []).filter((t) => t.category === "Strength").length > 0) && workoutTemplates
                .filter((t) => t.category === "Strength")
                .map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {((template.estimatedDuration) || 0)}min
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {((template.muscleGroups?.slice(0, 3)) || []).map((muscle, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateDetail(true)
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplateClick(template)} className="flex-1">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="cardio" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {((workoutTemplates ?? []).filter((t) => t.category === "Cardio").length > 0) && workoutTemplates
                .filter((t) => t.category === "Cardio")
                .map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {((template.estimatedDuration) || 0)}min
                        </span>
                        <span>{((template.exercises ?? []).length) || 0} exercises</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateDetail(true)
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplateClick(template)} className="flex-1">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Template Detail Modal */}
        <Dialog open={showTemplateDetail} onOpenChange={setShowTemplateDetail}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>{selectedTemplate?.description}</DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{((selectedTemplate.estimatedDuration) || 0)}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{((selectedTemplate.exercises?.length) || 0)}</div>
                    <div className="text-sm text-muted-foreground">Exercises</div>
                  </div>
                  <div className="text-center">
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {selectedTemplate.difficulty}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Target Muscle Groups</h4>
                  <div className="flex flex-wrap gap-1">
                    {((selectedTemplate.muscleGroups) || []).map((muscle, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Exercise List</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {((selectedTemplate.exercises) || []).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{exercise.name}</span>
                            {exercise.notes && <p className="text-sm text-muted-foreground">{exercise.notes}</p>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {((exercise.targetSets) || 0)} × {((exercise.targetReps) || 0)}
                            {((exercise.targetWeight) && ` @ ${exercise.targetWeight}kg`) || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUseTemplateClick(selectedTemplate)} className="flex-1">
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplateDetail(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Active workout session
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workout Session</CardTitle>
              <CardDescription>Log your exercises and track your progress</CardDescription>
              <div className="text-xs text-muted-foreground mt-1">
                Started: {currentWorkout?.date ? new Date(currentWorkout.date).toLocaleString() : new Date().toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-mono font-bold">{formatTime(elapsed)}</div>
              <div className="relative">
                <Button variant="outline" onClick={() => setShowOptions(!showOptions)}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
                {showOptions && (
                  <div className="absolute right-0 mt-2 z-10 bg-white border rounded shadow-md">
                    <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={handleCancelWorkout}>
                      Cancel Workout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g., Upper Body Strength"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {((exercises?.length) > 0) && (
        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription>
                      Target: {((exercise.targetSets) || 0)} sets × {((exercise.targetReps) || 0)} reps
                      {((exercise.targetWeight) && ` @ ${exercise.targetWeight}kg`) || ""}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {exercise.previousBest && (
                      <Badge variant="outline" className="text-xs">
                        Previous: {((exercise.previousBest.weight) && `${exercise.previousBest.weight}kg × `) || ""}
                        {((exercise.previousBest.reps) || 0)} reps
                      </Badge>
                    )}
                    <Button
                      onClick={() => {
                        const newExercises = [...exercises]
                        newExercises.splice(exerciseIndex, 1)
                        setExercises(newExercises)
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {((exercise.sets?.length) === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No sets added yet. Click "Add Set" to start tracking.</p>
                    </div>
                  ) : (
                    ((exercise.sets) || []).map((set, setIndex) => {
                      const restKey = `${exerciseIndex}-${setIndex}`
                      const restTime = ((restTimers[restKey]) || 0)

                      return (
                        <div key={set.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-8">#{((setIndex + 1) || 0)}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <div className="grid grid-cols-4 gap-2 flex-1">
                              <div>
                                <Label className="text-xs">Weight (kg)</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={((set.weight) || "")}
                                  onChange={(e) =>
                                    updateSet(exerciseIndex, setIndex, {
                                      weight: Number.parseFloat(e.target.value) || undefined,
                                    })
                                  }
                                  className="h-8"
                                  disabled={((set.completed) || false)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Reps</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={((set.reps) || "")}
                                  onChange={(e) =>
                                    updateSet(exerciseIndex, setIndex, {
                                      reps: Number.parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-8"
                                  disabled={((set.completed) || false)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">RPE (1-10)</Label>
                                <Select
                                  value={((set.rpe?.toString()) || "")}
                                  onValueChange={(value) =>
                                    updateSet(exerciseIndex, setIndex, {
                                      rpe: Number.parseInt(value) || undefined,
                                    })
                                  }
                                  disabled={((set.completed) || false)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="RPE" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                                      <SelectItem key={rpe} value={rpe.toString()}>
                                        {rpe}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end gap-2">
                                {!((set.completed) || false) ? (
                                  <Button
                                    onClick={() => completeSet(exerciseIndex, setIndex)}
                                    size="sm"
                                    className="h-8 flex-1"
                                    disabled={!((set.reps) || 0)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Badge variant="secondary" className="text-xs">
                                      <Check className="h-3 w-3 mr-1" />
                                      Done
                                    </Badge>
                                    {restTime > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        <Timer className="h-3 w-3 mr-1" />
                                        {formatTime(restTime)}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button onClick={() => removeSet(exerciseIndex, setIndex)} size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex justify-center mt-4">
                  <Button onClick={() => addSet(exerciseIndex)} size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <Button onClick={() => setShowExerciseLibrary(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {((exercises?.length) > 0) && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={saveWorkout} className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workout Summary Modal */}
      <Dialog open={showWorkoutSummary} onOpenChange={setShowWorkoutSummary}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Workout Complete!
            </DialogTitle>
            <DialogDescription>Great job! Here's your workout summary</DialogDescription>
          </DialogHeader>

          {completedWorkout && (
            <ScrollArea className="max-h-[70vh] px-6 pb-6">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{((completedWorkout.duration) || 0)}</div>
                        <div className="text-sm text-muted-foreground">Minutes</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{((completedWorkout.totalSets) || 0)}</div>
                        <div className="text-sm text-muted-foreground">Sets Completed</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{Math.round(((completedWorkout.totalVolume) || 0))}</div>
                        <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {((completedWorkout.newPersonalBests?.length) > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        New Personal Bests!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {((completedWorkout.newPersonalBests) || []).map((exercise: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded"
                          >
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{exercise}</span>
                            <Badge variant="secondary">New PR!</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Exercises Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {((completedWorkout.exercises) || []).map((exercise: Exercise, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {((exercise.sets?.filter((s) => s.completed))?.length || 0)} sets completed
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2 pt-2">
                  <Button onClick={finishWorkout} className="flex-1">
                    Finish & Return Home
                  </Button>
                  <Button variant="outline" onClick={() => setShowWorkoutSummary(false)}>
                    Close Summary
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel this workout?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>No</Button>
            <Button variant="destructive" onClick={confirmCancelWorkout}>Yes, Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showExerciseLibrary && (
        <ExerciseSelector
          isOpen={showExerciseLibrary}
          onClose={() => setShowExerciseLibrary(false)}
          onSelectExercise={exercise => {
            setExercises([...exercises, exercise]);
            setShowExerciseLibrary(false);
          }}
        />
      )}
    </div>
  )
}
