"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibleChallenge } from "@/hooks/use-bible-challenge";

interface BibleReaderProps {
  passage: string | undefined;
  books: string 
  chapters: string
}

interface Verse {
  
    book_id: string;
    book_name: string
    chapter: number;
    verse: number;
    text: string;

}

interface PassageText {
  bookname: string;
  chapter: string;
  text: string;
}

const chapterBreaker = (books: string, chapters:string) => {

  const allCHaps = []

  for(let i=parseInt(chapters.split(' ')[0]); i<=parseInt(chapters.split(' ')[1]); i++){
    allCHaps.push(i);
  }
  return `${books} ${allCHaps.join('-')}`
}

export function BibleReader({ passage, books, chapters }: BibleReaderProps) {
  const [text, setText] = useState<PassageText[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {readingPlan, currentReadingIndex, stats} = useBibleChallenge();
  console.log('readingPlan, currentReadingIndex, ',readingPlan, currentReadingIndex);
  console.log('stats',stats);
  const currentDayReading = readingPlan[stats.daysSinceStart];
  console.log('currentDayReading', currentDayReading);
  console.log('readingPlan[stats.daysSinceStart]?.reading', readingPlan[stats.daysSinceStart]?.reading);
  console.log('passage',passage);

  const allChaps = chapterBreaker(books, chapters)

  console.log('allChaps', allChaps);
  

  useEffect(() => {
    if (!passage) {
      setText(null);
      return;
    }

    const fetchPassage = async () => {
      setIsLoading(true);
      setError(null);
      setText(null);
      try {
        const response = await fetch(`https://bible-api.com/${allChaps}?translation=kjv`);
        if (!response.ok) {
          throw new Error(`Failed to fetch passage. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        const verses = data.verses;

        const groupedByChapter = verses.reduce((acc: PassageText[], verse: Verse) => {
            const chapterNum = verse.chapter;
            if (!acc[chapterNum]) {
                acc[chapterNum] = {
                    bookname: verse.book_name,
                    chapter: chapterNum.toString(),
                    text: ''
                };
            }
            acc[chapterNum].text += `${verse.verse} ${verse.text}`;
            
            return acc;
        }, {} as Record<string, PassageText>);

        const result = Object.values(groupedByChapter) as PassageText[];
        
        setText(result);

      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassage();
  }, [passage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!text || text.length === 0) {
    return <p className="text-center text-muted-foreground">Select a reading to begin.</p>;
  }

  return (
    <ScrollArea className="h-96 w-full pr-4">
      <div className="space-y-6">
        {text.map((chapterText) => (
          <div key={`${chapterText.bookname}-${chapterText.chapter}`}>
            <h3 className="font-headline text-2xl font-bold mb-4">
              {chapterText.bookname} {chapterText.chapter}
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed">
              {chapterText.text.trim()}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
