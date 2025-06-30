"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Play,
  Clock,
  Target,
  AlertCircle,
  User,
  Filter,
  Grid3X3,
  List,
  Plus,
  BookOpen,
  Dumbbell,
  Heart,
} from "lucide-react"
import ExerciseVideoPlayer from "@/components/exercise-video-player"
import CustomExerciseCreator from "@/components/custom-exercise-creator"
import FavoriteButton from "@/components/favorite-button"
import { useCustomExerciseStore } from "@/lib/custom-exercise-store"
import { useWorkoutStore } from "@/lib/workout-store"
import { useFavoritesStore } from "@/lib/favorites-store"
import { toast } from "@/hooks/use-toast"

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

export default function ExerciseDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showExerciseDetail, setShowExerciseDetail] = useState(false)
  const [showCustomCreator, setShowCustomCreator] = useState(false)

  const { customExercises } = useCustomExerciseStore()
  const { addWorkout } = useWorkoutStore()
  const { favoriteExercises, getFavoriteCount } = useFavoritesStore()

  // Built-in exercises database
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
    {
      id: "7",
      name: "Overhead Press",
      category: "Shoulders",
      difficulty: "Intermediate",
      equipment: ["Barbell", "Dumbbells"],
      primaryMuscles: ["Shoulders", "Triceps"],
      secondaryMuscles: ["Core", "Upper Back"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A vertical pressing movement that builds shoulder strength and stability.",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Hold the bar at shoulder level with hands slightly wider than shoulders",
        "Press the bar straight up overhead",
        "Lower the bar back to shoulder level with control",
        "Repeat for desired repetitions",
      ],
      tips: [
        "Keep your core tight throughout the movement",
        "Don't arch your back excessively",
        "Press the bar in a straight line",
        "Keep your elbows slightly forward",
      ],
      commonMistakes: [
        "Pressing the bar forward instead of straight up",
        "Excessive back arch",
        "Not engaging the core",
        "Partial range of motion",
      ],
    },
    {
      id: "8",
      name: "Barbell Rows",
      category: "Back",
      difficulty: "Intermediate",
      equipment: ["Barbell"],
      primaryMuscles: ["Lats", "Rhomboids", "Middle Traps"],
      secondaryMuscles: ["Biceps", "Rear Delts"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A horizontal pulling exercise that targets the middle back and lats.",
      instructions: [
        "Stand with feet hip-width apart, holding the barbell",
        "Hinge at the hips and lean forward slightly",
        "Pull the bar to your lower chest/upper abdomen",
        "Squeeze your shoulder blades together at the top",
        "Lower the bar with control",
      ],
      tips: [
        "Keep your chest up and shoulders back",
        "Don't use momentum to lift the weight",
        "Focus on pulling with your back muscles",
        "Maintain a neutral spine",
      ],
      commonMistakes: [
        "Using too much momentum",
        "Not retracting shoulder blades",
        "Pulling to the wrong position",
        "Rounding the back",
      ],
    },
    {
      id: "9",
      name: "Lunges",
      category: "Legs",
      difficulty: "Beginner",
      equipment: ["Bodyweight", "Dumbbells"],
      primaryMuscles: ["Quadriceps", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Calves", "Core"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A unilateral leg exercise that improves balance and targets the quadriceps and glutes.",
      instructions: [
        "Stand with feet hip-width apart",
        "Step forward with one leg into a lunge position",
        "Lower your body until both knees are at 90 degrees",
        "Push through your front heel to return to starting position",
        "Repeat on the other leg",
      ],
      tips: [
        "Keep your torso upright",
        "Don't let your front knee go past your toes",
        "Step far enough forward for proper form",
        "Control the descent",
      ],
      commonMistakes: [
        "Knee going too far forward",
        "Not stepping far enough",
        "Leaning forward too much",
        "Not going deep enough",
      ],
    },
    {
      id: "10",
      name: "Dips",
      category: "Arms",
      difficulty: "Intermediate",
      equipment: ["Dip Bars", "Bench"],
      primaryMuscles: ["Triceps", "Chest"],
      secondaryMuscles: ["Shoulders"],
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      description: "A bodyweight exercise that primarily targets the triceps and lower chest.",
      instructions: [
        "Grip the dip bars and support your body weight",
        "Start with arms fully extended",
        "Lower your body by bending your elbows",
        "Go down until your shoulders are below your elbows",
        "Push back up to the starting position",
      ],
      tips: [
        "Keep your body upright for tricep focus",
        "Lean forward slightly for chest focus",
        "Don't go too deep if you feel shoulder discomfort",
        "Control the movement throughout",
      ],
      commonMistakes: [
        "Going too deep and straining shoulders",
        "Using momentum",
        "Not going through full range of motion",
        "Flaring elbows too wide",
      ],
    },
  ]

  // Combine all exercises
  const allExercises = [...builtInExercises, ...customExercises]

  // Get unique values for filters
  const categories = ["all", ...new Set(allExercises.map((e) => e.category))]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]
  const equipment = ["all", ...new Set(allExercises.flatMap((e) => e.equipment))]

  // Filter exercises
  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.primaryMuscles.some((muscle) => muscle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exercise.equipment.some((eq) => eq.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty
    const matchesEquipment = selectedEquipment === "all" || exercise.equipment.includes(selectedEquipment)
    const matchesFavorites = !showFavoritesOnly || favoriteExercises.includes(exercise.id)

    return matchesSearch && matchesCategory && matchesDifficulty && matchesEquipment && matchesFavorites
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

  const addToQuickWorkout = (exercise: Exercise) => {
    const workout = {
      id: Date.now().toString(),
      name: `Quick ${exercise.name} Session`,
      date: new Date().toISOString(),
      duration: 15,
      exercises: [
        {
          name: exercise.name,
          sets: 3,
          reps: exercise.name === "Plank" ? 1 : 10,
          notes: `Added from exercise database`,
        },
      ],
    }

    addWorkout(workout)
    toast({
      title: "Quick Workout Created!",
      description: `${exercise.name} workout has been added to your history`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Exercise Database
          </h2>
          <p className="text-muted-foreground">
            Comprehensive library of {allExercises.length} exercises with video demonstrations and detailed instructions
          </p>
        </div>
        <Button onClick={() => setShowCustomCreator(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exercise
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises, muscles, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                Favorites ({getFavoriteCount()})
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === "all" ? "All Levels" : difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Equipment</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq === "all" ? "All Equipment" : eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedDifficulty("all")
                  setSelectedEquipment("all")
                  setShowFavoritesOnly(false)
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredExercises.length} of {allExercises.length} exercises
              {showFavoritesOnly && " (favorites only)"}
            </span>
            <span>
              {customExercises.length} custom exercises • {getFavoriteCount()} favorites
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid/List */}
      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {viewMode === "grid" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={exercise.thumbnailUrl || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setShowExerciseDetail(true)
                        }}
                      >
                        <Play className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <FavoriteButton exerciseId={exercise.id} exerciseName={exercise.name} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{exercise.name}</h4>
                      {exercise.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(exercise.difficulty)} variant="secondary">
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{exercise.primaryMuscles.join(", ")}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setShowExerciseDetail(true)
                        }}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => addToQuickWorkout(exercise)} className="flex-1">
                        <Dumbbell className="h-3 w-3 mr-1" />
                        Quick Add
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={exercise.thumbnailUrl || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-20 h-16 object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <Badge className={getDifficultyColor(exercise.difficulty)} variant="secondary">
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                      {exercise.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Muscles: {exercise.primaryMuscles.join(", ")}</span>
                      <span>Equipment: {exercise.equipment.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <FavoriteButton exerciseId={exercise.id} exerciseName={exercise.name} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedExercise(exercise)
                        setShowExerciseDetail(true)
                      }}
                    >
                      View Details
                    </Button>
                    <Button size="sm" onClick={() => addToQuickWorkout(exercise)}>
                      <Dumbbell className="h-3 w-3 mr-1" />
                      Quick Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            {showFavoritesOnly ? (
              <>
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No favorite exercises yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding exercises to your favorites by clicking the heart icon on any exercise.
                </p>
                <Button onClick={() => setShowFavoritesOnly(false)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Exercises
                </Button>
              </>
            ) : (
              <>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No exercises found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find exercises.
                </p>
                <Button onClick={() => setShowCustomCreator(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Exercise
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercise Detail Modal */}
      <Dialog open={showExerciseDetail} onOpenChange={setShowExerciseDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedExercise?.name}
              {selectedExercise?.isCustom && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Custom
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedExercise?.description}</DialogDescription>
          </DialogHeader>

          {selectedExercise && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ExerciseVideoPlayer
                  videoUrl={selectedExercise.videoUrl}
                  thumbnailUrl={selectedExercise.thumbnailUrl}
                  title={selectedExercise.name}
                />

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
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

                <div className="flex gap-2 mt-4">
                  <FavoriteButton
                    exerciseId={selectedExercise.id}
                    exerciseName={selectedExercise.name}
                    variant="outline"
                    showText
                    className="flex-1"
                  />
                  <Button onClick={() => addToQuickWorkout(selectedExercise)} className="flex-1">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Create Quick Workout
                  </Button>
                </div>
              </div>

              <div>
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
                    <ScrollArea className="h-64">
                      <ol className="space-y-2 text-sm">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="font-medium text-blue-600 min-w-[20px]">{index + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
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
                    <ScrollArea className="h-64">
                      <ul className="space-y-2 text-sm">
                        {selectedExercise.tips.map((tip, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-green-600 min-w-[8px]">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="mistakes" className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <h5 className="font-medium">Common Mistakes to Avoid</h5>
                    </div>
                    <ScrollArea className="h-64">
                      <ul className="space-y-2 text-sm">
                        {selectedExercise.commonMistakes.map((mistake, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-red-600 min-w-[8px]">•</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Exercise Creator Modal */}
      <Dialog open={showCustomCreator} onOpenChange={setShowCustomCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create Custom Exercise</DialogTitle>
            <DialogDescription>Add your own exercise with video instructions and detailed guidance</DialogDescription>
          </DialogHeader>
          <CustomExerciseCreator onExerciseCreated={() => setShowCustomCreator(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
