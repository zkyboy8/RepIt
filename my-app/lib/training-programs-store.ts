import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

export const useTrainingProgramsStore = create<TrainingProgramsStore>()(
  persist(
    (set, get) => ({
      programs: [],
      currentProgram: null,
      completedSessions: [],

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
    }),
    {
      name: "training-programs-storage",
    },
  ),
)
