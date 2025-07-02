import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getFavorites, addFavorite, removeFavorite } from './supabase-favorites';
import { supabase } from './supabase';

interface FavoritesStore {
  favoriteExercises: string[]
  favoriteWorkouts: string[]
  addFavoriteExercise: (exerciseId: string, userId: string) => Promise<void>
  removeFavoriteExercise: (exerciseId: string, userId: string) => Promise<void>
  isFavoriteExercise: (exerciseId: string) => boolean
  addFavoriteWorkout: (workoutId: string, userId: string) => Promise<void>
  removeFavoriteWorkout: (workoutId: string, userId: string) => Promise<void>
  isFavoriteWorkout: (workoutId: string) => boolean
  clearAllFavorites: () => void
  getFavoriteCount: () => number
  fetchFavoritesFromSupabase: (userId: string) => Promise<void>
  subscribeToFavoritesChanges: (user_id: string) => void
}

let favoritesChannel: any = null;

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteExercises: [],
      favoriteWorkouts: [],

      async fetchFavoritesFromSupabase(userId) {
        const favs = await getFavorites(userId);
        set({
          favoriteExercises: favs.filter(f => f.exercise_id).map(f => f.exercise_id),
          favoriteWorkouts: favs.filter(f => f.workout_id).map(f => f.workout_id),
        });
      },

      addFavoriteExercise: async (exerciseId, userId) => {
        await addFavorite({ user_id: userId, exercise_id: exerciseId });
        set((state) => ({
          favoriteExercises: [...state.favoriteExercises, exerciseId],
        }));
      },

      removeFavoriteExercise: async (exerciseId, userId) => {
        // Find the favorite id in Supabase (requires fetch)
        const favs = await getFavorites(userId);
        const fav = favs.find(f => f.exercise_id === exerciseId);
        if (fav) await removeFavorite(fav.id);
        set((state) => ({
          favoriteExercises: state.favoriteExercises.filter((id) => id !== exerciseId),
        }));
      },

      isFavoriteExercise: (exerciseId) => {
        const state = get()
        return state.favoriteExercises.includes(exerciseId)
      },

      addFavoriteWorkout: async (workoutId, userId) => {
        await addFavorite({ user_id: userId, workout_id: workoutId });
        set((state) => ({
          favoriteWorkouts: [...state.favoriteWorkouts, workoutId],
        }));
      },

      removeFavoriteWorkout: async (workoutId, userId) => {
        // Find the favorite id in Supabase (requires fetch)
        const favs = await getFavorites(userId);
        const fav = favs.find(f => f.workout_id === workoutId);
        if (fav) await removeFavorite(fav.id);
        set((state) => ({
          favoriteWorkouts: state.favoriteWorkouts.filter((id) => id !== workoutId),
        }));
      },

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

      subscribeToFavoritesChanges: (user_id: string) => {
        if (favoritesChannel) favoritesChannel.unsubscribe();
        favoritesChannel = supabase
          .channel('public:favorites')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user_id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                if (payload.new.exercise_id) {
                  set((state) => ({ favoriteExercises: [...state.favoriteExercises, payload.new.exercise_id] }));
                }
                if (payload.new.workout_id) {
                  set((state) => ({ favoriteWorkouts: [...state.favoriteWorkouts, payload.new.workout_id] }));
                }
              } else if (payload.eventType === 'DELETE') {
                if (payload.old.exercise_id) {
                  set((state) => ({ favoriteExercises: state.favoriteExercises.filter((id) => id !== payload.old.exercise_id) }));
                }
                if (payload.old.workout_id) {
                  set((state) => ({ favoriteWorkouts: state.favoriteWorkouts.filter((id) => id !== payload.old.workout_id) }));
                }
              }
            }
          )
          .subscribe();
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
)
