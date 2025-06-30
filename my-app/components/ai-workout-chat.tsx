"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Send, Bot, User, Dumbbell, Target, Clock, Zap, Heart, TrendingUp } from "lucide-react"
import { useWorkoutStore } from "@/lib/workout-store"
import { usePersonalDataStore } from "@/lib/personal-data-store"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  workoutSuggestion?: {
    name: string
    exercises: Array<{
      name: string
      sets: number
      reps: number
      notes?: string
    }>
    duration: number
    difficulty: "Beginner" | "Intermediate" | "Advanced"
  }
}

export default function AIWorkoutChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI fitness coach. I can help you create personalized workouts, answer fitness questions, and provide exercise recommendations. What would you like to work on today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { workouts, addWorkout } = useWorkoutStore()
  const { profile } = usePersonalDataStore()

  const quickPrompts = [
    {
      icon: Dumbbell,
      title: "Upper Body Workout",
      prompt: "Create a 45-minute upper body strength workout for intermediate level",
      category: "Strength",
    },
    {
      icon: Heart,
      title: "Cardio Session",
      prompt: "Design a 30-minute HIIT cardio workout for fat burning",
      category: "Cardio",
    },
    {
      icon: Target,
      title: "Core Focus",
      prompt: "Give me a 20-minute core strengthening routine",
      category: "Core",
    },
    {
      icon: Zap,
      title: "Quick Workout",
      prompt: "I only have 15 minutes, what's a good full-body workout?",
      category: "Quick",
    },
    {
      icon: TrendingUp,
      title: "Progressive Plan",
      prompt: "Create a 4-week progressive strength training plan",
      category: "Planning",
    },
    {
      icon: Clock,
      title: "Recovery Day",
      prompt: "What should I do on my rest day for active recovery?",
      category: "Recovery",
    },
  ]

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simple AI response logic based on keywords
    let response = ""
    let workoutSuggestion = undefined

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("upper body") || lowerMessage.includes("chest") || lowerMessage.includes("arms")) {
      response =
        "Great choice! Upper body training is essential for building functional strength. Here's a balanced workout that targets your chest, shoulders, back, and arms:"
      workoutSuggestion = {
        name: "Upper Body Strength",
        duration: 45,
        difficulty: "Intermediate" as const,
        exercises: [
          { name: "Push-ups", sets: 3, reps: 12, notes: "Modify on knees if needed" },
          { name: "Pull-ups", sets: 3, reps: 8, notes: "Use assistance if needed" },
          { name: "Overhead Press", sets: 3, reps: 10, notes: "Start with lighter weight" },
          { name: "Barbell Rows", sets: 3, reps: 10, notes: "Focus on squeezing shoulder blades" },
          { name: "Dips", sets: 3, reps: 10, notes: "Use bench or parallel bars" },
          { name: "Bicep Curls", sets: 3, reps: 12, notes: "Control the movement" },
        ],
      }
    } else if (lowerMessage.includes("cardio") || lowerMessage.includes("hiit") || lowerMessage.includes("fat")) {
      response =
        "Excellent! HIIT cardio is one of the most effective ways to burn fat and improve cardiovascular fitness. This workout alternates between high-intensity bursts and recovery periods:"
      workoutSuggestion = {
        name: "HIIT Cardio Blast",
        duration: 30,
        difficulty: "Intermediate" as const,
        exercises: [
          { name: "Jumping Jacks", sets: 4, reps: 30, notes: "30 seconds work, 30 seconds rest" },
          { name: "Burpees", sets: 4, reps: 10, notes: "Focus on form over speed" },
          { name: "Mountain Climbers", sets: 4, reps: 20, notes: "Keep core tight" },
          { name: "High Knees", sets: 4, reps: 30, notes: "Drive knees up high" },
          { name: "Jump Squats", sets: 4, reps: 15, notes: "Land softly" },
        ],
      }
    } else if (lowerMessage.includes("core") || lowerMessage.includes("abs") || lowerMessage.includes("stomach")) {
      response =
        "Core strength is the foundation of all movement! This routine targets all areas of your core including your abs, obliques, and lower back:"
      workoutSuggestion = {
        name: "Core Crusher",
        duration: 20,
        difficulty: "Intermediate" as const,
        exercises: [
          { name: "Plank", sets: 3, reps: 1, notes: "Hold for 45-60 seconds" },
          { name: "Russian Twists", sets: 3, reps: 20, notes: "Keep feet elevated" },
          { name: "Dead Bug", sets: 3, reps: 10, notes: "Each side, slow and controlled" },
          { name: "Bicycle Crunches", sets: 3, reps: 20, notes: "Each side" },
          { name: "Leg Raises", sets: 3, reps: 12, notes: "Keep lower back pressed down" },
        ],
      }
    } else if (
      lowerMessage.includes("15 minutes") ||
      lowerMessage.includes("quick") ||
      lowerMessage.includes("short")
    ) {
      response = "Perfect for a busy schedule! This quick full-body workout hits all major muscle groups efficiently:"
      workoutSuggestion = {
        name: "15-Minute Express",
        duration: 15,
        difficulty: "Beginner" as const,
        exercises: [
          { name: "Bodyweight Squats", sets: 2, reps: 15, notes: "Focus on depth" },
          { name: "Push-ups", sets: 2, reps: 10, notes: "Modify as needed" },
          { name: "Lunges", sets: 2, reps: 10, notes: "Each leg" },
          { name: "Plank", sets: 2, reps: 1, notes: "Hold for 30 seconds" },
          { name: "Jumping Jacks", sets: 2, reps: 20, notes: "Get heart rate up" },
        ],
      }
    } else if (
      lowerMessage.includes("legs") ||
      lowerMessage.includes("lower body") ||
      lowerMessage.includes("glutes")
    ) {
      response =
        "Leg day is crucial for building overall strength and power! This workout targets your quads, hamstrings, glutes, and calves:"
      workoutSuggestion = {
        name: "Lower Body Power",
        duration: 50,
        difficulty: "Advanced" as const,
        exercises: [
          { name: "Squats", sets: 4, reps: 12, notes: "Go deep, chest up" },
          { name: "Romanian Deadlifts", sets: 4, reps: 10, notes: "Feel the hamstring stretch" },
          { name: "Lunges", sets: 3, reps: 12, notes: "Each leg, step back" },
          { name: "Calf Raises", sets: 3, reps: 20, notes: "Pause at the top" },
          { name: "Glute Bridges", sets: 3, reps: 15, notes: "Squeeze glutes at top" },
        ],
      }
    } else if (lowerMessage.includes("recovery") || lowerMessage.includes("rest") || lowerMessage.includes("active")) {
      response =
        "Active recovery is just as important as your training days! Here are some great options for your rest day that will help you recover while staying active:"
      response +=
        "\n\n• Light walking or hiking (20-30 minutes)\n• Gentle yoga or stretching routine\n• Swimming at an easy pace\n• Foam rolling and mobility work\n• Light bike ride\n• Meditation and breathing exercises\n\nRemember, the goal is to move your body gently while allowing your muscles to recover!"
    } else if (lowerMessage.includes("plan") || lowerMessage.includes("program") || lowerMessage.includes("week")) {
      response =
        "Creating a progressive plan is smart! Here's a sample 4-week structure:\n\n**Week 1-2: Foundation**\n• 3 workouts per week\n• Focus on form and technique\n• 2-3 sets per exercise\n\n**Week 3-4: Progression**\n• 4 workouts per week\n• Increase weight/reps by 10-15%\n• Add more challenging variations\n\n**Key principles:**\n• Progressive overload\n• Adequate rest between sessions\n• Proper nutrition and hydration\n• Listen to your body\n\nWould you like me to create a specific workout for any of these weeks?"
    } else {
      // Generic helpful response
      response =
        "I'd be happy to help you with your fitness goals! I can assist with:\n\n• Creating custom workout routines\n• Exercise form and technique tips\n• Nutrition guidance\n• Training program design\n• Recovery and rest day activities\n• Motivation and goal setting\n\nWhat specific area would you like to focus on? Feel free to ask about any exercise, muscle group, or fitness goal!"
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      workoutSuggestion,
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(userMessage.content)
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error generating AI response:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleUseWorkout = (workout: NonNullable<Message["workoutSuggestion"]>) => {
    const workoutData = {
      id: Date.now().toString(),
      name: workout.name,
      date: new Date().toISOString(),
      duration: workout.duration,
      exercises: workout.exercises.map((ex) => ({
        name: ex.name,
        targetSets: ex.sets,
        targetReps: ex.reps,
        sets: [],
        notes: ex.notes,
      })),
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pendingWorkout", JSON.stringify(workoutData))
    }

    // Switch to workout tab
    window.dispatchEvent(new CustomEvent("switchToWorkout"))

    toast({
      title: "Workout Loaded!",
      description: `${workout.name} has been loaded in the workout tab`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Fitness Coach
          </CardTitle>
          <CardDescription>
            Get personalized workout recommendations and fitness advice from your AI coach
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat with AI</TabsTrigger>
          <TabsTrigger value="quick">Quick Workouts</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                          }`}
                        >
                          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user" ? "bg-blue-600 text-white" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          {message.workoutSuggestion && (
                            <div className="mt-3 p-3 bg-background rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">{message.workoutSuggestion.name}</h4>
                                <Badge variant="outline">{message.workoutSuggestion.difficulty}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {message.workoutSuggestion.duration} minutes •{" "}
                                {message.workoutSuggestion.exercises.length} exercises
                              </div>
                              <div className="space-y-1 mb-3">
                                {message.workoutSuggestion.exercises.slice(0, 3).map((ex, idx) => (
                                  <div key={idx} className="text-xs text-foreground">
                                    • {ex.name} - {ex.sets} sets × {ex.reps} reps
                                  </div>
                                ))}
                                {message.workoutSuggestion.exercises.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{message.workoutSuggestion.exercises.length - 3} more exercises
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleUseWorkout(message.workoutSuggestion!)}
                                className="w-full"
                              >
                                <Dumbbell className="h-3 w-3 mr-1" />
                                Start This Workout
                              </Button>
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about workouts, exercises, or fitness goals..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickPrompts.map((prompt, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <prompt.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{prompt.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {prompt.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{prompt.prompt}</p>
                  <Button size="sm" onClick={() => handleQuickPrompt(prompt.prompt)} className="w-full">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Ask AI Coach
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
