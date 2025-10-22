
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateReadingPlan } from '@/lib/plan-generator';
import { differenceInDays, addDays } from 'date-fns';
import { useToast } from './use-toast';

const CHALLENGE_KEY = 'bible_sprint_challenge';
const PROGRESS_KEY = 'bible_sprint_progress';
const CURRENT_INDEX_KEY = 'bible_sprint_current_index';

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
  currentReadingIndex: number;
  setCurrentReadingIndex: (index: number) => void;
}

export function useBibleChallenge(): UseBibleChallengeReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentReadingIndex, setCurrentReadingIndexState] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      const savedChallenge = localStorage.getItem(CHALLENGE_KEY);
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      const savedIndex = localStorage.getItem(CURRENT_INDEX_KEY);
      
      if (savedChallenge) {
        const parsedChallenge: Challenge = JSON.parse(savedChallenge);
        setChallenge(parsedChallenge);

        if (savedProgress) {
          setProgress(JSON.parse(savedProgress));
        } else {
          const plan = generateReadingPlan(parsedChallenge.duration);
          setProgress(plan.map(day => ({ day: day.day, completed: false, dateCompleted: null })));
        }

        const startDate = new Date(parsedChallenge.startDate);
        const today = new Date();
        const daysSinceStart = differenceInDays(today, startDate);
        const initialIndex = savedIndex ? parseInt(savedIndex, 10) : (daysSinceStart >= 0 ? daysSinceStart : 0);
        setCurrentReadingIndexState(initialIndex);

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

  const setCurrentReadingIndex = useCallback((index: number) => {
    if (index >= 0 && index < readingPlan.length) {
      setCurrentReadingIndexState(index);
      localStorage.setItem(CURRENT_INDEX_KEY, index.toString());
    }
  }, [readingPlan.length]);

  const startChallenge = useCallback((duration: Duration) => {
    const newChallenge: Challenge = {
      duration,
      startDate: new Date().toISOString(),
    };
    const plan = generateReadingPlan(duration);
    const newProgress = plan.map(day => ({ day: day.day, completed: false, dateCompleted: null }));
    
    setChallenge(newChallenge);
    setProgress(newProgress);
    setCurrentReadingIndexState(0);
    
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(newChallenge));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    localStorage.setItem(CURRENT_INDEX_KEY, '0');

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
    setCurrentReadingIndexState(0);
    localStorage.removeItem(CHALLENGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(CURRENT_INDEX_KEY);
    toast({
        title: "Challenge Reset",
        description: "You can start a new challenge anytime."
    });
  }, [toast]);

  const stats = useMemo((): Stats => {
    if (!challenge || readingPlan.length === 0) {
      return { percentComplete: 0, estimatedEndDate: new Date(), daysSinceStart: 0, totalDays: 0 };
    }
    
    const startDate = new Date(challenge.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.max(0, differenceInDays(today, startDate));
    const completedDays = progress.filter(p => p.completed).length;
    const totalDays = readingPlan.length;
    const percentComplete = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    let estimatedEndDate;
    const remainingReadings = totalDays - completedDays;

    if (remainingReadings <= 0) {
      // Challenge is complete
      const lastCompletionDate = progress
        .filter(p => p.completed && p.dateCompleted)
        .reduce((latest, p) => {
            const d = new Date(p.dateCompleted!);
            return d > latest ? d : latest;
        }, new Date(0));
      estimatedEndDate = lastCompletionDate > new Date(0) ? lastCompletionDate : today;
    } else if (completedDays === 0) {
      // No progress yet, assume they start today and follow the plan
      estimatedEndDate = addDays(today, totalDays - daysSinceStart -1);
    } else {
      const daysPassed = daysSinceStart + 1;
      const pace = completedDays / daysPassed; // readings per day
      const remainingDaysToFinish = remainingReadings / pace;
      estimatedEndDate = addDays(today, Math.ceil(remainingDaysToFinish));
    }

    return {
      percentComplete,
      estimatedEndDate,
      daysSinceStart,
      totalDays,
    };
  }, [challenge, progress, readingPlan]);

  // Adjust index if it's out of bounds
   useEffect(() => {
    if (readingPlan.length > 0 && currentReadingIndex >= readingPlan.length) {
      setCurrentReadingIndex(readingPlan.length - 1);
    }
  }, [currentReadingIndex, readingPlan.length, setCurrentReadingIndex]);


  return { isLoading, challenge, progress, readingPlan, stats, startChallenge, toggleDay, resetChallenge, currentReadingIndex, setCurrentReadingIndex };
}
