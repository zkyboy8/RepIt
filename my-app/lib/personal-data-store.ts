"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getBodyMetrics, addBodyMetric, updateBodyMetric, deleteBodyMetric } from './supabase-body-metrics'
import { getTrainingRecords, addTrainingRecord, updateTrainingRecord, deleteTrainingRecord } from './supabase-training-records'
import { supabase } from './supabase'

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

  // Supabase operations
  fetchBodyMetricsFromSupabase: (user_id?: string) => Promise<void>
  updateBodyMetrics: (id: string, updates: Partial<BodyMetrics>) => Promise<void>
  deleteBodyMetrics: (id: string) => Promise<void>
  fetchTrainingRecordsFromSupabase: (user_id?: string) => Promise<void>
  deleteTrainingRecord: (id: string) => Promise<void>

  // Real-time sync
  subscribeToBodyMetricsChanges: (user_id?: string) => void
  subscribeToTrainingRecordsChanges: (user_id?: string) => void
}

let bodyMetricsChannel: any = null;
let trainingRecordsChannel: any = null;

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

      // Fetch body metrics from Supabase on initialization
      async fetchBodyMetricsFromSupabase(user_id?: string) {
        const metrics = await getBodyMetrics(user_id)
        set({ bodyMetrics: metrics })
      },

      addBodyMetrics: async (metrics) => {
        const newMetrics = {
          ...metrics,
          date: new Date().toISOString(),
        }
        if (metrics.height && metrics.weight) {
          const heightInMeters = metrics.height / 100
          newMetrics.bmi = Number((metrics.weight / (heightInMeters * heightInMeters)).toFixed(1))
        }
        const saved = await addBodyMetric(newMetrics)
        set((state) => ({
          bodyMetrics: [saved, ...state.bodyMetrics],
        }))
      },

      updateBodyMetrics: async (id, updates) => {
        const updated = await updateBodyMetric(id, updates)
        set((state) => ({
          bodyMetrics: state.bodyMetrics.map((m) => (m.id === id ? { ...m, ...updated } : m)),
        }))
      },

      deleteBodyMetrics: async (id) => {
        await deleteBodyMetric(id)
        set((state) => ({
          bodyMetrics: state.bodyMetrics.filter((m) => m.id !== id),
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

      // Fetch training records from Supabase on initialization
      async fetchTrainingRecordsFromSupabase(user_id?: string) {
        const records = await getTrainingRecords(user_id);
        set({ trainingRecords: records });
      },

      addTrainingRecord: async (record) => {
        const newRecord = {
          ...record,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        };
        const saved = await addTrainingRecord(newRecord);
        set((state) => ({
          trainingRecords: [saved, ...state.trainingRecords],
        }));
      },

      updateTrainingRecord: async (id, updates) => {
        const updated = await updateTrainingRecord(id, updates);
        set((state) => ({
          trainingRecords: state.trainingRecords.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        }));
      },

      deleteTrainingRecord: async (id) => {
        await deleteTrainingRecord(id);
        set((state) => ({
          trainingRecords: state.trainingRecords.filter((r) => r.id !== id),
        }));
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

      subscribeToBodyMetricsChanges: (user_id?: string) => {
        if (bodyMetricsChannel) bodyMetricsChannel.unsubscribe();
        bodyMetricsChannel = supabase
          .channel('public:body_metrics')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'body_metrics', filter: user_id ? `user_id=eq.${user_id}` : undefined },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                set((state) => ({ bodyMetrics: [payload.new, ...state.bodyMetrics] }));
              } else if (payload.eventType === 'UPDATE') {
                set((state) => ({ bodyMetrics: state.bodyMetrics.map((m) => (m.id === payload.new.id ? payload.new : m)) }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({ bodyMetrics: state.bodyMetrics.filter((m) => m.id !== payload.old.id) }));
              }
            }
          )
          .subscribe();
      },
      subscribeToTrainingRecordsChanges: (user_id?: string) => {
        if (trainingRecordsChannel) trainingRecordsChannel.unsubscribe();
        trainingRecordsChannel = supabase
          .channel('public:training_records')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'training_records', filter: user_id ? `user_id=eq.${user_id}` : undefined },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                set((state) => ({ trainingRecords: [payload.new, ...state.trainingRecords] }));
              } else if (payload.eventType === 'UPDATE') {
                set((state) => ({ trainingRecords: state.trainingRecords.map((r) => (r.id === payload.new.id ? payload.new : r)) }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({ trainingRecords: state.trainingRecords.filter((r) => r.id !== payload.old.id) }));
              }
            }
          )
          .subscribe();
      },
    }),
    {
      name: "personal-data-storage",
    },
  ),
)
