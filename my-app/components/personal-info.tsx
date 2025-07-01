"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trophy, Activity } from "lucide-react"
import { usePersonalDataStore } from "@/lib/personal-data-store"
import { useWorkoutStore } from "@/lib/workout-store"
import { toast } from "@/hooks/use-toast"
import BodyMetricsChart from "@/components/body-metrics-chart"

const strengthExercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-ups",
  "Dips",
  "Incline Bench Press",
  "Romanian Deadlift",
  "Front Squat",
]

const cardioExercises = [
  "5K Run",
  "10K Run",
  "Half Marathon",
  "Marathon",
  "1 Mile Run",
  "100m Sprint",
  "400m Sprint",
  "1500m Run",
  "Cycling 20K",
  "Swimming 1K",
]

export default function PersonalInfo() {
  const {
    addBodyMetrics,
    getLatestBodyMetrics,
    getBMI,
    getPersonalRecords,
    getRecordsByCategory,
    getWeightChartData,
    getBodyFatChartData,
    getBMIChartData,
    bodyMetrics,
  } = usePersonalDataStore()

  const { getPersonalBests } = useWorkoutStore()

  const [showMetricsDialog, setShowMetricsDialog] = useState(false)
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [metricsForm, setMetricsForm] = useState({
    height: 0,
    weight: 0,
    bodyFat: 0,
    muscleMass: 0,
  })
  const [recordForm, setRecordForm] = useState({
    exercise: "",
    category: "strength" as "strength" | "cardio" | "endurance",
    value: 0,
    unit: "kg",
    notes: "",
  })

  const latestMetrics = getLatestBodyMetrics()
  const bmi = getBMI()
  const personalRecords = getPersonalRecords()
  const strengthRecords = getRecordsByCategory("strength")
  const cardioRecords = getRecordsByCategory("cardio")
  const workoutPersonalBests = getPersonalBests()

  // Chart data
  const weightChartData = getWeightChartData().map((d) => ({ ...d, value: d.weight, weight: d.weight }))
  const bodyFatChartData = getBodyFatChartData().map((d) => ({ ...d, value: d.bodyFat, bodyFat: d.bodyFat }))
  const bmiChartData = getBMIChartData().map((d) => ({ ...d, value: d.bmi, bmi: d.bmi }))

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight"
    if (bmi < 25) return "Normal"
    if (bmi < 30) return "Overweight"
    return "Obese"
  }

  const handleMetricsSubmit = () => {
    if (metricsForm.height <= 0 || metricsForm.weight <= 0) {
      toast("Please enter valid height and weight")
      return
    }

    addBodyMetrics({
      height: metricsForm.height,
      weight: metricsForm.weight,
      bodyFat: metricsForm.bodyFat > 0 ? metricsForm.bodyFat : undefined,
      muscleMass: metricsForm.muscleMass > 0 ? metricsForm.muscleMass : undefined,
    })

    setShowMetricsDialog(false)
    toast("Your body metrics have been saved")
  }

  const handleRecordSubmit = () => {
    if (!recordForm.exercise || recordForm.value <= 0) {
      toast("Please enter valid exercise and value")
      return
    }

    addBodyMetrics({
      exercise: recordForm.exercise,
      category: recordForm.category,
      value: recordForm.value,
      unit: recordForm.unit,
      notes: recordForm.notes,
    })

    setRecordForm({
      exercise: "",
      category: "strength",
      value: 0,
      unit: "kg",
      notes: "",
    })
    setShowRecordDialog(false)
    toast(`${recordForm.exercise} personal best has been saved`)
  }

  // Pre-populate form with latest metrics
  const openMetricsDialog = () => {
    if (latestMetrics) {
      setMetricsForm({
        height: latestMetrics.height,
        weight: latestMetrics.weight,
        bodyFat: latestMetrics.bodyFat || 0,
        muscleMass: latestMetrics.muscleMass || 0,
      })
    }
    setShowMetricsDialog(true)
  }

  return (
    <Tabs defaultValue="records" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="records">Training Records</TabsTrigger>
        <TabsTrigger value="metrics">Body Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="records" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Personal Records</h3>
            <p className="text-sm text-muted-foreground">Track your personal bests and achievements</p>
          </div>
          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Training Record</DialogTitle>
                <DialogDescription>Record a new personal best or achievement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={recordForm.category}
                    onValueChange={(value: "strength" | "cardio" | "endurance") =>
                      setRecordForm({ ...recordForm, category: value, unit: value === "strength" ? "kg" : "min" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exercise</Label>
                  <Select
                    value={recordForm.exercise}
                    onValueChange={(value) => setRecordForm({ ...recordForm, exercise: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {(recordForm.category === "strength" ? strengthExercises : cardioExercises).map((exercise) => (
                        <SelectItem key={exercise} value={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={recordForm.value || ""}
                      onChange={(e) => setRecordForm({ ...recordForm, value: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select
                      value={recordForm.unit}
                      onValueChange={(value) => setRecordForm({ ...recordForm, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recordForm.category === "strength" ? (
                          <>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="min">minutes</SelectItem>
                            <SelectItem value="sec">seconds</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Input
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRecordSubmit} className="flex-1">
                    Save Record
                  </Button>
                  <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Strength Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strengthRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{record.exercise}</span>
                      {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {record.value} {record.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {strengthRecords.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No strength records yet. Add your first personal best!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cardio Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardioRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{record.exercise}</span>
                      {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {record.value} {record.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {cardioRecords.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No cardio records yet. Log your first running time!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {Object.keys(workoutPersonalBests).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Workout Personal Bests</CardTitle>
              <CardDescription>Automatically tracked from your workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(workoutPersonalBests).map(([exercise, best]) => (
                  <div key={exercise} className="p-3 border rounded">
                    <div className="font-medium">{exercise}</div>
                    <div className="text-sm text-muted-foreground">
                      {best.weight ? `${best.weight}kg × ` : ""}
                      {best.reps} reps
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(best.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="metrics" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Body Metrics</h3>
            <p className="text-sm text-muted-foreground">Track your physical measurements and progress</p>
          </div>
          <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
            <DialogTrigger asChild>
              <Button onClick={openMetricsDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Update Metrics
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Body Metrics</DialogTitle>
                <DialogDescription>Enter your current measurements</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      value={metricsForm.height || ""}
                      onChange={(e) => setMetricsForm({ ...metricsForm, height: Number(e.target.value) })}
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={metricsForm.weight || ""}
                      onChange={(e) => setMetricsForm({ ...metricsForm, weight: Number(e.target.value) })}
                      placeholder="70.5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Body Fat % (optional)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={metricsForm.bodyFat || ""}
                      onChange={(e) => setMetricsForm({ ...metricsForm, bodyFat: Number(e.target.value) })}
                      placeholder="15.0"
                    />
                  </div>
                  <div>
                    <Label>Muscle Mass (kg, optional)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={metricsForm.muscleMass || ""}
                      onChange={(e) => setMetricsForm({ ...metricsForm, muscleMass: Number(e.target.value) })}
                      placeholder="35.0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleMetricsSubmit} className="flex-1">
                    Save Metrics
                  </Button>
                  <Button variant="outline" onClick={() => setShowMetricsDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <BodyMetricsChart metric="height" title="Height" unit="cm" />

          <BodyMetricsChart metric="weight" title="Weight" unit="kg" />

          <BodyMetricsChart metric="bmi" title="BMI" unit="" />

          <BodyMetricsChart metric="bodyFat" title="Body Fat" unit="%" />
        </div>

        {bodyMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Body Metrics History</CardTitle>
              <CardDescription>Track your height, weight, and body fat over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {bodyMetrics.slice().reverse().map((metrics, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="text-sm">{new Date(metrics.date).toLocaleDateString()}</div>
                      <div className="flex gap-4 text-sm">
                        {metrics.height !== undefined && <span>Height: {metrics.height}cm</span>}
                        {metrics.weight !== undefined && <span>Weight: {metrics.weight}kg</span>}
                        {metrics.bodyFat !== undefined && <span>BF: {metrics.bodyFat}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
