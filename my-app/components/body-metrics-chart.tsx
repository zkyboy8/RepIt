"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { usePersonalDataStore } from "@/lib/personal-data-store"

interface BodyMetricsChartProps {
  metric: string
  title: string
  unit: string
  color?: string
}

export default function BodyMetricsChart({ metric, title, unit, color = "#3b82f6" }: BodyMetricsChartProps) {
  const { bodyMetrics } = usePersonalDataStore()
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("3M")

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case "1M":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6M":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "1Y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "ALL":
        startDate = new Date(0) // Beginning of time
        break
    }

    return bodyMetrics
      .filter((entry) => new Date(entry.date) >= startDate)
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString(),
        value: entry[metric as keyof typeof entry] as number,
        fullDate: entry.date,
      }))
      .filter((entry) => entry.value !== undefined && entry.value !== null)
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  }

  const chartData = getFilteredData()

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return { direction: "neutral", change: 0 }

    const firstValue = chartData[0].value
    const lastValue = chartData[chartData.length - 1].value
    const change = lastValue - firstValue
    const percentChange = (change / firstValue) * 100

    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      change: Math.abs(change),
      percentChange: Math.abs(percentChange),
    }
  }

  const trend = getTrend()

  const formatTooltipValue = (value: number) => {
    return `${value} ${unit}`
  }

  const formatTooltipLabel = (label: string) => {
    return `Date: ${label}`
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">No Data</Badge>
          </CardTitle>
          <CardDescription>No {title.toLowerCase()} data available for the selected time range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start tracking your {title.toLowerCase()} to see progress charts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {trend.direction === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
              {trend.direction === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
              {trend.direction === "neutral" && <Minus className="h-4 w-4 text-gray-600" />}
            </CardTitle>
            <CardDescription>
              {chartData.length} data points over {timeRange === "ALL" ? "all time" : timeRange}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {chartData[chartData.length - 1]?.value} {unit}
            </div>
            {trend.direction !== "neutral" && (
              <div className={`text-sm ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.direction === "up" ? "+" : "-"}
                {trend.change.toFixed(1)} {unit} ({trend.percentChange.toFixed(1)}%)
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(["1M", "3M", "6M", "1Y", "ALL"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip formatter={formatTooltipValue} labelFormatter={formatTooltipLabel} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Lowest</div>
              <div className="font-medium">
                {Math.min(...chartData.map((d) => d.value)).toFixed(1)} {unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="font-medium">
                {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)} {unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Highest</div>
              <div className="font-medium">
                {Math.max(...chartData.map((d) => d.value)).toFixed(1)} {unit}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
