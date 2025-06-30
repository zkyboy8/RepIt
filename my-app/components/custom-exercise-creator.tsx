"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Save, Dumbbell } from "lucide-react"
import { useCustomExerciseStore } from "@/lib/custom-exercise-store"
import { toast } from "@/hooks/use-toast"

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Cardio",
]

const equipmentOptions = [
  "Bodyweight",
  "Dumbbells",
  "Barbell",
  "Resistance Bands",
  "Cable Machine",
  "Pull-up Bar",
  "Kettlebell",
  "Medicine Ball",
  "Suspension Trainer",
  "Bench",
]

export default function CustomExerciseCreator() {
  const { addCustomExercise } = useCustomExerciseStore()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: [""],
    tips: [""],
    muscleGroups: [] as string[],
    equipment: [] as string[],
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    category: "Strength" as "Strength" | "Cardio" | "Flexibility" | "Sports",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: "instructions" | "tips", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: "instructions" | "tips") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: "instructions" | "tips", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleMuscleGroupToggle = (muscle: string) => {
    setFormData((prev) => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter((m) => m !== muscle)
        : [...prev.muscleGroups, muscle],
    }))
  }

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Exercise name is required",
        variant: "destructive",
      })
      return
    }

    if (formData.muscleGroups.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one muscle group",
        variant: "destructive",
      })
      return
    }

    const customExercise = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      instructions: formData.instructions.filter((i) => i.trim()),
      tips: formData.tips.filter((t) => t.trim()),
      muscleGroups: formData.muscleGroups,
      equipment: formData.equipment,
      difficulty: formData.difficulty,
      category: formData.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }

    addCustomExercise(customExercise)

    toast({
      title: "Success!",
      description: `${formData.name} has been added to your custom exercises`,
    })

    // Reset form
    setFormData({
      name: "",
      description: "",
      instructions: [""],
      tips: [""],
      muscleGroups: [],
      equipment: [],
      difficulty: "Beginner",
      category: "Strength",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Create Custom Exercise
          </CardTitle>
          <CardDescription>
            Design your own exercises with detailed instructions and targeting information
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Modified Push-up"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strength">Strength</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                    <SelectItem value="Flexibility">Flexibility</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the exercise..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Muscles *</CardTitle>
            <CardDescription>Select all muscle groups this exercise targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {muscleGroups.map((muscle) => (
                <div key={muscle} className="flex items-center space-x-2">
                  <Checkbox
                    id={muscle}
                    checked={formData.muscleGroups.includes(muscle)}
                    onCheckedChange={() => handleMuscleGroupToggle(muscle)}
                  />
                  <Label htmlFor={muscle} className="text-sm font-normal cursor-pointer">
                    {muscle}
                  </Label>
                </div>
              ))}
            </div>
            {formData.muscleGroups.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Selected muscles:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.muscleGroups.map((muscle) => (
                    <Badge key={muscle} variant="secondary">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
            <CardDescription>Select equipment needed for this exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {equipmentOptions.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={formData.equipment.includes(equipment)}
                    onCheckedChange={() => handleEquipmentToggle(equipment)}
                  />
                  <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
            {formData.equipment.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Required equipment:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.equipment.map((equipment) => (
                    <Badge key={equipment} variant="outline">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Step-by-step instructions for performing the exercise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={instruction}
                    onChange={(e) => handleArrayChange("instructions", index, e.target.value)}
                    placeholder={`Step ${index + 1}...`}
                  />
                  {formData.instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("instructions", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("instructions")} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro Tips</CardTitle>
            <CardDescription>Helpful tips for proper form and technique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  •
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={tip}
                    onChange={(e) => handleArrayChange("tips", index, e.target.value)}
                    placeholder={`Tip ${index + 1}...`}
                  />
                  {formData.tips.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem("tips", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("tips")} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Tip
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Create Exercise
          </Button>
        </div>
      </form>
    </div>
  )
}
