"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getWorkouts as supaGetWorkouts, addWorkout as supaAddWorkout, deleteWorkout as supaDeleteWorkout } from './supabase-workouts'
import { supabase } from './supabase'

export interface ExerciseSet {
  id: string
  weight?: number
  reps: number
  rpe?: number // Rate of Perceived Exertion (1-10)
  completed: boolean
  restTime?: number // in seconds
  notes?: string
}

export interface Exercise {
  name: string
  sets: ExerciseSet[]
  targetSets: number
  targetReps: number
  targetWeight?: number
  notes?: string
  previousBest?: {
    weight?: number
    reps: number
    date: string
  }
}

export interface Workout {
  id: string
  name: string
  date: string
  duration: number
  exercises: Exercise[]
  workoutTime?: number // seconds elapsed for the current workout session
  startTime?: number // timestamp when the workout started
}

export interface WorkoutStore {
  workouts: Workout[]
  addWorkout: (workout: Workout) => void
  removeWorkout: (id: string) => void
  getWeeklyStats: () => {
    workouts: number
    totalMinutes: number
    exercises: number
  }
  getTodaysWorkout: () => Workout | null
  getProgressStats: (timeframe: string) => {
    totalWorkouts: number
    totalExercises: number
    totalMinutes: number
    avgDuration: number
    weeklyWorkouts: number
    uniqueExercises: number
  }
  getPersonalBests: () => Record<string, { weight?: number; reps: number; date: string }>
  currentWorkout: Workout | null
  setCurrentWorkout: (workout: Workout) => void
  clearCurrentWorkout: () => void
  fetchWorkoutsFromSupabase: (user_id?: string) => Promise<void>
  subscribeToWorkoutChanges: (user_id?: string) => void
}

let workoutChannel: any = null;

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [],

      // Fetch workouts from Supabase on initialization
      async fetchWorkoutsFromSupabase(user_id?: string) {
        const workouts = await supaGetWorkouts(user_id);
        set({ workouts });
      },

      addWorkout: async (workout) => {
        // Add to Supabase
        const saved = await supaAddWorkout(workout);
        set((state) => ({
          workouts: [saved, ...state.workouts],
        }));
      },

      removeWorkout: async (id) => {
        await supaDeleteWorkout(id);
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        }));
      },

      getWeeklyStats: () => {
        const workouts = get().workouts
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const weeklyWorkouts = workouts.filter((w) => new Date(w.date) >= oneWeekAgo)

        return {
          workouts: weeklyWorkouts.length,
          totalMinutes: weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0),
          exercises: weeklyWorkouts.reduce((sum, w) => sum + w.exercises.length, 0),
        }
      },

      getTodaysWorkout: () => {
        const workouts = get().workouts
        const today = new Date().toDateString()

        return workouts.find((w) => new Date(w.date).toDateString() === today) || null
      },

      getProgressStats: (timeframe) => {
        const workouts = get().workouts
        let filteredWorkouts = workouts

        const now = new Date()

        if (timeframe === "week") {
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          filteredWorkouts = workouts.filter((w) => new Date(w.date) >= oneWeekAgo)
        } else if (timeframe === "month") {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          filteredWorkouts = workouts.filter((w) => new Date(w.date) >= oneMonthAgo)
        } else if (timeframe === "year") {
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          filteredWorkouts = workouts.filter((w) => new Date(w.date) >= oneYearAgo)
        }

        const totalExercises = filteredWorkouts.reduce((sum, w) => sum + w.exercises.length, 0)
        const totalMinutes = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0)

        // Weekly workouts for achievements
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weeklyWorkouts = workouts.filter((w) => new Date(w.date) >= oneWeekAgo).length

        // Unique exercises
        const allExercises = workouts.flatMap((w) => w.exercises.map((e) => e.name))
        const uniqueExercises = new Set(allExercises).size

        return {
          totalWorkouts: filteredWorkouts.length,
          totalExercises,
          totalMinutes,
          avgDuration: filteredWorkouts.length > 0 ? Math.round(totalMinutes / filteredWorkouts.length) : 0,
          weeklyWorkouts,
          uniqueExercises,
        }
      },

      getPersonalBests: () => {
        const workouts = get().workouts
        const personalBests: Record<string, { weight?: number; reps: number; date: string }> = {}

        workouts.forEach((workout) => {
          workout.exercises.forEach((exercise) => {
            exercise.sets.forEach((set) => {
              if (set.completed) {
                const current = personalBests[exercise.name]
                const isNewBest =
                  !current ||
                  (set.weight && (!current.weight || set.weight > current.weight)) ||
                  (!set.weight && set.reps > current.reps)

                if (isNewBest) {
                  personalBests[exercise.name] = {
                    weight: set.weight,
                    reps: set.reps,
                    date: workout.date,
                  }
                }
              }
            })
          })
        })

        return personalBests
      },

      currentWorkout: null,
      setCurrentWorkout: (workout) => set(() => ({ currentWorkout: workout })),
      clearCurrentWorkout: () => set(() => ({ currentWorkout: null })),

      subscribeToWorkoutChanges: (user_id?: string) => {
        if (workoutChannel) {
          workoutChannel.unsubscribe();
        }
        workoutChannel = supabase
          .channel('public:workouts')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'workouts', filter: user_id ? `user_id=eq.${user_id}` : undefined },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                set((state) => ({
                  workouts: [payload.new, ...state.workouts],
                }));
              } else if (payload.eventType === 'UPDATE') {
                set((state) => ({
                  workouts: state.workouts.map((w) => (w.id === payload.new.id ? payload.new : w)),
                }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({
                  workouts: state.workouts.filter((w) => w.id !== payload.old.id),
                }));
              }
            }
          )
          .subscribe();
      },
    }),
    {
      name: "workout-storage",
      partialize: (state) => ({
        workouts: state.workouts,
        currentWorkout: state.currentWorkout,
      }),
    },
  ),
)
