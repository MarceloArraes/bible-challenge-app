"use client";

import { useBibleChallenge } from '@/hooks/use-bible-challenge';
import ChallengeSetup from '@/components/challenge-setup';
import ReadingChallenge from '@/components/reading-challenge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientWrapper() {
  const challengeState = useBibleChallenge();

  if (challengeState.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return challengeState.challenge ? (
    <ReadingChallenge {...challengeState} />
  ) : (
    <ChallengeSetup startChallenge={challengeState.startChallenge} />
  );
}
