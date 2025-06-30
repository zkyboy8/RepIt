"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavoritesStore } from "@/lib/favorites-store"
import { toast } from "@/hooks/use-toast"

interface FavoriteButtonProps {
  exerciseId: string
  exerciseName: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function FavoriteButton({
  exerciseId,
  exerciseName,
  variant = "ghost",
  size = "icon",
}: FavoriteButtonProps) {
  const { isFavoriteExercise, addFavoriteExercise, removeFavoriteExercise } = useFavoritesStore()

  const isFavorite = isFavoriteExercise(exerciseId)

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteExercise(exerciseId)
      toast({
        title: "Removed from favorites",
        description: `${exerciseName} has been removed from your favorites`,
      })
    } else {
      addFavoriteExercise(exerciseId)
      toast({
        title: "Added to favorites",
        description: `${exerciseName} has been added to your favorites`,
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {size !== "icon" && <span className="ml-2">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>}
    </Button>
  )
}
