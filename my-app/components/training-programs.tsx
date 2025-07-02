"use client"

import React, { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Play,
  Award,
  Mountain,
  Bike,
  Waves,
  Dumbbell,
  Zap,
  Activity,
} from "lucide-react"
import { trainingPrograms } from "@/data/training-programs"
import { useTrainingProgramsStore } from "@/lib/training-programs-store"
import type { TrainingProgram } from "@/lib/training-programs-store"
import { toast } from "@/hooks/use-toast"

const sportIcons = {
  Running: Activity,
  Climbing: Mountain,
  Powerlifting: Dumbbell,
  CrossFit: Zap,
  Swimming: Waves,
  Cycling: Bike,
}

export default function TrainingPrograms() {
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null)
  const [showProgramDetail, setShowProgramDetail] = useState(false)
  const [selectedSport, setSelectedSport] = useState("all")

  const programs = useTrainingProgramsStore((state) => state.programs)
  const currentProgram = useTrainingProgramsStore((state) => state.currentProgram)
  const setCurrentProgram = useTrainingProgramsStore((state) => state.setCurrentProgram)
  const markSessionComplete = useTrainingProgramsStore((state) => state.markSessionComplete)
  const isSessionComplete = useTrainingProgramsStore((state) => state.isSessionComplete)
  const getSessionProgress = useTrainingProgramsStore((state) => state.getSessionProgress)

  // Seed the store exactly once after mount
  useEffect(() => {
    if (programs.length === 0) {
      useTrainingProgramsStore.setState({ programs: trainingPrograms })
    }
  }, [programs])

  const sports = ["all", ...new Set(trainingPrograms.map((p) => p.sport))]
  const filteredPrograms =
    selectedSport === "all" ? trainingPrograms : trainingPrograms.filter((p) => p.sport === selectedSport)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleStartProgram = (programId: string) => {
    const program = programs.find((p) => p.id === programId)
    if (program) {
      setCurrentProgram(program)
      toast('Program Started!')
    }
  }

  const handleCompleteSession = (programId: string, week: number, sessionIndex: number) => {
    // Implementation of handleCompleteSession
    toast('Session Completed!')
  }

  const getProgressPercentage = (programId: string) => {
    return Math.round(getSessionProgress(programId))
  }

  const currentProgress = currentProgram ? getSessionProgress(currentProgram.id) : null

  const handleStartSession = (session: any, programName: string) => {
    // Navigate to workout tab and start a new workout with the session exercises
    const sessionWorkout = {
      name: `${session.name} - ${programName}`,
      exercises: session.exercises.map((e: any) => ({
        name: e.name,
        sets: e.sets,
        reps: typeof e.reps === "string" ? 10 : e.reps,
        weight: typeof e.weight === "string" ? undefined : e.weight,
        duration: e.duration,
        notes: e.notes || `From ${programName} training program`,
      })),
    }

    // Store the session workout in localStorage for the workout logger to pick up
    if (typeof window !== "undefined") {
      localStorage.setItem("pendingWorkout", JSON.stringify(sessionWorkout))
    }

    // Switch to workout tab
    window.dispatchEvent(new CustomEvent("switchToWorkout"))

    toast('Session Started!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Sport-Specific Training
          </h2>
          <p className="text-muted-foreground">
            Specialized programs designed to help you excel in your chosen sport or event
          </p>
        </div>
      </div>

      {/* Active Program Dashboard */}
      {currentProgram && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Active Program: {currentProgram.name}
                </CardTitle>
                <CardDescription>
                  Progress: {getSessionProgress(currentProgram.id).toFixed(0)}%
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {currentProgram.sport}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={getSessionProgress(currentProgram.id)} className="w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Sessions</h4>
                <div className="space-y-2">
                  {currentProgram.sessions.map((session, index) => {
                    const isCompleted = isSessionComplete(session.id)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                          )}
                          <span className="text-sm font-medium">{session.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleStartSession(session, currentProgram.name)
                            }}
                          >
                            Start Workout
                          </Button>
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => markSessionComplete(session.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProgram(currentProgram)
                  setShowProgramDetail(true)
                }}
                className="flex-1"
              >
                View Program Details
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setCurrentProgram(null)
                  toast('Program Stopped')
                }}
              >
                Stop Program
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sport Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Training Programs</CardTitle>
          <CardDescription>Choose a sport-specific program to start your training journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSport} onValueChange={setSelectedSport}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-7">
              {sports.map((sport) => (
                <TabsTrigger key={sport} value={sport} className="text-xs">
                  {sport === "all" ? "All Sports" : sport}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((program) => {
          const IconComponent = sportIcons[program.sport as keyof typeof sportIcons] || Trophy
          const progress = getSessionProgress(program.id)
          const isActive = currentProgram?.id === program.id

          return (
            <Card
              key={program.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${isActive ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <Badge className={getDifficultyColor(program.difficulty)}>{program.difficulty}</Badge>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <CardDescription className="line-clamp-2">{program.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {program.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {program.sport}
                  </div>
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressPercentage(program.id)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(program.id)} className="w-full" />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Goals:</h4>
                  <div className="flex flex-wrap gap-1">
                    {program.goals.slice(0, 3).map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                    {program.goals.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{program.goals.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProgram(program)
                      setShowProgramDetail(true)
                    }}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {!isActive ? (
                    <Button onClick={() => handleStartProgram(program.id)} className="flex-1">
                      Start Program
                    </Button>
                  ) : (
                    <Button variant="secondary" className="flex-1" disabled>
                      Active
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Program Detail Modal */}
      <Dialog open={showProgramDetail} onOpenChange={setShowProgramDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProgram && (
                <>
                  {React.createElement(sportIcons[selectedProgram.sport as keyof typeof sportIcons] || Trophy, {
                    className: "h-5 w-5",
                  })}
                  {selectedProgram.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>{selectedProgram?.description}</DialogDescription>
          </DialogHeader>

          {selectedProgram && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Program Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedProgram.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <Badge className={getDifficultyColor(selectedProgram.difficulty)}>
                        {selectedProgram.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sport:</span>
                      <span className="font-medium">{selectedProgram.sport}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Equipment</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProgram.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="goals" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4">
                  <h4 className="font-medium">Training Goals</h4>
                  <ul className="space-y-2">
                    {selectedProgram.goals.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-primary" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <h4 className="font-medium">Sample Week (Week 1)</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {selectedProgram.weeks[0]?.sessions.map((session, index) => (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">
                                {session.name}
                              </h5>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {session.estimatedDuration}min
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartSession(session, selectedProgram.name)
                                    setShowProgramDetail(false)
                                  }}
                                >
                                  Start Session
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              {session.exercises.slice(0, 2).map((exercise, exerciseIndex) => (
                                <div key={exerciseIndex} className="text-muted-foreground">
                                  • {exercise.name} - {exercise.sets.length} sets × {typeof exercise.reps === 'object' ? JSON.stringify(exercise.reps) : exercise.reps}
                                </div>
                              ))}
                              {session.exercises.length > 2 && (
                                <div className="text-muted-foreground text-xs">
                                  +{session.exercises.length - 2} more exercises
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="tips" className="space-y-4">
                  <h4 className="font-medium">Training Tips</h4>
                  <ul className="space-y-2">
                    {selectedProgram?.tips?.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4">
                  <h4 className="font-medium">Nutrition Guidelines</h4>
                  {selectedProgram.nutrition ? (
                    <ul className="space-y-2">
                      {selectedProgram.nutrition.map((guideline, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="h-4 w-4 bg-green-600 rounded-full mt-0.5 flex-shrink-0" />
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Follow a balanced diet appropriate for your training intensity and goals.
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                {selectedProgram?.id !== currentProgram?.id ? (
                  <Button
                    onClick={() => {
                      handleStartProgram(selectedProgram.id)
                      setShowProgramDetail(false)
                    }}
                    className="flex-1"
                  >
                    Start This Program
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" disabled>
                    Currently Active
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowProgramDetail(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
