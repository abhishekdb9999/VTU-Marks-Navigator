
"use client";

import type * as React from "react";
import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { SemesterResult } from "@/types/vtuCalculator";

interface CgpaTrendChartProps {
  semesterResults: SemesterResult[];
}

const chartConfig = {
  sgpa: {
    label: "SGPA",
    color: "hsl(var(--chart-1))",
  },
  cgpa: {
    label: "CGPA",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function CgpaTrendChart({ semesterResults }: CgpaTrendChartProps) {
  const chartData = useMemo(() => {
    if (!semesterResults || semesterResults.length === 0) {
      return [];
    }

    let cumulativeWeightedSGPA = 0;
    let cumulativeCredits = 0;
    
    return semesterResults
      .sort((a, b) => a.semesterIndex - b.semesterIndex) // Ensure semesters are in order
      .map((result) => {
        cumulativeWeightedSGPA += result.sgpa * result.totalCredits;
        cumulativeCredits += result.totalCredits;
        const currentCGPA = cumulativeCredits > 0 ? parseFloat((cumulativeWeightedSGPA / cumulativeCredits).toFixed(2)) : 0;
        
        return {
          semester: `Sem ${result.semesterIndex + 1}`,
          sgpa: result.sgpa,
          cgpa: currentCGPA,
        };
      });
  }, [semesterResults]);

  if (chartData.length === 0) {
    return (
        <CardDescription className="text-center py-4">Not enough data for CGPA trend.</CardDescription>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -20, // Adjust to show Y-axis labels
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Legend content={<ChartLegendContent />} />
          <Line
            dataKey="sgpa"
            type="monotone"
            stroke="var(--color-sgpa)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-sgpa)",
            }}
            activeDot={{
              r: 6,
            }}
          />
          <Line
            dataKey="cgpa"
            type="monotone"
            stroke="var(--color-cgpa)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-cgpa)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
