"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReadingDay, Progress } from "@/hooks/use-bible-challenge";
import { Check } from "lucide-react";

interface ProgressGridProps {
  readingPlan: ReadingDay[];
  progress: Progress[];
  toggleDay: (dayIndex: number) => void;
  daysSinceStart: number;
}

export default function ProgressGrid({ readingPlan, progress, toggleDay, daysSinceStart }: ProgressGridProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-12 gap-1.5 md:grid-cols-20 lg:grid-cols-30 xl:grid-cols-40">
        {readingPlan.map((day, index) => {
          const isCompleted = progress[index]?.completed;
          const isPast = index < daysSinceStart;
          const isToday = index === daysSinceStart;
          const isBehind = isPast && !isCompleted;

          return (
            <Tooltip key={day.day}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleDay(index)}
                  aria-label={`Day ${day.day}: ${day.reading}`}
                  className={cn(
                    "group relative aspect-square h-5 w-5 rounded-sm transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-muted hover:bg-accent",
                    isBehind && "bg-destructive hover:bg-destructive/80",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {isCompleted && (
                    <Check className="absolute inset-0 m-auto h-3 w-3 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Day {day.day}</p>
                <p>{day.reading}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
