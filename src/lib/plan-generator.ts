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
    // aqui eu tenho no primeiro index o primeiro livro e primeiro capitulo.
    // ultimo index o ultimo livro com o ultimo capitulo.
    // [{book: 1 timothy, chapters: 1,2,3,4},{book: titus: chapters:1}]

    /* 
    : {
    book: string;
    chapter: number;
    }[]
    */

    const grouped  = todaysChapters.reduce<Record<string, number[]>>((acc, { book, chapter }) => {
      if (!acc[book]) acc[book] = [];
      acc[book].push(chapter);
      return acc;
    }, {});

    console.log('grouped ', grouped );

    if (todaysChapters.length > 0) {
      const first = todaysChapters[0];
      const last = todaysChapters[todaysChapters.length - 1];
      
      let readingString: string;
      const booksAndChapters: { book: string; chapter: number[] }[] = [];
      let chapters: string;
      let books: string[]=[];
      if (first.book === last.book) {
          booksAndChapters.push({ book: first.book, chapter: grouped[first.book] });
          books.push(`${first.book}`);
          
        if (first.chapter === last.chapter) {
          readingString = `${first.book} ${first.chapter}`;
          chapters=`${first.chapter}`;
          // booksAndChapters[`${first.book}`].push(first.chapter);
        } else {
          // booksAndChapters[`${first.book}`].push(chapterFatorial(first.chapter, last.chapter));

          readingString = `${first.book} ${first.chapter}-${last.chapter}`;
          chapters=`${first.chapter} ${last.chapter}`;
          // const chapters2=chapterFatorial(first.chapter, last.chapter);
        }
      } else {
        readingString = `${first.book} ${first.chapter} - ${last.book} ${last.chapter}`;

            booksAndChapters.push(
          { book: first.book, chapter: grouped[first.book] },
          { book: last.book, chapter: grouped[last.book] }
        );

        // for each book add the chapters 
        chapters=`${first.chapter} ${last.chapter}`;
        books.push(`${first.book}`);
        books.push(`${last.book}`);

      }
      plan.push({ day, reading: readingString, books, chapters, booksAndChapters });
    }
    chapterIndex += chaptersPerDay;
  }
  return plan;
}
