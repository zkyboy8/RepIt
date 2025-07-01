"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Dumbbell, MessageCircle, TrendingUp, Calendar, Clock, BookOpen, Trophy, Play } from "lucide-react"
import WorkoutLogger from "@/components/workout-logger"
import AIWorkoutChat from "@/components/ai-workout-chat"
import ProgressTracker from "@/components/progress-tracker"
import { useWorkoutStore } from "@/lib/workout-store"
import ExerciseDatabase from "@/components/exercise-database"
import TrainingPrograms from "@/components/training-programs"

export default function GymApp() {
  const { workouts, getWeeklyStats, getTodaysWorkout, currentWorkout, clearCurrentWorkout } = useWorkoutStore()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mounted, setMounted] = useState(false)

  const weeklyStats = getWeeklyStats()
  const todaysWorkout = getTodaysWorkout()

  useEffect(() => {
    const handleSwitchToWorkout = () => {
      setActiveTab("workout")
    }

    window.addEventListener("switchToWorkout", handleSwitchToWorkout)

    return () => {
      window.removeEventListener("switchToWorkout", handleSwitchToWorkout)
    }
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!currentWorkout && activeTab === "current-workout") {
      setActiveTab("dashboard")
    }
  }, [currentWorkout, activeTab])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">FitTracker Pro</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal gym companion with AI-powered workout planning
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${currentWorkout ? "grid-cols-7 lg:grid-cols-7" : "grid-cols-6 lg:grid-cols-6"}`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
            {currentWorkout && (
              <TabsTrigger value="current-workout" className="flex items-center gap-2 text-green-700">
                <Play className="h-4 w-4" />
                Current Workout
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats.workouts}</div>
                  <p className="text-xs text-muted-foreground">workouts completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats.totalMinutes}m</div>
                  <p className="text-xs text-muted-foreground">this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exercises</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyStats.exercises}</div>
                  <p className="text-xs text-muted-foreground">total exercises</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round((weeklyStats.workouts / 5) * 100)}%</div>
                  <Progress value={(weeklyStats.workouts / 5) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Workout</CardTitle>
                  <CardDescription>
                    {todaysWorkout ? "Continue your workout" : "Start a new workout session"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todaysWorkout ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{todaysWorkout.name}</span>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      <div className="space-y-2">
                        {todaysWorkout.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{exercise.name}</span>
                            <span className="text-muted-foreground">
                              {exercise.sets.length} sets × {(exercise.sets[0]?.reps ?? '-')} reps
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => setActiveTab("workout")} className="w-full">
                        Continue Workout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Ready to start your workout? Log exercises or get AI recommendations.
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => setActiveTab("workout")} className="flex-1">
                          Start Workout
                        </Button>
                        <Button onClick={() => setActiveTab("ai-chat")} variant="outline" className="flex-1">
                          Get AI Plan
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest workout sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workouts.slice(0, 4).map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString()} • {workout.duration}m
                          </p>
                        </div>
                        <Badge variant="outline">{workout.exercises.length} exercises</Badge>
                      </div>
                    ))}
                    {workouts.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No workouts yet. Start your first session!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workout">
            <WorkoutLogger forceSelectMode={true} onSessionStart={() => setActiveTab("current-workout")} />
          </TabsContent>

          <TabsContent value="exercises">
            <ExerciseDatabase />
          </TabsContent>

          <TabsContent value="training">
            <TrainingPrograms />
          </TabsContent>

          <TabsContent value="ai-chat">
            <AIWorkoutChat />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker />
          </TabsContent>

          {currentWorkout && (
            <TabsContent value="current-workout">
              <WorkoutLogger onSessionEnd={() => setActiveTab("dashboard")} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
