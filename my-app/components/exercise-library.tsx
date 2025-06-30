"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Play, Clock, Target, AlertCircle, User, Heart } from "lucide-react"
import ExerciseVideoPlayer from "@/components/exercise-video-player"
import CustomExerciseCreator from "@/components/custom-exercise-creator"
import FavoriteButton from "@/components/favorite-button"
import { useCustomExerciseStore } from "@/lib/custom-exercise-store"
import { useFavoritesStore } from "@/lib/favorites-store"

interface Exercise {
  id: string
  name: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  equipment: string[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  videoUrl: string
  thumbnailUrl: string
  description: string
  instructions: string[]
  tips: string[]
  commonMistakes: string[]
  duration?: string
  isCustom?: boolean
  createdBy?: string
}

interface ExerciseLibraryProps {
  open: boolean
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
}

export default function ExerciseLibrary({ open, onClose, onSelectExercise }: ExerciseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const { customExercises } = useCustomExerciseStore()
  const { favoriteExercises, getFavoriteCount } = useFavoritesStore()

  // Sample exercise data with video URLs (using placeholder videos)
  const builtInExercises: Exercise[] = [
    {
      id: "1",
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      equipment: ["Bodyweight"],
      primaryMuscles: ["Chest", "Triceps"],
      secondaryMuscles: ["Shoulders", "Core"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description:
        "A fundamental bodyweight exercise that targets the chest, triceps, and shoulders while engaging the core.",
      instructions: [
        "Start in a plank position with hands slightly wider than shoulder-width",
        "Keep your body in a straight line from head to heels",
        "Lower your chest toward the ground by bending your elbows",
        "Push back up to the starting position",
        "Repeat for desired repetitions",
      ],
      tips: [
        "Keep your core engaged throughout the movement",
        "Don't let your hips sag or pike up",
        "Control the descent - don't just drop down",
        "Breathe in on the way down, out on the way up",
      ],
      commonMistakes: [
        "Flaring elbows too wide",
        "Not going through full range of motion",
        "Poor body alignment",
        "Holding breath during the exercise",
      ],
    },
    {
      id: "2",
      name: "Squats",
      category: "Legs",
      difficulty: "Beginner",
      equipment: ["Bodyweight"],
      primaryMuscles: ["Quadriceps", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Calves", "Core"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A compound lower body exercise that targets the quadriceps, glutes, and hamstrings.",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Keep your chest up and core engaged",
        "Lower down by pushing your hips back and bending your knees",
        "Go down until your thighs are parallel to the ground",
        "Drive through your heels to return to standing",
      ],
      tips: [
        "Keep your knees in line with your toes",
        "Don't let your knees cave inward",
        "Keep your weight on your heels",
        "Maintain a neutral spine throughout",
      ],
      commonMistakes: ["Knees caving inward", "Not going deep enough", "Leaning too far forward", "Rising up on toes"],
    },
    {
      id: "3",
      name: "Deadlifts",
      category: "Back",
      difficulty: "Intermediate",
      equipment: ["Barbell", "Dumbbells"],
      primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
      secondaryMuscles: ["Traps", "Lats", "Core"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A fundamental compound movement that targets the posterior chain and builds overall strength.",
      instructions: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Bend at hips and knees to grip the bar",
        "Keep your chest up and shoulders back",
        "Drive through your heels and extend hips and knees",
        "Stand tall, then reverse the movement to lower the bar",
      ],
      tips: [
        "Keep the bar close to your body throughout",
        "Engage your lats to keep the bar path straight",
        "Don't round your back",
        "Think about pushing the floor away with your feet",
      ],
      commonMistakes: [
        "Rounding the back",
        "Bar drifting away from body",
        "Not engaging the lats",
        "Hyperextending at the top",
      ],
    },
    {
      id: "4",
      name: "Pull-ups",
      category: "Back",
      difficulty: "Intermediate",
      equipment: ["Pull-up Bar"],
      primaryMuscles: ["Lats", "Rhomboids"],
      secondaryMuscles: ["Biceps", "Rear Delts"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "An upper body pulling exercise that primarily targets the latissimus dorsi and other back muscles.",
      instructions: [
        "Hang from a pull-up bar with palms facing away",
        "Start with arms fully extended",
        "Pull your body up until your chin clears the bar",
        "Lower yourself back down with control",
        "Repeat for desired repetitions",
      ],
      tips: [
        "Engage your core to prevent swinging",
        "Pull with your back muscles, not just arms",
        "Don't use momentum to help",
        "Focus on the negative (lowering) portion",
      ],
      commonMistakes: [
        "Using momentum or swinging",
        "Not going through full range of motion",
        "Pulling with arms instead of back",
        "Dropping down too quickly",
      ],
    },
    {
      id: "5",
      name: "Plank",
      category: "Core",
      difficulty: "Beginner",
      equipment: ["Bodyweight"],
      primaryMuscles: ["Core", "Abs"],
      secondaryMuscles: ["Shoulders", "Glutes"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "An isometric core exercise that builds stability and strength throughout the entire core.",
      duration: "30-60 seconds",
      instructions: [
        "Start in a push-up position",
        "Lower down to your forearms",
        "Keep your body in a straight line",
        "Hold the position for the desired time",
        "Breathe normally throughout the hold",
      ],
      tips: [
        "Don't let your hips sag or pike up",
        "Keep your head in neutral position",
        "Squeeze your glutes and core",
        "Breathe steadily, don't hold your breath",
      ],
      commonMistakes: [
        "Sagging hips",
        "Piking hips too high",
        "Holding breath",
        "Looking up or down instead of neutral",
      ],
    },
    {
      id: "6",
      name: "Bench Press",
      category: "Chest",
      difficulty: "Intermediate",
      equipment: ["Barbell", "Bench"],
      primaryMuscles: ["Chest", "Triceps"],
      secondaryMuscles: ["Shoulders"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A compound upper body exercise that primarily targets the chest muscles.",
      instructions: [
        "Lie on the bench with feet flat on the floor",
        "Grip the bar slightly wider than shoulder-width",
        "Lower the bar to your chest with control",
        "Press the bar back up to full arm extension",
        "Repeat for desired repetitions",
      ],
      tips: [
        "Keep your shoulder blades retracted",
        "Maintain a slight arch in your back",
        "Don't bounce the bar off your chest",
        "Keep your feet planted on the ground",
      ],
      commonMistakes: [
        "Bouncing the bar off the chest",
        "Flaring elbows too wide",
        "Not retracting shoulder blades",
        "Lifting feet off the ground",
      ],
    },
  ]

  // Combine built-in and custom exercises
  const allExercises = [...builtInExercises, ...customExercises]

  const categories = ["all", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Custom"]

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primaryMuscles.some((muscle) => muscle.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchesCategory = selectedCategory === "all"
    if (selectedCategory === "Custom") {
      matchesCategory = exercise.isCustom === true
    } else if (selectedCategory !== "all") {
      matchesCategory = exercise.category === selectedCategory
    }

    const matchesFavorites = !showFavoritesOnly || favoriteExercises.includes(exercise.id)

    return matchesSearch && matchesCategory && matchesFavorites
  })

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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Exercise Library</DialogTitle>
            <DialogDescription>
              Browse exercises with instructional videos and create your own custom exercises
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Exercises</TabsTrigger>
              <TabsTrigger value="create">Create Custom Exercise</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="flex gap-6 h-[65vh]">
                {/* Exercise List */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                      Favorites ({getFavoriteCount()})
                    </Button>
                  </div>

                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="text-xs">
                          {category === "all" ? "All" : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <ScrollArea className="h-[45vh]">
                    <div className="grid gap-3">
                      {filteredExercises.map((exercise) => (
                        <Card
                          key={exercise.id}
                          className={`cursor-pointer transition-colors hover:bg-accent ${
                            selectedExercise?.id === exercise.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={exercise.thumbnailUrl || "/placeholder.svg"}
                                  alt={exercise.name}
                                  className="w-16 h-12 object-cover rounded"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                  <Play className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{exercise.name}</h4>
                                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                                    {exercise.difficulty}
                                  </Badge>
                                  {exercise.isCustom && (
                                    <Badge variant="outline" className="text-xs">
                                      <User className="h-3 w-3 mr-1" />
                                      Custom
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{exercise.category}</span>
                                  <span>•</span>
                                  <span>{exercise.equipment.join(", ")}</span>
                                  {exercise.isCustom && exercise.createdBy && (
                                    <>
                                      <span>•</span>
                                      <span>by {exercise.createdBy}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <FavoriteButton exerciseId={exercise.id} exerciseName={exercise.name} />
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectExercise(exercise)
                                  }}
                                >
                                  Select
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredExercises.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          {showFavoritesOnly ? (
                            <>
                              <Heart className="h-8 w-8 mx-auto mb-2" />
                              <p>No favorite exercises found.</p>
                              <p className="text-sm">Add exercises to favorites by clicking the heart icon.</p>
                            </>
                          ) : (
                            <p>No exercises found matching your criteria.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Exercise Details */}
                {selectedExercise && (
                  <div className="w-1/2 space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {selectedExercise.name}
                            {selectedExercise.isCustom && (
                              <Badge variant="outline" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                Custom
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <FavoriteButton exerciseId={selectedExercise.id} exerciseName={selectedExercise.name} />
                            <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                              {selectedExercise.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{selectedExercise.description}</CardDescription>
                        {selectedExercise.isCustom && selectedExercise.createdBy && (
                          <p className="text-sm text-muted-foreground">Created by {selectedExercise.createdBy}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ExerciseVideoPlayer
                          videoUrl={selectedExercise.videoUrl}
                          thumbnailUrl={selectedExercise.thumbnailUrl}
                          title={selectedExercise.name}
                        />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium mb-1">Primary Muscles</h5>
                            <div className="flex flex-wrap gap-1">
                              {selectedExercise.primaryMuscles.map((muscle) => (
                                <Badge key={muscle} variant="secondary" className="text-xs">
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Equipment</h5>
                            <div className="flex flex-wrap gap-1">
                              {selectedExercise.equipment.map((item) => (
                                <Badge key={item} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Tabs defaultValue="instructions" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="instructions">Instructions</TabsTrigger>
                            <TabsTrigger value="tips">Tips</TabsTrigger>
                            <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
                          </TabsList>

                          <TabsContent value="instructions" className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <h5 className="font-medium">Step-by-Step Instructions</h5>
                            </div>
                            <ol className="space-y-2 text-sm">
                              {selectedExercise.instructions.map((instruction, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="font-medium text-blue-600 min-w-[20px]">{index + 1}.</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ol>
                            {selectedExercise.duration && (
                              <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Duration: {selectedExercise.duration}</span>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="tips" className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-green-600" />
                              <h5 className="font-medium">Pro Tips</h5>
                            </div>
                            <ul className="space-y-2 text-sm">
                              {selectedExercise.tips.map((tip, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-green-600 min-w-[8px]">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </TabsContent>

                          <TabsContent value="mistakes" className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <h5 className="font-medium">Common Mistakes to Avoid</h5>
                            </div>
                            <ul className="space-y-2 text-sm">
                              {selectedExercise.commonMistakes.map((mistake, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-red-600 min-w-[8px]">•</span>
                                  <span>{mistake}</span>
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                        </Tabs>

                        <Button onClick={() => onSelectExercise(selectedExercise)} className="w-full">
                          Add {selectedExercise.name} to Workout
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create">
              <CustomExerciseCreator onExerciseCreated={() => {}} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
