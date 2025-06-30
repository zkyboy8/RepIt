"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Dumbbell, Heart, Plus } from "lucide-react"
import { exerciseDatabase } from "@/data/exercise-database"
import { useCustomExerciseStore } from "@/lib/custom-exercise-store"
import { useFavoritesStore } from "@/lib/favorites-store"
import FavoriteButton from "./favorite-button"

interface ExerciseSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectExercise: (exercise: any) => void
  selectedExercises?: string[]
}

export default function ExerciseSelector({
  isOpen,
  onClose,
  onSelectExercise,
  selectedExercises = [],
}: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All")
  const [selectedEquipment, setSelectedEquipment] = useState("All")

  const { customExercises } = useCustomExerciseStore()
  const { favoriteExercises } = useFavoritesStore()

  // Combine database exercises with custom exercises
  const allExercises = useMemo(() => {
    return [...exerciseDatabase, ...customExercises]
  }, [customExercises])

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = new Set(allExercises.map((ex) => ex.category))
    return ["All", ...Array.from(cats)]
  }, [allExercises])

  const muscleGroups = useMemo(() => {
    const muscles = new Set(allExercises.flatMap((ex) => ex.muscleGroups))
    return ["All", ...Array.from(muscles)]
  }, [allExercises])

  const equipmentTypes = useMemo(() => {
    const equipment = new Set(allExercises.flatMap((ex) => ex.equipment || []))
    return ["All", ...Array.from(equipment)]
  }, [allExercises])

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some((muscle) => muscle.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory

      const matchesMuscleGroup = selectedMuscleGroup === "All" || exercise.muscleGroups.includes(selectedMuscleGroup)

      const matchesEquipment =
        selectedEquipment === "All" || (exercise.equipment && exercise.equipment.includes(selectedEquipment))

      return matchesSearch && matchesCategory && matchesMuscleGroup && matchesEquipment
    })
  }, [allExercises, searchTerm, selectedCategory, selectedMuscleGroup, selectedEquipment])

  const favoriteExercisesList = useMemo(() => {
    return allExercises.filter((exercise) => favoriteExercises.includes(exercise.id))
  }, [allExercises, favoriteExercises])

  const handleSelectExercise = (exercise: any) => {
    onSelectExercise(exercise)
    onClose()
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setSelectedMuscleGroup("All")
    setSelectedEquipment("All")
  }

  const ExerciseCard = ({ exercise }: { exercise: any }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium">{exercise.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <FavoriteButton exerciseId={exercise.id} exerciseName={exercise.name} size="icon" variant="ghost" />
          <Button
            size="sm"
            onClick={() => handleSelectExercise(exercise)}
            disabled={selectedExercises.includes(exercise.id)}
          >
            {selectedExercises.includes(exercise.id) ? "Added" : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {exercise.muscleGroups.slice(0, 3).map((muscle: string) => (
          <Badge key={muscle} variant="secondary" className="text-xs">
            {muscle}
          </Badge>
        ))}
        {exercise.muscleGroups.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{exercise.muscleGroups.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{exercise.category}</span>
        <Badge
          variant={
            exercise.difficulty === "Beginner"
              ? "secondary"
              : exercise.difficulty === "Intermediate"
                ? "default"
                : "destructive"
          }
          className="text-xs"
        >
          {exercise.difficulty}
        </Badge>
      </div>

      {exercise.isCustom && (
        <Badge variant="outline" className="text-xs mt-2">
          Custom Exercise
        </Badge>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Exercise Library
          </DialogTitle>
          <DialogDescription>Browse and select exercises for your workout</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={resetFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {muscleGroups.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {muscle}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {equipmentTypes.map((equipment) => (
                    <option key={equipment} value={equipment}>
                      {equipment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exercise List */}
            <ScrollArea className="h-96">
              <div className="grid gap-3 md:grid-cols-2">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exercises found matching your criteria</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-2 bg-transparent">
                    Clear Filters
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid gap-3 md:grid-cols-2">
                {favoriteExercisesList.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
              {favoriteExercisesList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No favorite exercises yet</p>
                  <p className="text-sm">Add exercises to favorites to see them here</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid gap-3 md:grid-cols-2">
                {customExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
              {customExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom exercises created yet</p>
                  <p className="text-sm">Create your own exercises in the Exercise Creator</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
