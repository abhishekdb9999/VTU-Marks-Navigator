
"use client";

import type * as React from "react";
import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { Semester, Grade } from "@/types/vtuCalculator";
import { GRADE_OPTIONS } from "@/types/vtuCalculator";


interface GradeDistributionChartProps {
  allSemestersData: Semester[];
}

const gradeColors: Record<Grade, string> = {
  S: "hsl(var(--chart-1))",
  A: "hsl(var(--chart-2))",
  B: "hsl(var(--chart-3))",
  C: "hsl(var(--chart-4))",
  D: "hsl(var(--chart-5))",
  E: "hsl(var(--muted-foreground))", // Using muted for E
  F: "hsl(var(--destructive))",    // Using destructive for F
};

const chartConfigBase = GRADE_OPTIONS.reduce((acc, grade) => {
  acc[grade as Grade] = {
    label: grade,
    color: gradeColors[grade as Grade],
  };
  return acc;
}, {} as Record<Grade, { label: string; color: string }>);

const chartConfig = chartConfigBase satisfies ChartConfig;


export function GradeDistributionChart({ allSemestersData }: GradeDistributionChartProps) {
  const gradeCounts = useMemo(() => {
    const counts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    let totalSubjects = 0;

    allSemestersData.forEach(semester => {
      semester.subjects.forEach(subject => {
        if (subject.grade) {
          counts[subject.grade]++;
          totalSubjects++;
        }
      });
    });
    
    if (totalSubjects === 0) return [];

    return GRADE_OPTIONS.map(grade => ({
      name: grade,
      value: counts[grade as Grade],
      fill: gradeColors[grade as Grade],
    })).filter(item => item.value > 0);
  }, [allSemestersData]);

  if (gradeCounts.length === 0) {
    return (
        <CardDescription className="text-center py-4">No subject data for grade distribution.</CardDescription>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={gradeCounts}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (percent * 100) > 5 ? ( // Only show label if percent > 5%
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                  {`${gradeCounts[index].name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              ) : null;
            }}
          >
            {gradeCounts.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
           <Legend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
