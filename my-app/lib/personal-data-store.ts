"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface BodyMetrics {
  date: string
  weight?: number
  height?: number
  bodyFat?: number
  muscleMass?: number
  bmi?: number
}

export interface TrainingRecord {
  id: string
  date: string
  exercise: string
  category: "strength" | "endurance" | "flexibility"
  value: number
  unit: string
  notes?: string
}

interface PersonalDataStore {
  // Body Metrics
  bodyMetrics: BodyMetrics[]
  addBodyMetrics: (metrics: Omit<BodyMetrics, "date">) => void
  getLatestMetrics: () => BodyMetrics | null
  getLatestBodyMetrics: () => BodyMetrics | null
  getMetricsHistory: (metric: keyof BodyMetrics) => { date: string; value: number }[]

  // Training Records
  trainingRecords: TrainingRecord[]
  addTrainingRecord: (record: Omit<TrainingRecord, "id" | "date">) => void
  updateTrainingRecord: (record: Omit<TrainingRecord, "id" | "date">) => void
  getPersonalBests: () => TrainingRecord[]
  getRecordsByCategory: (category: string) => TrainingRecord[]

  // Profile Info
  profile: {
    name: string
    age?: number
    fitnessGoals: string[]
    experienceLevel: "Beginner" | "Intermediate" | "Advanced"
  }
  updateProfile: (updates: Partial<PersonalDataStore["profile"]>) => void
  getBMI: () => number | null
  getPersonalRecords: () => TrainingRecord[]
  getWeightChartData: () => { date: string; weight: number }[]
  getBodyFatChartData: () => { date: string; bodyFat: number }[]
  getBMIChartData: () => { date: string; bmi: number }[]
}

export const usePersonalDataStore = create<PersonalDataStore>()(
  persist(
    (set, get) => ({
      bodyMetrics: [],
      trainingRecords: [],
      profile: {
        name: "",
        fitnessGoals: [],
        experienceLevel: "Beginner",
      },

      addBodyMetrics: (metrics) => {
        const newMetrics: BodyMetrics = {
          ...metrics,
          date: new Date().toISOString(),
        }

        // Calculate BMI if height and weight are provided
        if (metrics.height && metrics.weight) {
          const heightInMeters = metrics.height / 100
          newMetrics.bmi = Number((metrics.weight / (heightInMeters * heightInMeters)).toFixed(1))
        }

        set((state) => ({
          bodyMetrics: [newMetrics, ...state.bodyMetrics],
        }))
      },

      getLatestMetrics: () => {
        const metrics = get().bodyMetrics
        return metrics.length > 0 ? metrics[0] : null
      },

      // compatibility alias for components still calling the old name
      getLatestBodyMetrics: () => get().getLatestMetrics(),

      getMetricsHistory: (metric) => {
        const metrics = get().bodyMetrics
        return metrics
          .filter((m) => m[metric] !== undefined)
          .map((m) => ({
            date: m.date,
            value: m[metric] as number,
          }))
          .reverse()
      },

      addTrainingRecord: (record) => {
        const newRecord: TrainingRecord = {
          ...record,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        }

        set((state) => ({
          trainingRecords: [newRecord, ...state.trainingRecords],
        }))
      },

      updateTrainingRecord: (record) => {
        const newRecord: TrainingRecord = {
          ...record,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        }

        set((state) => {
          // Check if this is a new personal best
          const existingRecords = state.trainingRecords.filter(
            (r) => r.exercise === record.exercise && r.category === record.category,
          )

          const isNewBest = existingRecords.length === 0 || existingRecords.every((r) => r.value < record.value)

          if (isNewBest) {
            return {
              trainingRecords: [newRecord, ...state.trainingRecords],
            }
          }

          return state
        })
      },

      getPersonalBests: () => {
        const records = get().trainingRecords
        const bestsByExercise: Record<string, TrainingRecord> = {}

        records.forEach((record) => {
          const key = `${record.exercise}-${record.category}`
          if (!bestsByExercise[key] || bestsByExercise[key].value < record.value) {
            bestsByExercise[key] = record
          }
        })

        return Object.values(bestsByExercise).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getRecordsByCategory: (category) => {
        return get().trainingRecords.filter((r) => r.category === category)
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }))
      },
      getBMI: () => {
        const metrics = get().bodyMetrics
        return metrics.length > 0 && metrics[0].bmi !== undefined ? metrics[0].bmi : null
      },
      getPersonalRecords: () => get().getPersonalBests(),
      getWeightChartData: () => {
        const metrics = get().bodyMetrics
        return metrics
          .filter((m) => m.weight !== undefined)
          .map((m) => ({ date: m.date, weight: m.weight as number }))
          .reverse()
      },
      getBodyFatChartData: () => {
        const metrics = get().bodyMetrics
        return metrics
          .filter((m) => m.bodyFat !== undefined)
          .map((m) => ({ date: m.date, bodyFat: m.bodyFat as number }))
          .reverse()
      },
      getBMIChartData: () => {
        const metrics = get().bodyMetrics
        return metrics
          .filter((m) => m.bmi !== undefined)
          .map((m) => ({ date: m.date, bmi: m.bmi as number }))
          .reverse()
      },
    }),
    {
      name: "personal-data-storage",
    },
  ),
)
