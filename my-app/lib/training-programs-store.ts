import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  getTrainingPrograms,
  addTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
  getProgramWeeks,
  addProgramWeek,
  updateProgramWeek,
  deleteProgramWeek,
  getProgramSessions,
  addProgramSession,
  updateProgramSession,
  deleteProgramSession,
  getSessionExercises,
  addSessionExercise,
  updateSessionExercise,
  deleteSessionExercise
} from './supabase-training-programs';
import { supabase } from './supabase';

export interface Week {
  weekNumber: number;
  sessions: TrainingSession[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  sport: string;
  weeks: Week[];
  sessions: TrainingSession[];
  equipment: string[];
  goals: string[];
  tips?: string[];
  nutrition?: string[];
}

export interface TrainingSession {
  id: string
  name: string
  description: string
  exercises: SessionExercise[]
  estimatedDuration: number
  restBetweenSets: number
  notes?: string
}

export interface SessionExercise {
  exerciseId: string
  name: string
  sets: number
  reps: number | string
  weight?: number
  rest: number
  notes?: string
}

interface TrainingProgramsStore {
  programs: TrainingProgram[]
  currentProgram: TrainingProgram | null
  completedSessions: string[]
  setCurrentProgram: (program: TrainingProgram | null) => void
  markSessionComplete: (sessionId: string) => void
  isSessionComplete: (sessionId: string) => boolean
  getSessionProgress: (programId: string) => number
  fetchProgramsFromSupabase: (userId?: string) => Promise<void>
  addProgramToSupabase: (program: any) => Promise<void>
  updateProgramInSupabase: (id: string, updates: any) => Promise<void>
  deleteProgramFromSupabase: (id: string) => Promise<void>
  subscribeToTrainingProgramsChanges: (user_id?: string) => void
}

let trainingProgramsChannel: any = null;

export const useTrainingProgramsStore = create<TrainingProgramsStore>()(
  persist(
    (set, get) => ({
      programs: [],
      currentProgram: null,
      completedSessions: [],

      async fetchProgramsFromSupabase(userId) {
        const programs = await getTrainingPrograms(userId);
        set({ programs });
      },
      async addProgramToSupabase(program) {
        const saved = await addTrainingProgram(program);
        set((state) => ({ programs: [...state.programs, saved] }));
      },
      async updateProgramInSupabase(id, updates) {
        const updated = await updateTrainingProgram(id, updates);
        set((state) => ({
          programs: state.programs.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
      },
      async deleteProgramFromSupabase(id) {
        await deleteTrainingProgram(id);
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id),
        }));
      },
      setCurrentProgram: (program) => set(() => ({ currentProgram: program })),
      markSessionComplete: (sessionId) =>
        set((state) => ({
          completedSessions: [...state.completedSessions, sessionId],
        })),
      isSessionComplete: (sessionId) => {
        const state = get()
        return state.completedSessions.includes(sessionId)
      },
      getSessionProgress: (programId) => {
        const state = get()
        const program = state.programs.find((p) => p.id === programId)
        if (!program) return 0

        const totalSessions = program.sessions.length
        const completedCount = program.sessions.filter((session) => state.completedSessions.includes(session.id)).length

        return totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0
      },
      subscribeToTrainingProgramsChanges: (user_id?: string) => {
        if (trainingProgramsChannel) trainingProgramsChannel.unsubscribe();
        trainingProgramsChannel = supabase
          .channel('public:training_programs')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'training_programs', filter: user_id ? `user_id=eq.${user_id}` : undefined },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                set((state) => ({ programs: [...state.programs, payload.new] }));
              } else if (payload.eventType === 'UPDATE') {
                set((state) => ({ programs: state.programs.map((p) => (p.id === payload.new.id ? payload.new : p)) }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({ programs: state.programs.filter((p) => p.id !== payload.old.id) }));
              }
            }
          )
          .subscribe();
      },
    }),
    {
      name: "training-programs-storage",
    },
  ),
)
