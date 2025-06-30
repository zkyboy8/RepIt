"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, Award, Target, BarChart3 } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"
import PersonalInfo from "@/components/personal-info"

export default function ProgressTracker() {
  const { workouts, getProgressStats } = useWorkoutStore()
  const [timeframe, setTimeframe] = useState("month")

  const stats = getProgressStats(timeframe)

  const achievements = [
    { name: "First Workout", description: "Complete your first workout", completed: workouts.length > 0 },
    { name: "Consistency King", description: "Workout 3 times in a week", completed: stats.weeklyWorkouts >= 3 },
    { name: "Century Club", description: "Complete 100 total exercises", completed: stats.totalExercises >= 100 },
    { name: "Time Master", description: "Workout for 10+ hours total", completed: stats.totalMinutes >= 600 },
    { name: "Variety Seeker", description: "Try 20 different exercises", completed: stats.uniqueExercises >= 20 },
  ]

  const exerciseFrequency = workouts
    .flatMap((w) => w.exercises)
    .reduce(
      (acc, exercise) => {
        acc[exercise.name] = (acc[exercise.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const topExercises = Object.entries(exerciseFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Progress Tracker</h2>
          <p className="text-muted-foreground">Monitor your fitness journey and achievements</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "week" ? "this week" : timeframe === "month" ? "this month" : "total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercise Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExercises}</div>
            <p className="text-xs text-muted-foreground">total exercises completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</div>
            <p className="text-xs text-muted-foreground">{stats.totalMinutes} minutes total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}m</div>
            <p className="text-xs text-muted-foreground">per workout session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="exercises">Top Exercises</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfo />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Unlock badges by reaching fitness milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      achievement.completed
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${achievement.completed ? "bg-green-600" : "bg-slate-400"}`}>
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.name}</h4>
                        {achievement.completed && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Performed Exercises</CardTitle>
              <CardDescription>Your favorite exercises based on frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topExercises.map(([exercise, count], index) => (
                  <div key={exercise} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{exercise}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(count / Math.max(...topExercises.map(([, c]) => c))) * 100} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{count}x</span>
                    </div>
                  </div>
                ))}
                {topExercises.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No exercises recorded yet. Start working out to see your progress!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Your complete workout timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{workout.duration}m</div>
                      <div className="text-sm text-muted-foreground">{workout.exercises.length} exercises</div>
                    </div>
                  </div>
                ))}
                {workouts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No workout history yet. Complete your first workout to see it here!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
