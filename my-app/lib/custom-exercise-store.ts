import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getExercises, addExercise, updateExercise, deleteExercise } from './supabase-exercises'
import { supabase } from './supabase'

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
  fetchCustomExercisesFromSupabase: () => Promise<void>
  subscribeToCustomExerciseChanges: () => void
}

let customExerciseChannel: any = null;

export const useCustomExerciseStore = create<CustomExerciseStore>()(
  persist(
    (set, get) => ({
      customExercises: [],

      // Fetch custom exercises from Supabase on initialization
      async fetchCustomExercisesFromSupabase() {
        const allExercises = await getExercises();
        // Filter for custom exercises
        const customExercises = allExercises.filter((ex: any) => ex.is_custom);
        set({ customExercises });
      },

      addCustomExercise: async (exercise) => {
        const saved = await addExercise(exercise);
        set((state) => ({
          customExercises: [...state.customExercises, saved],
        }));
      },

      updateCustomExercise: async (id, updatedExercise) => {
        const updated = await updateExercise(id, updatedExercise);
        set((state) => ({
          customExercises: state.customExercises.map((exercise) =>
            exercise.id === id ? { ...exercise, ...updated } : exercise,
          ),
        }));
      },

      deleteCustomExercise: async (id) => {
        await deleteExercise(id);
        set((state) => ({
          customExercises: state.customExercises.filter((exercise) => exercise.id !== id),
        }));
      },

      getCustomExercise: (id) => {
        const state = get()
        return state.customExercises.find((exercise) => exercise.id === id)
      },

      subscribeToCustomExerciseChanges: () => {
        if (customExerciseChannel) {
          customExerciseChannel.unsubscribe();
        }
        customExerciseChannel = supabase
          .channel('public:exercises')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'exercises' },
            (payload) => {
              if (!payload.new?.is_custom && !payload.old?.is_custom) return;
              if (payload.eventType === 'INSERT') {
                set((state) => ({
                  customExercises: [payload.new, ...state.customExercises],
                }));
              } else if (payload.eventType === 'UPDATE') {
                set((state) => ({
                  customExercises: state.customExercises.map((e) => (e.id === payload.new.id ? payload.new : e)),
                }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({
                  customExercises: state.customExercises.filter((e) => e.id !== payload.old.id),
                }));
              }
            }
          )
          .subscribe();
      },
    }),
    {
      name: "custom-exercises-storage",
    },
  ),
)
