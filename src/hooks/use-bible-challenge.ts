"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateReadingPlan } from '@/lib/plan-generator';
import { differenceInDays, addDays } from 'date-fns';
import { useToast } from './use-toast';

const CHALLENGE_KEY = 'bible_sprint_challenge';
const PROGRESS_KEY = 'bible_sprint_progress';

export type Duration = 3 | 6 | 9 | 12 | 24;

export interface Challenge {
  duration: Duration;
  startDate: string;
}

export interface Progress {
  day: number;
  completed: boolean;
  dateCompleted: string | null;
}

export interface ReadingDay {
  day: number;
  reading: string;
}

export interface Stats {
  percentComplete: number;
  estimatedEndDate: Date;
  daysSinceStart: number;
  totalDays: number;
}

export interface UseBibleChallengeReturn {
  isLoading: boolean;
  challenge: Challenge | null;
  progress: Progress[];
  readingPlan: ReadingDay[];
  stats: Stats;
  startChallenge: (duration: Duration) => void;
  toggleDay: (dayIndex: number) => void;
  resetChallenge: () => void;
}

export function useBibleChallenge(): UseBibleChallengeReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedChallenge = localStorage.getItem(CHALLENGE_KEY);
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      
      if (savedChallenge) {
        const parsedChallenge: Challenge = JSON.parse(savedChallenge);
        setChallenge(parsedChallenge);
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress));
        } else {
          // If progress is missing, initialize it
          const plan = generateReadingPlan(parsedChallenge.duration);
          setProgress(plan.map(day => ({ day: day.day, completed: false, dateCompleted: null })));
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const readingPlan = useMemo(() => {
    if (!challenge) return [];
    return generateReadingPlan(challenge.duration);
  }, [challenge]);

  const startChallenge = useCallback((duration: Duration) => {
    const newChallenge: Challenge = {
      duration,
      startDate: new Date().toISOString(),
    };
    const plan = generateReadingPlan(duration);
    const newProgress = plan.map(day => ({ day: day.day, completed: false, dateCompleted: null }));
    
    setChallenge(newChallenge);
    setProgress(newProgress);
    
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(newChallenge));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));

    toast({
        title: "Challenge Started!",
        description: `Your ${duration}-month reading plan has begun.`
    });
  }, [toast]);

  const toggleDay = useCallback((dayIndex: number) => {
    setProgress(currentProgress => {
      const newProgress = [...currentProgress];
      const dayToggled = newProgress[dayIndex];
      const wasCompleted = dayToggled.completed;
      
      newProgress[dayIndex] = {
        ...dayToggled,
        completed: !wasCompleted,
        dateCompleted: !wasCompleted ? new Date().toISOString() : null,
      };

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));

      if (!wasCompleted) {
        toast({
            title: `Day ${dayToggled.day} Complete!`,
            description: "Great job on your progress!",
        })
      }

      return newProgress;
    });
  }, [toast]);
  
  const resetChallenge = useCallback(() => {
    setChallenge(null);
    setProgress([]);
    localStorage.removeItem(CHALLENGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    toast({
        title: "Challenge Reset",
        description: "You can start a new challenge anytime."
    });
  }, [toast]);

  const stats = useMemo((): Stats => {
    if (!challenge) {
      return { percentComplete: 0, estimatedEndDate: new Date(), daysSinceStart: 0, totalDays: 0 };
    }
    const startDate = new Date(challenge.startDate);
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);
    const completedDays = progress.filter(p => p.completed).length;
    const totalDays = readingPlan.length;
    const percentComplete = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    const daysPerChapterRead = daysSinceStart > 0 ? (completedDays / daysSinceStart) : 1;
    const remainingDays = totalDays - completedDays;
    const estimatedDaysToFinish = daysPerChapterRead > 0 ? (remainingDays / daysPerChapterRead) : remainingDays;
    const estimatedEndDate = addDays(today, estimatedDaysToFinish);

    return {
      percentComplete,
      estimatedEndDate,
      daysSinceStart,
      totalDays,
    };
  }, [challenge, progress, readingPlan]);

  return { isLoading, challenge, progress, readingPlan, stats, startChallenge, toggleDay, resetChallenge };
}
