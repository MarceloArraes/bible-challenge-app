import type { Duration, ReadingDay } from '@/hooks/use-bible-challenge';
import { bibleBooks } from './bible-data';

const DURATION_IN_DAYS_MAP: Record<Duration, number> = {
  3: 91, // ~3 months
  6: 182, // ~6 months
  9: 273, // ~9 months
  12: 365,
  24: 730,
};

const allChapters: { book: string; chapter: number }[] = [];
bibleBooks.forEach(book => {
  for (let i = 1; i <= book.chapters; i++) {
    allChapters.push({ book: book.name, chapter: i });
  }
});

const TOTAL_CHAPTERS = allChapters.length; // Should be 1189

export function generateReadingPlan(duration: Duration): ReadingDay[] {
  const totalDays = DURATION_IN_DAYS_MAP[duration];
  const chaptersPerDay = TOTAL_CHAPTERS / totalDays;

  const plan: ReadingDay[] = [];
  let chapterIndex = 0;

  for (let day = 1; day <= totalDays; day++) {
    const startIndex = Math.floor(chapterIndex);
    const endIndex = Math.floor(chapterIndex + chaptersPerDay);

    const todaysChapters = allChapters.slice(startIndex, endIndex);

    if (todaysChapters.length > 0) {
      const first = todaysChapters[0];
      const last = todaysChapters[todaysChapters.length - 1];
      
      let readingString: string;
      if (first.book === last.book) {
        if (first.chapter === last.chapter) {
          readingString = `${first.book} ${first.chapter}`;
        } else {
          readingString = `${first.book} ${first.chapter}-${last.chapter}`;
        }
      } else {
        readingString = `${first.book} ${first.chapter} - ${last.book} ${last.chapter}`;
      }
      plan.push({ day, reading: readingString });
    }
    chapterIndex += chaptersPerDay;
  }
  return plan;
}
