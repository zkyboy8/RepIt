"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

interface ExerciseVideoPlayerProps {
  exercise: {
    name: string
    videoUrl?: string
    instructions: string[]
    tips: string[]
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    muscleGroups: string[]
  }
}

export default function ExerciseVideoPlayer({ exercise }: ExerciseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([100])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const volumeValue = value[0] / 100
    video.volume = volumeValue
    setVolume(value)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const seekTime = (value[0] / 100) * duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const restartVideo = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setCurrentTime(0)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{exercise.name}</CardTitle>
              <CardDescription>Exercise demonstration and instructions</CardDescription>
            </div>
            <Badge
              variant={
                exercise.difficulty === "Beginner"
                  ? "secondary"
                  : exercise.difficulty === "Intermediate"
                    ? "default"
                    : "destructive"
              }
            >
              {exercise.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={exercise.videoUrl || "/placeholder-video.mp4"}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={restartVideo} className="text-white hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <div className="w-20">
                    <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                  </div>
                  <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <h4 className="font-medium mb-2">Target Muscles</h4>
            <div className="flex flex-wrap gap-2">
              {exercise.muscleGroups.map((muscle) => (
                <Badge key={muscle} variant="outline">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {exercise.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
