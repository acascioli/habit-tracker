"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Define types for the chart data
type LineChartLabelsProps = {
  data: { weight: number; date: Date }[]; // We expect the data to be in {weight, date} format
}

const chartConfig = {
  desktop: {
    label: "Weight",
    color: "hsl(var(--chart-1))", // Can customize colors if needed
  },
}

export function LineChartLabels({ data }: LineChartLabelsProps) {
  // Sort the data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Map the weight data to the required format for recharts
  const chartData = sortedData.map((entry) => ({
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(entry.date)), // Format the date as short month
    weight: entry.weight, // Map the weight
  }))

  // Calculate the trend by comparing the last entry with the second-to-last entry
  const lastWeight = sortedData[sortedData.length - 1]?.weight
  const secondLastWeight = sortedData[sortedData.length - 2]?.weight
  let trend = 0

  if (lastWeight != null && secondLastWeight != null) {
    trend = ((lastWeight - secondLastWeight) / secondLastWeight) * 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Over Time</CardTitle>
        <CardDescription>Showing weight changes over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="weight"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {trend > 0 ? "up" : trend < 0 ? "down" : "flat"} by {Math.abs(trend).toFixed(2)}% this month {trend > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total weight changes over the past months
        </div>
      </CardFooter>
    </Card>
  )
}
