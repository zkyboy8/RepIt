import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CustomExercise {
  id: string
  name: string
  description: string
  instructions: string[]
  tips: string[]
  muscleGroups: string[]
  equipment: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: "Strength" | "Cardio" | "Flexibility" | "Sports"
  isCustom: true
  createdAt: string
}

interface CustomExerciseStore {
  customExercises: CustomExercise[]
  addCustomExercise: (exercise: CustomExercise) => void
  updateCustomExercise: (id: string, exercise: Partial<CustomExercise>) => void
  deleteCustomExercise: (id: string) => void
  getCustomExercise: (id: string) => CustomExercise | undefined
}

export const useCustomExerciseStore = create<CustomExerciseStore>()(
  persist(
    (set, get) => ({
      customExercises: [],

      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [...state.customExercises, exercise],
        })),

      updateCustomExercise: (id, updatedExercise) =>
        set((state) => ({
          customExercises: state.customExercises.map((exercise) =>
            exercise.id === id ? { ...exercise, ...updatedExercise } : exercise,
          ),
        })),

      deleteCustomExercise: (id) =>
        set((state) => ({
          customExercises: state.customExercises.filter((exercise) => exercise.id !== id),
        })),

      getCustomExercise: (id) => {
        const state = get()
        return state.customExercises.find((exercise) => exercise.id === id)
      },
    }),
    {
      name: "custom-exercises-storage",
    },
  ),
)
