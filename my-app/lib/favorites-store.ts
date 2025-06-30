import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesStore {
  favoriteExercises: string[]
  favoriteWorkouts: string[]
  addFavoriteExercise: (exerciseId: string) => void
  removeFavoriteExercise: (exerciseId: string) => void
  isFavoriteExercise: (exerciseId: string) => boolean
  addFavoriteWorkout: (workoutId: string) => void
  removeFavoriteWorkout: (workoutId: string) => void
  isFavoriteWorkout: (workoutId: string) => boolean
  clearAllFavorites: () => void
  getFavoriteCount: () => number
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteExercises: [],
      favoriteWorkouts: [],

      addFavoriteExercise: (exerciseId) =>
        set((state) => ({
          favoriteExercises: [...state.favoriteExercises, exerciseId],
        })),

      removeFavoriteExercise: (exerciseId) =>
        set((state) => ({
          favoriteExercises: state.favoriteExercises.filter((id) => id !== exerciseId),
        })),

      isFavoriteExercise: (exerciseId) => {
        const state = get()
        return state.favoriteExercises.includes(exerciseId)
      },

      addFavoriteWorkout: (workoutId) =>
        set((state) => ({
          favoriteWorkouts: [...state.favoriteWorkouts, workoutId],
        })),

      removeFavoriteWorkout: (workoutId) =>
        set((state) => ({
          favoriteWorkouts: state.favoriteWorkouts.filter((id) => id !== workoutId),
        })),

      isFavoriteWorkout: (workoutId) => {
        const state = get()
        return state.favoriteWorkouts.includes(workoutId)
      },

      clearAllFavorites: () =>
        set(() => ({
          favoriteExercises: [],
          favoriteWorkouts: [],
        })),

      getFavoriteCount: () => {
        const state = get();
        return state.favoriteExercises.length;
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
)
