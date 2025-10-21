"use client";

import ProgressGrid from "@/components/progress-grid";
import ProgressSummary from "@/components/progress-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UseBibleChallengeReturn } from "@/hooks/use-bible-challenge";
import { BookOpen, RefreshCw, Bookmark } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ReadingChallenge({
  readingPlan,
  progress,
  toggleDay,
  stats,
  resetChallenge,
}: UseBibleChallengeReturn) {
  
  const currentDayIndex = stats.daysSinceStart < readingPlan.length ? stats.daysSinceStart : readingPlan.length -1;
  const todaysReading = readingPlan[currentDayIndex];

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold">
              Bible Sprint
            </h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Challenge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  current progress and return you to the setup screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetChallenge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, reset it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-1">
            <ProgressSummary stats={stats} />
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Bookmark className="h-6 w-6" />
                        Today's Reading
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-primary font-headline">
                        {todaysReading?.reading || "Challenge Complete!"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Day {todaysReading?.day || stats.totalDays} of {stats.totalDays}
                    </p>
                </CardContent>
             </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Your Reading Grid</CardTitle>
                <CardContent className="p-0 pt-4">
                  <ProgressGrid
                    readingPlan={readingPlan}
                    progress={progress}
                    toggleDay={toggleDay}
                    daysSinceStart={stats.daysSinceStart}
                  />
                  <div className="mt-4 flex items-center justify-end gap-4 text-sm">
                      <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm bg-muted"></div>
                          <span>Future</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm bg-destructive"></div>
                          <span>Behind</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-sm bg-green-600"></div>
                          <span>Complete</span>
                      </div>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
