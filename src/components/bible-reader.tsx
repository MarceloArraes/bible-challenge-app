"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibleChallenge } from "@/hooks/use-bible-challenge";

interface BibleReaderProps {
  passage?: string;
  booksAndChapters: { book: string; chapter: number[] }[];
}

interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface PassageText {
  bookname: string;
  chapter: string;
  text: string;
}

const chapterFatorial = (first:number, last:number) =>{
    const allCHaps = []
    
  for(let i=first; i<=last; i++){
    allCHaps.push(i);
  }
  return `${allCHaps.join('-')}`

  }

export function BibleReader({ passage, booksAndChapters }: BibleReaderProps) {
  const [text, setText] = useState<PassageText[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { readingPlan, stats } = useBibleChallenge();

  // const currentDayReading = readingPlan?.[stats?.daysSinceStart];

  useEffect(() => {
    if (!booksAndChapters || booksAndChapters.length === 0) {
      setText(null);
      return;
    }

    const fetchPassages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build all requests
        const requests = booksAndChapters.map(({ book, chapter }) => {
          const range =
            chapter.length > 1
              ? chapterFatorial(chapter[0], chapter[chapter.length - 1])
              : `${chapter[0]}`;
          const url = `https://bible-api.com/${encodeURIComponent(
            `${book} ${range}`
          )}?translation=kjv`;
          return fetch(url).then((res) => res.json());
        });

        const results = await Promise.all(requests);

        // Merge all verses into a single array
        const allVerses: Verse[] = results.flatMap((r) => r.verses ?? []);

        // Group verses by book+chapter
        const groupedByChapter = allVerses.reduce<Record<string, PassageText>>(
          (acc, verse) => {
            const key = `${verse.book_name}-${verse.chapter}`;
            if (!acc[key]) {
              acc[key] = {
                bookname: verse.book_name,
                chapter: verse.chapter.toString(),
                text: "",
              };
            }
            acc[key].text += `\n${verse.verse} ${verse.text}`;
            return acc;
          },
          {}
        );

        const groupedArray = Object.values(groupedByChapter);
        setText(groupedArray);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load passages.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassages();
  }, [booksAndChapters]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
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
    return (
      <p className="text-center text-muted-foreground">
        Select a reading to begin.
      </p>
    );
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
