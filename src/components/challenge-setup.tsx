"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FastForward, Gauge, Calendar } from "lucide-react";
import type { Duration } from "@/hooks/use-bible-challenge";

const plans = [
  { duration: 3, title: "3 Months", description: "An intense, sprint-like pace.", icon: FastForward },
  { duration: 6, title: "6 Months", description: "A focused and steady journey.", icon: Gauge },
  { duration: 9, title: "9 Months", description: "A comfortable and thorough reading.", icon: Calendar },
  { duration: 12, title: "12 Months", description: "Read through in one year.", icon: Calendar },
  { duration: 24, title: "24 Months", description: "A slow, meditative pace.", icon: Calendar },
] as const;

interface ChallengeSetupProps {
  startChallenge: (duration: Duration) => void;
}

export default function ChallengeSetup({ startChallenge }: ChallengeSetupProps) {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <BookOpen className="h-12 w-12 text-primary" />
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl">
            Bible Sprint
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Choose your pace and embark on a journey through the entire Bible.
          Select a plan to begin your reading challenge today.
        </p>
      </div>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.duration}
            className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
              <plan.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{plan.description}</p>
              <Button
                className="mt-4 w-full"
                onClick={() => startChallenge(plan.duration)}
              >
                Start Challenge
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
